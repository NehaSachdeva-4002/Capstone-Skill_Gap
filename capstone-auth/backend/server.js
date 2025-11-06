require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const courseRoutes = require('./routes/courseRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
const port = process.env.PORT || 8081;

// Middleware
app.use(cors({
  origin: ['http://capstone-frontend-skill-gap.s3-website-us-east-1.amazonaws.com'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/skills', skillsRoutes); // Enhanced skill analysis and roadmap generation
app.use('/api/ocr', ocrRoutes); // Legacy OCR endpoint for backward compatibility
app.use('/api/chatbot', chatbotRoutes); // AI Career Advisor chatbot endpoints

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Basic route for testing
app.get('/', (req, res) => res.send('Backend running!'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.message === 'Only image files are allowed!') {
        res.status(400).json({ error: err.message });
    } else {
        res.status(500).json({ error: 'Something went wrong!' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});