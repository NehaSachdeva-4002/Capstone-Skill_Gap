// backend/routes/resumeRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeService = require('../services/resumeService');
const langchainService = require('../services/langchainService');

// ========================================
// MULTER CONFIGURATION
// ========================================

// Configure multer with enhanced validation
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only allow 1 file per request
    },
    fileFilter: (req, file, cb) => {
        // Allowed file types
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];

        // Check MIME type
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'), false);
        }
    }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Validate file upload
 */
const validateFile = (file) => {
    if (!file) {
        throw new Error('No file uploaded');
    }

    if (!file.buffer) {
        throw new Error('File buffer is empty');
    }

    return true;
};

/**
 * Validate job description input
 */
const validateJobDescription = (jobDescription) => {
    if (!jobDescription) {
        throw new Error('Job description is required');
    }

    if (typeof jobDescription !== 'string') {
        throw new Error('Job description must be a string');
    }

    if (jobDescription.trim().length < 50) {
        throw new Error('Job description is too short (minimum 50 characters)');
    }

    return true;
};

// ========================================
// ROUTES
// ========================================

/**
 * POST /api/resume/upload
 * Upload and parse resume (legacy endpoint - kept for backward compatibility)
 */
router.post('/upload', upload.single('resume'), async (req, res, next) => {
    try {
        // Validate file
        validateFile(req.file);

        console.log('Processing resume upload:', {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.buffer.length
        });

        // Process the resume
        const text = await resumeService.performOCR(req.file.buffer, req.file.mimetype);
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Failed to extract text from file. Please ensure the file is readable.' 
            });
        }

        console.log('Text extracted successfully, length:', text.length);

        // Parse resume
        const result = resumeService.parseResume(text);

        console.log('Resume parsed successfully, skills found:', result.skills.length);

        res.json({
            success: true,
            data: result,
            metadata: {
                originalFilename: req.file.originalname,
                fileSize: req.file.buffer.length,
                textLength: text.length,
                skillsCount: result.skills.length
            }
        });

    } catch (error) {
        console.error('Resume upload error:', error);
        
        // Handle specific error types
        if (error.message.includes('Invalid file type')) {
            return res.status(400).json({ 
                error: error.message 
            });
        }

        res.status(500).json({ 
            error: 'Failed to process resume',
            details: error.message 
        });
    }
});

/**
 * POST /api/resume/parse-resume
 * Parse resume with enhanced skill extraction
 */
