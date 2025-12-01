const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/subjects - Get all subjects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { class: classNum } = req.query;
    
    const where = {};
    if (classNum) where.class = parseInt(classNum);

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: [{ class: 'asc' }, { name: 'asc' }],
    });

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/subjects/:id - Get single subject
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: {
        books: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// POST /api/subjects - Create new subject (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, class: classNum } = req.body;

    if (!name || !classNum) {
      return res.status(400).json({ error: 'Name and class are required' });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        class: parseInt(classNum),
      },
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Subject already exists for this class' });
    }
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// PUT /api/subjects/:id - Update subject (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, class: classNum } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (classNum) updateData.class = parseInt(classNum);

    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      message: 'Subject updated successfully',
      subject,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Subject not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Subject already exists for this class' });
    }
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// DELETE /api/subjects/:id - Delete subject (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.subject.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Subject not found' });
    }
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

module.exports = router;
