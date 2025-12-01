const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadToR2, deleteFromR2 } = require('../config/r2');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
});

// GET /api/books - Get all books with filters and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { class: classNum, subjectId, search, page = 1, limit = 10 } = req.query;
    
    const where = {};
    if (classNum) where.class = parseInt(classNum);
    if (subjectId) where.subjectId = subjectId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          subject: true,
          _count: {
            select: { chapters: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET /api/books/:id - Get single book
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        chapters: {
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// POST /api/books - Create new book (Admin only)
router.post('/', authenticateToken, requireAdmin, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, class: classNum, subjectId, publisher, edition, year } = req.body;

    if (!title || !classNum || !subjectId) {
      return res.status(400).json({ error: 'Title, class, and subject are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Cover image is required' });
    }

    // Upload cover image
    const coverImageResult = await uploadToR2(req.file, 'covers');

    // Create book in database
    const book = await prisma.book.create({
      data: {
        title,
        description,
        class: parseInt(classNum),
        subjectId,
        publisher: publisher || 'NCERT',
        edition,
        year: year ? parseInt(year) : null,
        coverImage: coverImageResult.url,
      },
      include: {
        subject: true,
        _count: {
          select: { chapters: true },
        },
      },
    });

    res.status(201).json({
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// PUT /api/books/:id - Update book (Admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, class: classNum, subjectId, publisher, edition, year } = req.body;

    const existingBook = await prisma.book.findUnique({
      where: { id: req.params.id },
    });

    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (classNum) updateData.class = parseInt(classNum);
    if (subjectId) updateData.subjectId = subjectId;
    if (publisher) updateData.publisher = publisher;
    if (edition !== undefined) updateData.edition = edition;
    if (year) updateData.year = parseInt(year);

    // If new cover image is uploaded
    if (req.file) {
      const coverImageResult = await uploadToR2(req.file, 'covers');
      updateData.coverImage = coverImageResult.url;
    }

    const book = await prisma.book.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        subject: true,
        _count: {
          select: { chapters: true },
        },
      },
    });

    res.json({
      message: 'Book updated successfully',
      book,
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE /api/books/:id - Delete book (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: {
        chapters: true,
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Delete all chapter PDFs from R2
    for (const chapter of book.chapters) {
      if (chapter.pdfKey) {
        await deleteFromR2(chapter.pdfKey);
      }
    }

    // Delete book from database (chapters will be handled by cascade)
    await prisma.book.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
