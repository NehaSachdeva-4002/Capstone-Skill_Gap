// backend/routes/skillsRoutes.js

const express = require('express');
const router = express.Router();

// Import resumeService which now contains all skill extraction logic
const resumeService = require('../services/resumeService');
const langchainService = require('../services/langchainService');

// ========================================
// SKILL EXTRACTION & MATCHING
// ========================================

/**
 * POST /api/skills/extract-job-skills
 * Extract skills from job description with context and importance
 */
router.post('/extract-job-skills', async (req, res) => {
    try {
        const { jobDescription } = req.body;
        
        // Validate input
        if (!jobDescription) {
            return res.status(400).json({ 
                error: 'Job description is required' 
            });
        }

        if (typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
            return res.status(400).json({ 
                error: 'Job description must be at least 50 characters long' 
            });
        }

        console.log('Extracting skills from JD, length:', jobDescription.length);
        
        // Extract skills with context using enhanced service
        const extraction = resumeService.parseJobDescription(jobDescription);
        
        console.log('Extracted JD Skills:', extraction.skills.length);
        console.log('Skills by importance:', {
            high: Object.values(extraction.detailedSkills || {}).filter(s => s.importance === 'high').length,
            medium: Object.values(extraction.detailedSkills || {}).filter(s => s.importance === 'medium').length,
            low: Object.values(extraction.detailedSkills || {}).filter(s => s.importance === 'low').length
        });
        
        res.json({
            success: true,
            skills: extraction.skills,
            detailedSkills: extraction.detailedSkills,
            experienceRequirements: extraction.experienceRequirements,
            totalSkillsFound: extraction.totalSkillsFound,
            metadata: {
                descriptionLength: jobDescription.length,
                processingTime: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error extracting job skills:', error);
        res.status(500).json({ 
            error: 'Failed to extract job skills',
            details: error.message 
        });
    }
});

/**
 * POST /api/skills/analyze-skill-gap
 * Analyze skill gap with semantic matching and importance weighting
 */
router.post('/analyze-skill-gap', (req, res) => {
    try {
        const { resumeSkills, jobSkills, jobContext } = req.body;
        
        // Validate inputs
        if (!resumeSkills || !Array.isArray(resumeSkills)) {
            return res.status(400).json({ 
                error: 'Resume skills are required and must be an array' 
            });
        }

        if (!jobSkills || !Array.isArray(jobSkills)) {
            return res.status(400).json({ 
                error: 'Job skills are required and must be an array' 
            });
        }

        console.log('Analyzing skill gap:', {
            resumeSkills: resumeSkills.length,
            jobSkills: jobSkills.length
        });
        
        // Convert jobContext to proper format if provided
        const contextMap = jobContext ? new Map(Object.entries(jobContext)) : new Map();
        
        // Perform semantic skill matching with advanced normalization
        const analysis = performSemanticSkillMatching(resumeSkills, jobSkills, contextMap);
        
        console.log('Match Analysis Complete:', {
            matchPercentage: analysis.matchPercentage,
            exactMatches: analysis.matchingSkills.length,
            partialMatches: analysis.partialMatches.length,
            missing: analysis.missingSkills.length,
            critical: analysis.criticalMissingSkills.length
        });
        
        res.json({
            success: true,
            matchingSkills: analysis.matchingSkills,
            partialMatches: analysis.partialMatches,
            missingSkills: analysis.missingSkills,
            criticalMissingSkills: analysis.criticalMissingSkills,
            matchPercentage: analysis.matchPercentage,
            detailedAnalysis: analysis.detailedAnalysis,
            totalJobSkills: jobSkills.length,
            matchedSkills: analysis.matchingSkills.length,
            recommendations: analysis.recommendations
        });
        
    } catch (error) {
        console.error('Error analyzing skill gap:', error);
        res.status(500).json({ 
            error: 'Failed to analyze skill gap',
            details: error.message 
        });
    }
});

// ========================================
// LEARNING ROADMAP GENERATION
// ========================================

/**
 * POST /api/skills/generate-roadmap
 * Generate personalized learning roadmap based on skill gaps
 */
router.post('/generate-roadmap', (req, res) => {
    try {
        const { missingSkills, jobTitle, criticalSkills } = req.body;
        
        console.log('Generate roadmap request:', { 
            missingSkills: missingSkills?.length, 
            jobTitle,
            criticalSkills: criticalSkills?.length 
        });
        
        // Validate input
        if (!Array.isArray(missingSkills)) {
            return res.status(400).json({ 
                error: 'Missing skills must be an array' 
            });
        }

        // If no missing skills, return success with congratulatory message
        if (missingSkills.length === 0) {
            console.log('No missing skills - returning empty roadmap');
            return res.json({
                success: true,
                jobTitle: jobTitle || 'Target Position',
                missingSkills: [],
                roadmap: [],
                message: '🎉 Congratulations! You already have all the required skills for this position.',
                readinessScore: 100
            });
        }

        // Prioritize critical skills
        const criticalSkillSet = new Set(criticalSkills || []);
        const prioritizedSkills = [
            ...missingSkills.filter(s => criticalSkillSet.has(s)),
            ...missingSkills.filter(s => !criticalSkillSet.has(s))
        ];

        // Generate comprehensive roadmap
        const roadmap = generateLearningRoadmap(prioritizedSkills, criticalSkillSet);

        console.log('Generated roadmap for', prioritizedSkills.length, 'skills');

        res.json({
            success: true,
            jobTitle: jobTitle || 'Target Position',
            missingSkills: prioritizedSkills,
            roadmap: roadmap,
            totalLearningTime: calculateTotalLearningTime(roadmap),
            readinessScore: calculateReadinessScore(missingSkills.length, criticalSkills?.length || 0),
            metadata: {
                skillsCount: prioritizedSkills.length,
                criticalSkillsCount: criticalSkillSet.size,
                generatedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error generating roadmap:', error);
        res.status(500).json({ 
            error: 'Failed to generate roadmap',
            details: error.message 
        });
    }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Perform semantic skill matching with synonym detection and fuzzy matching
 */
function performSemanticSkillMatching(resumeSkills, jobSkills, contextMap) {
    // Skill synonym mappings
    const SKILL_SYNONYMS = {
        'nodejs': ['node.js', 'node', 'express.js', 'express'],
        'node.js': ['nodejs', 'node', 'express'],
        'reactjs': ['react', 'react.js', 'react native'],
        'react': ['reactjs', 'react.js'],
        'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
        'typescript': ['ts'],
        'mongodb': ['mongo', 'mongo db'],
        'postgresql': ['postgres', 'psql'],
        'mysql': ['my sql'],
        'c++': ['cpp', 'c plus plus'],
        'c#': ['csharp', 'c sharp'],
        'python': ['py'],
        'machine learning': ['ml', 'statistical modeling'],
        'deep learning': ['dl', 'neural networks'],
        'artificial intelligence': ['ai'],
        'natural language processing': ['nlp'],
        'computer vision': ['cv', 'image processing'],
        'docker': ['containerization', 'containers'],
        'kubernetes': ['k8s', 'container orchestration'],
        'ci/cd': ['continuous integration', 'continuous deployment'],
        'rest api': ['restful', 'rest', 'api'],
        'graphql': ['gql']
    };

    // Normalize skill function
    const normalizeSkill = (skill) => {
        return skill.toLowerCase()
            .trim()
            .replace(/[^a-z0-9+#\s]/g, '')
            .replace(/\s+/g, ' ');
    };

    // Get all synonyms for a skill
    const getSynonyms = (skill) => {
        const normalized = normalizeSkill(skill);
        const synonyms = [normalized];
        
        if (SKILL_SYNONYMS[normalized]) {
            synonyms.push(...SKILL_SYNONYMS[normalized]);
        }
        
        // Check if skill is a synonym value
        for (const [key, values] of Object.entries(SKILL_SYNONYMS)) {
            if (values.includes(normalized)) {
                synonyms.push(key, ...values);
            }
        }
        
        return [...new Set(synonyms)];
    };

    // Normalize skill sets
    const normalizedResumeSkills = resumeSkills.map(s => ({
        original: s,
        normalized: normalizeSkill(s),
        synonyms: getSynonyms(s)
    }));

    const normalizedJobSkills = jobSkills.map(s => ({
        original: s,
        normalized: normalizeSkill(s),
        synonyms: getSynonyms(s)
    }));

    // Matching arrays
    const matchingSkills = [];
    const partialMatches = [];
    const missingSkills = [];

    // Perform matching
    normalizedJobSkills.forEach(jobSkill => {
        const context = contextMap.get(jobSkill.original) || {};
        let matchFound = false;
        let matchType = null;

        // Check for exact match
        for (const resumeSkill of normalizedResumeSkills) {
            if (resumeSkill.normalized === jobSkill.normalized) {
                matchingSkills.push({
                    skill: jobSkill.original,
                    matchedWith: resumeSkill.original,
                    matchType: 'exact',
                    importance: context.importance || 'medium'
                });
                matchFound = true;
                break;
            }
        }

        // Check for synonym match
        if (!matchFound) {
            for (const resumeSkill of normalizedResumeSkills) {
                const hasCommonSynonym = resumeSkill.synonyms.some(rs => 
                    jobSkill.synonyms.includes(rs)
                );
                
                if (hasCommonSynonym) {
                    matchingSkills.push({
                        skill: jobSkill.original,
                        matchedWith: resumeSkill.original,
                        matchType: 'synonym',
                        importance: context.importance || 'medium'
                    });
                    matchFound = true;
                    break;
                }
            }
        }

        // Check for partial/fuzzy match
        if (!matchFound) {
            for (const resumeSkill of normalizedResumeSkills) {
                const isPartialMatch = 
                    resumeSkill.normalized.includes(jobSkill.normalized) || 
                    jobSkill.normalized.includes(resumeSkill.normalized);
                
                if (isPartialMatch) {
                    // Calculate similarity percentage
                    const similarity = Math.abs(
                        resumeSkill.normalized.length - jobSkill.normalized.length
                    ) / Math.max(resumeSkill.normalized.length, jobSkill.normalized.length);
                    
                    if (similarity < 0.5) { // At least 50% similar
                        partialMatches.push({
                            skill: jobSkill.original,
                            matchedWith: resumeSkill.original,
                            matchType: 'partial',
                            similarity: Math.round((1 - similarity) * 100),
                            importance: context.importance || 'medium'
                        });
                        matchFound = true;
                        break;
                    }
                }
            }
        }

        // If no match found, add to missing skills
        if (!matchFound) {
            missingSkills.push({
                skill: jobSkill.original,
                importance: context.importance || 'medium',
                priority: context.priority || 3,
                category: context.category || 'unknown',
                experienceRequired: context.experienceRequired || 'not specified'
            });
        }
    });

    // Calculate weighted match percentage
    const exactMatchWeight = 1.0;
    const partialMatchWeight = 0.5;
    const totalWeight = jobSkills.length;
    const matchWeight = 
        (matchingSkills.length * exactMatchWeight) + 
        (partialMatches.length * partialMatchWeight);
    const matchPercentage = totalWeight > 0 
        ? Math.round((matchWeight / totalWeight) * 100) 
        : 0;

    // Categorize missing skills by importance
    const criticalMissing = missingSkills.filter(s => s.importance === 'high');
    const mediumMissing = missingSkills.filter(s => s.importance === 'medium');
    const lowMissing = missingSkills.filter(s => s.importance === 'low');

    // Generate recommendations based on match percentage
    const recommendations = generateRecommendations(matchPercentage, criticalMissing.length);

    return {
        matchingSkills: matchingSkills.map(m => m.skill),
        partialMatches: partialMatches.map(m => ({
            skill: m.skill,
            matchedWith: m.matchedWith,
            similarity: m.similarity
        })),
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
                .map(m => m.skill),
            matchQuality: matchPercentage >= 80 ? 'Excellent' : 
                         matchPercentage >= 60 ? 'Good' : 
                         matchPercentage >= 40 ? 'Fair' : 'Needs Improvement'
        },
        recommendations
    };
}

/**
 * Generate actionable recommendations based on skill gap analysis
 */
function generateRecommendations(matchPercentage, criticalMissingCount) {
    const recommendations = [];

    if (matchPercentage >= 80) {
        recommendations.push({
            type: 'ready',
            message: 'You are well-prepared for this role! Consider applying.',
            action: 'Focus on highlighting your matching skills in your application.'
        });
    } else if (matchPercentage >= 60) {
        recommendations.push({
            type: 'close',
            message: 'You have a good foundation. Focus on filling critical skill gaps.',
            action: 'Spend 2-4 weeks learning the most important missing skills.'
        });
    } else if (matchPercentage >= 40) {
        recommendations.push({
            type: 'moderate',
            message: 'You need to develop several key skills for this role.',
            action: 'Create a 2-3 month learning plan focusing on critical skills first.'
        });
    } else {
        recommendations.push({
            type: 'significant',
            message: 'This role requires significant skill development.',
            action: 'Consider a 3-6 month intensive learning program or look for related entry-level positions.'
        });
    }

    if (criticalMissingCount > 0) {
        recommendations.push({
            type: 'critical',
            message: `You are missing ${criticalMissingCount} critical skill(s) for this role.`,
            action: 'Prioritize learning these skills first before applying.'
        });
    }

    return recommendations;
}

/**
 * Generate comprehensive learning roadmap with resources and timelines
 */
function generateLearningRoadmap(skills, criticalSkillSet) {
    // Skill metadata for better recommendations
    const skillMetadata = {
        // Programming Languages
        'python': { difficulty: 'Beginner', time: '6-8 weeks', category: 'Programming' },
        'javascript': { difficulty: 'Beginner', time: '4-6 weeks', category: 'Programming' },
        'typescript': { difficulty: 'Intermediate', time: '3-4 weeks', category: 'Programming' },
        'java': { difficulty: 'Intermediate', time: '8-10 weeks', category: 'Programming' },
        'c++': { difficulty: 'Advanced', time: '10-12 weeks', category: 'Programming' },
        
        // Frameworks
        'react': { difficulty: 'Intermediate', time: '4-6 weeks', category: 'Frontend' },
        'angular': { difficulty: 'Intermediate', time: '5-7 weeks', category: 'Frontend' },
        'vue': { difficulty: 'Intermediate', time: '3-5 weeks', category: 'Frontend' },
        'nodejs': { difficulty: 'Intermediate', time: '4-6 weeks', category: 'Backend' },
        'django': { difficulty: 'Intermediate', time: '5-7 weeks', category: 'Backend' },
        'flask': { difficulty: 'Beginner', time: '3-4 weeks', category: 'Backend' },
        
        // Databases
        'sql': { difficulty: 'Beginner', time: '4-5 weeks', category: 'Database' },
        'mongodb': { difficulty: 'Beginner', time: '3-4 weeks', category: 'Database' },
        'postgresql': { difficulty: 'Intermediate', time: '5-6 weeks', category: 'Database' },
        
        // Cloud & DevOps
        'aws': { difficulty: 'Intermediate', time: '6-8 weeks', category: 'Cloud' },
        'docker': { difficulty: 'Intermediate', time: '3-4 weeks', category: 'DevOps' },
        'kubernetes': { difficulty: 'Advanced', time: '6-8 weeks', category: 'DevOps' },
        'ci/cd': { difficulty: 'Intermediate', time: '4-5 weeks', category: 'DevOps' },
        
        // ML & AI
        'machine learning': { difficulty: 'Advanced', time: '12-16 weeks', category: 'AI/ML' },
        'deep learning': { difficulty: 'Advanced', time: '10-14 weeks', category: 'AI/ML' },
        'tensorflow': { difficulty: 'Advanced', time: '8-10 weeks', category: 'AI/ML' },
        'pytorch': { difficulty: 'Advanced', time: '8-10 weeks', category: 'AI/ML' },
        
        // Default
        'default': { difficulty: 'Intermediate', time: '4-6 weeks', category: 'General' }
    };

    return skills.map((skill, index) => {
        const normalizedSkill = skill.toLowerCase();
        const metadata = skillMetadata[normalizedSkill] || skillMetadata['default'];
        const isCritical = criticalSkillSet.has(skill);

        return {
            id: index + 1,
            skill,
            isCritical,
            priority: isCritical ? 'High' : 'Medium',
            title: `Learn ${skill}`,
            description: `Master ${skill} to match job requirements${isCritical ? ' (Critical Skill)' : ''}`,
            difficulty: metadata.difficulty,
            timeToLearn: metadata.time,
            category: metadata.category,
            recommended: {
                courses: generateCourseRecommendations(skill, metadata),
                resources: generateResourceRecommendations(skill, metadata),
                projects: generateProjectIdeas(skill, metadata)
            }
        };
    });
}

/**
 * Generate course recommendations for a specific skill
 */
function generateCourseRecommendations(skill, metadata) {
    const platforms = ['Coursera', 'Udemy', 'edX', 'Pluralsight', 'LinkedIn Learning'];
    
    return [
        {
            title: `${skill} Fundamentals`,
            platform: platforms[0],
            duration: metadata.time.split('-')[0] + ' weeks',
            level: 'Beginner',
            rating: '4.5/5',
            url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`
        },
        {
            title: `Complete ${skill} Bootcamp`,
            platform: platforms[1],
            duration: metadata.time,
            level: metadata.difficulty,
            rating: '4.7/5',
            url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`
        },
        {
            title: `Advanced ${skill} Techniques`,
            platform: platforms[2],
            duration: metadata.time.split('-')[1] || '6 weeks',
            level: 'Advanced',
            rating: '4.6/5',
            url: `https://www.edx.org/search?q=${encodeURIComponent(skill)}`
        }
    ];
}

/**
 * Generate resource recommendations for a specific skill
 */
function generateResourceRecommendations(skill, metadata) {
    const skillSlug = skill.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    return [
        {
            type: 'Documentation',
            title: `${skill} Official Documentation`,
            url: `https://docs.${skillSlug}.org`,
            description: `Comprehensive ${skill} documentation and API reference`
        },
        {
            type: 'Tutorial',
            title: `${skill} Tutorial for Beginners`,
            url: `https://www.tutorialspoint.com/${skillSlug}`,
            description: `Step-by-step ${skill} tutorial with examples`
        },
        {
            type: 'Practice',
            title: `${skill} Coding Challenges`,
            url: `https://www.hackerrank.com/domains/${skillSlug}`,
            description: `Interactive ${skill} exercises and challenges`
        },
        {
            type: 'Community',
            title: `${skill} Community Forum`,
            url: `https://stackoverflow.com/questions/tagged/${skillSlug}`,
            description: `Get help from the ${skill} developer community`
        }
    ];
}

/**
 * Generate project ideas for practicing a skill
 */
function generateProjectIdeas(skill, metadata) {
    const projectTemplates = {
        'Programming': [
            'Build a command-line tool',
            'Create a REST API',
            'Develop a web scraper'
        ],
        'Frontend': [
            'Build a responsive portfolio website',
            'Create a task management app',
            'Develop an e-commerce product page'
        ],
        'Backend': [
            'Build a RESTful API server',
            'Create a user authentication system',
            'Develop a file upload service'
        ],
        'Database': [
            'Design a database schema for an application',
            'Build a data migration tool',
            'Create database query optimization examples'
        ],
        'AI/ML': [
            'Build a prediction model',
            'Create an image classification system',
            'Develop a sentiment analysis tool'
        ],
        'DevOps': [
            'Set up a CI/CD pipeline',
            'Create a containerized application',
            'Build an infrastructure monitoring dashboard'
        ]
    };

    const projects = projectTemplates[metadata.category] || projectTemplates['Programming'];
    
    return projects.map((project, idx) => ({
        id: idx + 1,
        title: `${project} using ${skill}`,
        difficulty: metadata.difficulty,
        estimatedTime: '1-2 weeks'
    }));
}

/**
 * Calculate total learning time from roadmap
 */
function calculateTotalLearningTime(roadmap) {
    if (!roadmap || roadmap.length === 0) return '0 weeks';
    
    let totalWeeks = 0;
    roadmap.forEach(item => {
        const timeStr = item.timeToLearn;
        const weeks = timeStr.match(/(\d+)-(\d+)/);
        if (weeks) {
            totalWeeks += (parseInt(weeks[1]) + parseInt(weeks[2])) / 2;
        }
    });
    
    const months = Math.floor(totalWeeks / 4);
    const remainingWeeks = Math.round(totalWeeks % 4);
    
    if (months > 0 && remainingWeeks > 0) {
        return `${months} months ${remainingWeeks} weeks`;
    } else if (months > 0) {
        return `${months} months`;
    } else {
        return `${Math.round(totalWeeks)} weeks`;
    }
}

/**
 * Calculate readiness score based on skill gaps
 */
function calculateReadinessScore(totalMissing, criticalMissing) {
    if (totalMissing === 0) return 100;
    
    // Heavy penalty for critical missing skills
    const criticalPenalty = criticalMissing * 15;
    const generalPenalty = (totalMissing - criticalMissing) * 5;
    
    const score = Math.max(0, 100 - criticalPenalty - generalPenalty);
    return Math.round(score);
}

/**
 * POST /api/skills/analyze-with-ai
 * AI-powered comprehensive skill gap analysis using LangChain
 */
router.post('/analyze-with-ai', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    // Validate inputs
    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ 
        error: 'Resume text is required and must be a string' 
      });
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({ 
        error: 'Job description is required and must be a string' 
      });
    }

    console.log('AI-powered analysis request:', {
      resumeTextLength: resumeText.length,
      jobDescriptionLength: jobDescription.length
    });

    // Parse both with LLM in parallel for efficiency
    console.log('Parsing resume and job description with AI...');
    const [resumeAnalysis, jdAnalysis] = await Promise.all([
      langchainService.parseResumeWithLLM(resumeText),
      langchainService.analyzeJobDescriptionWithLLM(jobDescription)
    ]);

    console.log('AI Parsing complete:', {
      resumeSkills: resumeAnalysis.data.skills?.length,
      jobRequirements: jdAnalysis.data.requiredSkills?.length
    });

    // Semantic skill matching with vector embeddings
    console.log('Performing semantic skill matching...');
    const matching = await langchainService.semanticSkillMatching(
      resumeAnalysis.data.skills || [],
      jdAnalysis.data.requiredSkills || []
    );

    console.log('Matching complete:', {
      matched: matching.matches?.length,
      missing: matching.missing?.length,
      matchPercentage: matching.matchPercentage
    });

    // Generate personalized learning roadmap
    console.log('Generating personalized learning roadmap...');
    const roadmap = await langchainService.generatePersonalizedLearningPath(
      matching.missing || [],
      { 
        skills: resumeAnalysis.data.skills || [],
        experienceLevel: jdAnalysis.data.experienceLevel || 'intermediate',
        targetRole: jdAnalysis.data.jobTitle || 'Target Position'
      },
      matching
    );

    console.log('AI Analysis Complete');

    res.json({
      success: true,
      resumeAnalysis: resumeAnalysis.data,
      jobAnalysis: jdAnalysis.data,
      skillMatching: matching,
      learningRoadmap: roadmap.roadmap,
      metadata: {
        processingMethod: 'LangChain AI',
        model: 'llama3-70b-8192',
        timestamp: new Date().toISOString(),
        resumeMetadata: resumeAnalysis.metadata,
        jobMetadata: jdAnalysis.metadata
      }
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to perform AI analysis',
      details: error.message 
    });
  }
});

/**
 * POST /api/skills/career-coach
 * Interactive AI career coach chatbot
 */
router.post('/career-coach', async (req, res) => {
  try {
    const { question, resumeText, roadmap } = req.body;

    // Validate inputs
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ 
        error: 'Question is required and must be a string' 
      });
    }

    if (!resumeText) {
      return res.status(400).json({ 
        error: 'Resume text is required for context' 
      });
    }

    console.log('Career coach question:', question);

    // Create chatbot instance (in production, cache this per user session)
    const chatbot = await langchainService.createCareerCoachChatbot(
      resumeText,
      roadmap || {}
    );
    
    // Get answer from AI coach
    const answer = await langchainService.askCareerCoach(chatbot, question);

    console.log('Career coach responded successfully');

    res.json({
      ...answer,
      metadata: {
        timestamp: new Date().toISOString(),
        model: 'llama3-70b-8192',
        processingMethod: 'RAG-based Q&A'
      }
    });

  } catch (error) {
    console.error('Career coach error:', error);
    res.status(500).json({ 
      error: 'Failed to get career coach response',
      details: error.message 
    });
  }
});

// ========================================
// HEALTH CHECK
// ========================================

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'skills-service',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;