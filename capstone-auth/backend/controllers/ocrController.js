const ocrService = require('../services/ocrService');

/**
 * Process a resume image using OCR
 * @param {Object} req - Express request object with file in req.file
 * @param {Object} res - Express response object
 */
const processResume = async (req, res) => {
  try {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    console.log('Received file:', req.file.originalname, 'Type:', req.file.mimetype, 'Size:', req.file.size);
    
    // Validate file size
    if (req.file.size === 0) {
      return res.status(400).json({
        success: false,
        message: 'Empty file uploaded'
      });
    }

    // Validate file type
    if (!req.file.mimetype.includes('pdf') && !req.file.mimetype.includes('image')) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Please upload a PDF or image file.'
      });
    }

    // Process the file (PDF or image) with OCR service
    const result = await ocrService.processResume(req.file);
    
    // Return both raw text and structured data
    console.log('Sending response to client with data');
    return res.status(200).json({
      success: true,
      data: {
        raw_text: result.raw_text || '',
        parsedResume: result.parsedResume || {
          name: '',
          contact: { email: '', phone: '', linkedin: '', github: '' },
          education: [],
          experience: [],
          skills: [],
          certifications: [],
          projects: []
        }
      }
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing resume',
      error: error.message
    });
  }
};

module.exports = {
  processResume
};