router.post('/parse-resume', upload.single('file'), async (req, res, next) => {
    try {
        // Validate file
        validateFile(req.file);

        const { buffer, mimetype, originalname } = req.file;

        console.log('Parsing resume:', {
            filename: originalname,
            mimetype: mimetype,
            size: buffer.length
        });
        
        // Perform OCR
        const extractedText = await resumeService.performOCR(buffer, mimetype);
        
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({ 
                error: 'No text could be extracted from the file',
                suggestion: 'Please ensure the file contains readable text' 
            });
        }

        console.log('Text extracted, length:', extractedText.length);
        
        // Parse resume with enhanced skill extraction
        const parsed = resumeService.parseResume(extractedText);
        
        console.log('Skills extracted:', parsed.skills.length);
        
        res.json({
            success: true,
            skills: parsed.skills,
            rawText: parsed.rawText,
            metadata: {
                originalFilename: originalname,
                fileSize: buffer.length,
                textLength: extractedText.length,
                skillsExtracted: parsed.skills.length,
                processingTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error parsing resume:', error);
        
        next(error); // Pass to error handler
    }
});

/**
 * POST /api/resume/parse-job-description
 * Parse job description with context-aware skill extraction
 */
router.post('/parse-job-description', async (req, res, next) => {
    try {
        const { jobDescription } = req.body;
        
        // Validate input
        validateJobDescription(jobDescription);

        console.log('Parsing job description, length:', jobDescription.length);
        
        // Parse job description with enhanced extraction
        const parsed = resumeService.parseJobDescription(jobDescription);
        
        console.log('JD Skills Extracted:', parsed.skills.length);
        console.log('Skills by importance:', {
            high: Object.values(parsed.detailedSkills).filter(s => s.importance === 'high').length,
            medium: Object.values(parsed.detailedSkills).filter(s => s.importance === 'medium').length,
            low: Object.values(parsed.detailedSkills).filter(s => s.importance === 'low').length
        });
        
        res.json({
            success: true,
            skills: parsed.skills,
            detailedSkills: parsed.detailedSkills,
            experienceRequirements: parsed.experienceRequirements,
            metadata: {
                totalSkillsFound: parsed.totalSkillsFound,
                descriptionLength: jobDescription.length,
                processingTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error parsing job description:', error);
        
        next(error); // Pass to error handler
    }
});

/**
 * POST /api/resume/analyze-skill-gap
 * Analyze skill gap between resume and job description
 */
router.post('/analyze-skill-gap', async (req, res, next) => {
    try {
        const { resumeSkills, jobSkills, jobDescription } = req.body;

        // Validate inputs
        if (!resumeSkills || !Array.isArray(resumeSkills)) {
            return res.status(400).json({ 
                error: 'Invalid resume skills format. Expected an array.' 
            });
        }

        if (!jobSkills || !Array.isArray(jobSkills)) {
            return res.status(400).json({ 
                error: 'Invalid job skills format. Expected an array.' 
            });
        }

        console.log('Analyzing skill gap:', {
            resumeSkills: resumeSkills.length,
            jobSkills: jobSkills.length
        });

        // If job description is provided, extract detailed context
        let detailedSkills = {};
        if (jobDescription) {
            const parsed = resumeService.parseJobDescription(jobDescription);
            detailedSkills = parsed.detailedSkills;
        }

        // Perform semantic skill matching
        const analysis = performSkillMatching(resumeSkills, jobSkills, detailedSkills);

        console.log('Analysis complete:', {
            matchPercentage: analysis.matchPercentage,
            matched: analysis.matchingSkills.length,
            missing: analysis.missingSkills.length
        });

        res.json({
            success: true,
            ...analysis
        });

    } catch (error) {
        console.error('Error analyzing skill gap:', error);
        
        next(error); // Pass to error handler
    }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'resume-service',
        timestamp: new Date().toISOString()
    });
});

// ========================================
// HELPER FUNCTION FOR SKILL MATCHING
// ========================================

/**
 * Perform semantic skill matching between resume and job skills
 */
function performSkillMatching(resumeSkills, jobSkills, detailedSkills) {
    const normalizeSkill = (skill) => {
        return skill.toLowerCase()
            .trim()
            .replace(/[^a-z0-9+#\s]/g, '')
            .replace(/\s+/g, ' ');
    };

    // Normalize both skill sets
    const normalizedResumeSkills = resumeSkills.map(normalizeSkill);
    const normalizedJobSkills = jobSkills.map(normalizeSkill);

    // Find matches
    const matchingSkills = [];
    const missingSkills = [];
    const partialMatches = [];

    normalizedJobSkills.forEach((jobSkill, index) => {
        const originalJobSkill = jobSkills[index];
        const skillDetails = detailedSkills[originalJobSkill] || {};

        // Check for exact match
        if (normalizedResumeSkills.includes(jobSkill)) {
            matchingSkills.push({
                skill: originalJobSkill,
                matchType: 'exact',
                importance: skillDetails.importance || 'medium'
            });
        } 
        // Check for partial match
        else if (normalizedResumeSkills.some(rs => 
            rs.includes(jobSkill) || jobSkill.includes(rs)
        )) {
            partialMatches.push({
                skill: originalJobSkill,
                matchType: 'partial',
                importance: skillDetails.importance || 'medium'
            });
        } 
        // Missing skill
        else {
            missingSkills.push({
                skill: originalJobSkill,
                importance: skillDetails.importance || 'medium',
                priority: skillDetails.priority || 3,
                category: skillDetails.category || 'unknown'
            });
        }
    });

    // Calculate match percentage (exact matches = 100%, partial = 50%)
    const totalWeight = jobSkills.length;
    const matchWeight = matchingSkills.length + (partialMatches.length * 0.5);
    const matchPercentage = totalWeight > 0 
        ? Math.round((matchWeight / totalWeight) * 100) 
        : 0;

    // Categorize missing skills by importance
    const criticalMissing = missingSkills.filter(s => s.importance === 'high');
    const mediumMissing = missingSkills.filter(s => s.importance === 'medium');
    const lowMissing = missingSkills.filter(s => s.importance === 'low');

    return {
        matchingSkills: matchingSkills.map(m => m.skill),
        partialMatches: partialMatches.map(m => m.skill),
        missingSkills: missingSkills.map(m => m.skill),
        criticalMissingSkills: criticalMissing.map(m => m.skill),
        matchPercentage,
        detailedAnalysis: {
            summary: `Matched ${matchingSkills.length} skills exactly, ${partialMatches.length} partially. Missing ${missingSkills.length} skills.`,
            exactMatches: matchingSkills.length,
            partialMatches: partialMatches.length,
            totalMissing: missingSkills.length,
            criticalGaps: criticalMissing.map(m => m.skill),
            mediumGaps: mediumMissing.map(m => m.skill),
            optionalGaps: lowMissing.map(m => m.skill),
            strengths: matchingSkills
                .filter(m => m.importance === 'high')
                .map(m => m.skill)
        },
        totalJobSkills: jobSkills.length,
        matchedSkills: matchingSkills.length
    };
}

/**
 * POST /api/resume/parse-with-ai
 * Parse resume using LangChain LLM (premium AI-powered feature)
 */
router.post('/parse-with-ai', upload.single('file'), async (req, res, next) => {
  try {
    // Validate file
    validateFile(req.file);

    const { buffer, mimetype, originalname } = req.file;

    console.log('AI-powered parsing for:', {
      filename: originalname,
      mimetype: mimetype,
      size: buffer.length
    });
    
    // Step 1: OCR extraction (existing method)
    const extractedText = await resumeService.performOCR(buffer, mimetype);
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'No text could be extracted from the file',
        suggestion: 'Please ensure the file contains readable text' 
      });
    }

    console.log('Text extracted, length:', extractedText.length);
    console.log('Starting LLM-powered parsing...');
    
    // Step 2: LLM-powered intelligent parsing
    const parsed = await langchainService.parseResumeWithLLM(extractedText);
    
    console.log('AI parsing complete:', {
      skillsExtracted: parsed.data.skills?.length,
      experienceCount: parsed.data.experience?.length,
      projectCount: parsed.data.projects?.length
    });
    
    res.json({
      success: true,
      ...parsed.data,
      metadata: {
        ...parsed.metadata,
        processingMethod: 'AI-Enhanced (LangChain)',
        originalTextLength: extractedText.length,
        originalFilename: originalname,
        fileSize: buffer.length,
        processingTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI parsing error:', error);
    
    // Fallback to regular parsing if AI fails
    try {
      console.log('Falling back to regular parsing...');
      const text = await resumeService.performOCR(req.file.buffer, req.file.mimetype);
      const regularParsed = resumeService.parseResume(text);
      
      res.json({
        success: true,
        ...regularParsed,
        metadata: {
          processingMethod: 'Standard (Fallback)',
          originalFilename: req.file.originalname,
          warning: 'AI parsing failed, used standard method',
          error: error.message
        }
      });
    } catch (fallbackError) {
      next(error); // Pass original error to error handler
    }
  }
});

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

/**
 * Multer error handler
 */
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: 'Maximum file size is 5MB'
            });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files',
                details: 'Only 1 file can be uploaded at a time'
            });
        }

        return res.status(400).json({
            error: 'File upload error',
            details: err.message
        });
    }

    // Handle validation errors
    if (err.message.includes('Invalid file type') || 
        err.message.includes('required') ||
        err.message.includes('too short')) {
        return res.status(400).json({
            error: err.message
        });
    }

    // Handle other errors
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
    });
});

module.exports = router;