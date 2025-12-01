const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadToR2, deleteFromR2 } = require('../config/r2');

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  },
});

// GET /api/chapters - Get all chapters with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { bookId, search, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (bookId) where.bookId = bookId;
    
    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [chapters, total] = await Promise.all([
      prisma.chapter.findMany({
        where,
        include: {
          book: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { chapterNumber: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.chapter.count({ where }),
    ]);

    res.json({
      chapters,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// GET /api/chapters/:id - Get single chapter
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: {
        book: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

// POST /api/chapters - Create new chapter (Admin only)
router.post('/', authenticateToken, requireAdmin, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'chapterImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { bookId, chapterNumber, title, description, pageRange } = req.body;

    if (!bookId || !chapterNumber || !title) {
      return res.status(400).json({ error: 'Book ID, chapter number, and title are required' });
    }

    let pdfUrl = null;
    let pdfKey = null;
    let fileSize = null;
    let chapterImage = null;

    // Upload PDF if provided
    if (req.files?.pdf) {
      const uploadResult = await uploadToR2(req.files.pdf[0], 'chapters');
      pdfUrl = uploadResult.url;
      pdfKey = uploadResult.key;
      fileSize = uploadResult.size;
    }

    // Upload chapter image if provided
    if (req.files?.chapterImage) {
      const imageResult = await uploadToR2(req.files.chapterImage[0], 'chapter-images');
      chapterImage = imageResult.url;
    }

    const chapter = await prisma.chapter.create({
      data: {
        bookId,
        chapterNumber: parseInt(chapterNumber),
        title,
        description,
        pageRange,
        chapterImage,
        pdfUrl,
        pdfKey,
        fileSize,
      },
      include: {
        book: {
          include: {
            subject: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Chapter created successfully',
      chapter,
    });
  } catch (error) {
    console.error('Create chapter error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Chapter number already exists for this book' });
    }
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// PUT /api/chapters/:id - Update chapter (Admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'chapterImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { chapterNumber, title, description, pageRange } = req.body;

    const existingChapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
    });

    if (!existingChapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const updateData = {};
    if (chapterNumber) updateData.chapterNumber = parseInt(chapterNumber);
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pageRange !== undefined) updateData.pageRange = pageRange;

    // If new PDF is uploaded, replace the old one
    if (req.files?.pdf) {
      if (existingChapter.pdfKey) {
        await deleteFromR2(existingChapter.pdfKey);
      }
      
      const { url, key, size } = await uploadToR2(req.files.pdf[0], 'chapters');
      updateData.pdfUrl = url;
      updateData.pdfKey = key;
      updateData.fileSize = size;
    }

    // If new chapter image is uploaded
    if (req.files?.chapterImage) {
      const imageResult = await uploadToR2(req.files.chapterImage[0], 'chapter-images');
      updateData.chapterImage = imageResult.url;
    }

    const chapter = await prisma.chapter.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        book: {
          include: {
            subject: true,
          },
        },
      },
    });

    res.json({
      message: 'Chapter updated successfully',
      chapter,
    });
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// DELETE /api/chapters/:id - Delete chapter (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Delete PDF from R2 if exists
    if (chapter.pdfKey) {
      await deleteFromR2(chapter.pdfKey);
    }

    // Delete chapter from database
    await prisma.chapter.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

module.exports = router;
