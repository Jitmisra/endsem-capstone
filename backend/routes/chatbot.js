const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Chat with NCERT Master Bot
router.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { chapterId, question, chatHistory = [] } = req.body;

    if (!question || !chapterId) {
      return res.status(400).json({ error: 'Question and chapterId are required' });
    }

    // Fetch chapter details for context
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        book: {
          include: { subject: true }
        }
      }
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Build context for the AI
    const systemContext = `You are NCERT Master Bot, an expert AI tutor specializing in NCERT curriculum. You are currently helping a student with:

Subject: ${chapter.book?.subject?.name || 'Unknown'}
Class: ${chapter.book?.class || 'Unknown'}
Book: ${chapter.book?.title || 'Unknown'}
Chapter ${chapter.chapterNumber}: ${chapter.title}
${chapter.description ? `Chapter Description: ${chapter.description}` : ''}

Your role:
1. Answer questions related to this chapter's content accurately
2. Explain concepts in simple, easy-to-understand language
3. Provide examples when helpful
4. If asked about topics outside this chapter, politely redirect to the chapter content
5. Be encouraging and supportive to students
6. Use bullet points and formatting for clarity when needed
7. If you don't know something specific to the chapter, say so honestly

Remember: You are an educational assistant focused on helping students understand NCERT content.`;

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation history
    const history = [
      {
        role: 'user',
        parts: [{ text: systemContext + '\n\nPlease acknowledge you understand your role.' }]
      },
      {
        role: 'model',
        parts: [{ text: `I understand! I'm NCERT Master Bot, ready to help you with Chapter ${chapter.chapterNumber}: "${chapter.title}" from your ${chapter.book?.subject?.name} textbook for Class ${chapter.book?.class}. Feel free to ask me any questions about this chapter!` }]
      }
    ];

    // Add chat history
    chatHistory.forEach(msg => {
      history.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Start chat with history
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Send the question
    const result = await chat.sendMessage(question);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({
      response: aiResponse,
      chapter: {
        id: chapter.id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to process your question' });
  }
});

// Quick AI answer for search
router.post('/quick-answer', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are NCERT Master Bot, an AI tutor for NCERT curriculum (Class 1-12, India).
    
Answer this question briefly and helpfully (2-3 sentences max):
"${question}"

If it's about NCERT subjects (Math, Science, English, Hindi, Social Science, Physics, Chemistry, Biology, etc.), give a direct educational answer.
If it's not related to education/NCERT, politely say you can help with NCERT topics.
Keep the response concise and student-friendly.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({ answer: aiResponse });

  } catch (error) {
    console.error('Quick answer error:', error);
    res.status(500).json({ error: 'Failed to get AI answer' });
  }
});

module.exports = router;
