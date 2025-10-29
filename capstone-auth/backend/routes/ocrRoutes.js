const express = require('express');
const router = express.Router();
const multer = require('multer');
const ocrController = require('../controllers/ocrController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|tiff|pdf)$/i)) {
      return cb(new Error('Only image and PDF files are allowed!'), false);
    }
    
    // Set the correct mimetype based on file extension
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      file.mimetype = 'application/pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(ext)) {
      file.mimetype = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    }
    
    cb(null, true);
  }
});

// Route for processing resume images
router.post('/process-resume', upload.single('resume'), ocrController.processResume);

module.exports = router;