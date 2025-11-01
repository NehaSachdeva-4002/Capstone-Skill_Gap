// backend/routes/chatbotRoutes.js

const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');

/**
 * POST /api/chatbot/init
 * Initialize a new chat session with user context
 */
router.post('/init', async (req, res) => {
  try {
    const { userId, context } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!context || Object.keys(context).length === 0) {
      return res.status(400).json({ 
        error: 'Context is required (resume, jobDescription, skillGapAnalysis, or learningRoadmap)' 
      });
    }

    console.log(`Initializing chat session for user: ${userId}`);

    const session = await chatbotService.createChatSession(userId, context);
    const suggestions = chatbotService.getSuggestedQuestions(context);

    res.json({
      success: true,
      session,
      suggestedQuestions: suggestions,
      message: 'Chat session initialized. You can now ask questions!'
    });

  } catch (error) {
    console.error('Chat init error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize chat session',
      details: error.message 
    });
  }
});

/**
 * POST /api/chatbot/message
 * Send a message and get response (non-streaming)
 */
router.post('/message', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID and message are required' });
    }

    console.log(`User ${userId} asked: ${message}`);

    const response = await chatbotService.sendMessage(userId, message);

    res.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

/**
 * POST /api/chatbot/stream
 * Send a message and get streaming response (SSE)
 */
router.post('/stream', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID and message are required' });
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    console.log(`Streaming response for user ${userId}: ${message}`);

    // Send tokens as they arrive
    await chatbotService.sendMessage(userId, message, (token) => {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    });

    // Send completion signal
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Chat stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/chatbot/session/:userId
 * Get session info
 */
router.get('/session/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const sessionInfo = chatbotService.getSessionInfo(userId);

    if (!sessionInfo) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session: sessionInfo
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/chatbot/session/:userId
 * Clear chat session
 */
router.delete('/session/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    chatbotService.clearSession(userId);

    res.json({
      success: true,
      message: 'Chat session cleared'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chatbot/health
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chatbot-service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
