const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all bookmarks for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.userId },
      include: {
        chapter: {
          include: {
            book: {
              include: { subject: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Check if a chapter is bookmarked
router.get('/check/:chapterId', authenticateToken, async (req, res) => {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_chapterId: {
          userId: req.user.userId,
          chapterId: req.params.chapterId
        }
      }
    });
    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
});

// Toggle bookmark (add or remove)
router.post('/toggle/:chapterId', authenticateToken, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.userId;

    const existing = await prisma.bookmark.findUnique({
      where: { userId_chapterId: { userId, chapterId } }
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id }
      });
      res.json({ isBookmarked: false, message: 'Bookmark removed' });
    } else {
      await prisma.bookmark.create({
        data: { userId, chapterId }
      });
      res.json({ isBookmarked: true, message: 'Bookmark added' });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Delete a bookmark
router.delete('/:chapterId', authenticateToken, async (req, res) => {
  try {
    await prisma.bookmark.deleteMany({
      where: {
        userId: req.user.userId,
        chapterId: req.params.chapterId
      }
    });
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

module.exports = router;
