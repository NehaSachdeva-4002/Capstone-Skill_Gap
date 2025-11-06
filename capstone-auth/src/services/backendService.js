import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://capstone-backend-env.eba-enkzsfa3.us-east-1.elasticbeanstalk.com/api';

// Function to parse resume with enhanced skill extraction
export const parseResumeWithBackend = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading resume for parsing...');
    
    const response = await axios.post(`${API_BASE_URL}/resume/parse-resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Resume parsing response:', response.data);
    
    const { skills, rawText, metadata } = response.data;
    
    // Return formatted data with enhanced skills array
    return {
      skills: skills || [],
      rawText: rawText || '',
      metadata: metadata || {},
      // Keep these for backward compatibility
      parsedResume: {
        skills: skills || [],
        rawText: rawText || ''
      },
      name: '',
      contact: {},
      education: [],
      experience: [],
      projects: [],
      certifications: []
    };
  } catch (error) {
    console.error('Error parsing resume with backend:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to parse resume');
  }
};

// Function to extract job skills with enhanced context and importance
export const extractJobSkillsWithBackend = async (jobDescription) => {
  try {
    console.log('Extracting job skills from description...');
    
    const response = await axios.post(`${API_BASE_URL}/skills/extract-job-skills`, { 
      jobDescription 
    });
    
    console.log('Job skills extraction response:', response.data);
    
    return {
      skills: response.data.skills || [],
      detailedSkills: response.data.detailedSkills || {},
      experienceRequirements: response.data.experienceRequirements || {},
      totalSkillsFound: response.data.totalSkillsFound || 0,
      metadata: response.data.metadata || {}
    };
  } catch (error) {
    console.error('Error extracting job skills with backend:', error);
    throw new Error(error.response?.data?.error || 'Failed to extract job skills');
  }
};

// Function to analyze skill gap with semantic matching
export const analyzeSkillGapWithBackend = async (resumeSkills, jobSkills, jobContext = {}) => {
  try {
    // Validate inputs
    if (!Array.isArray(resumeSkills) || resumeSkills.length === 0) {
      throw new Error('Resume skills must be a non-empty array');
    }
    if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
      throw new Error('Job skills must be a non-empty array');
    }
    
    console.log('Analyzing skill gap with semantic matching:', { 
      resumeSkills: resumeSkills.length, 
      jobSkills: jobSkills.length,
      hasContext: Object.keys(jobContext).length > 0
    });
    
    const response = await axios.post(`${API_BASE_URL}/skills/analyze-skill-gap`, { 
      resumeSkills, 
      jobSkills,
      jobContext
    });
    
    console.log('Skill gap analysis complete:', {
      matchPercentage: response.data.matchPercentage,
      exactMatches: response.data.matchingSkills?.length,
      partialMatches: response.data.partialMatches?.length,
      missing: response.data.missingSkills?.length
    });
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing skill gap with backend:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to analyze skill gap');
  }
};

// Function to generate comprehensive learning roadmap with course recommendations
export const generateLearningRoadmapWithBackend = async (missingSkills, jobTitle, criticalSkills = []) => {
  try {
    // Ensure missingSkills is an array
    const skillsArray = Array.isArray(missingSkills) ? missingSkills : [];
    const criticalArray = Array.isArray(criticalSkills) ? criticalSkills : [];
    
    console.log('Generating comprehensive roadmap:', { 
      missingSkills: skillsArray.length, 
      jobTitle,
      criticalSkills: criticalArray.length
    });
    
    const response = await axios.post(`${API_BASE_URL}/skills/generate-roadmap`, { 
      missingSkills: skillsArray, 
      jobTitle: jobTitle || 'Target Position',
      criticalSkills: criticalArray
    });
    
    const { roadmap, totalLearningTime, readinessScore, metadata } = response.data;
    
    console.log('Roadmap generated:', {
      skills: roadmap?.length,
      totalTime: totalLearningTime,
      readinessScore
    });
    
    // Handle case where there are no missing skills
    if (!roadmap || roadmap.length === 0) {
      return {
        learningPath: [],
        estimatedTimeToComplete: '0 weeks',
        recommendedResources: [],
        jobTitle: response.data.jobTitle,
        missingSkills: [],
        readinessScore: 100,
        message: response.data.message || '🎉 Congratulations! You already have all required skills!'
      };
    }
    
    return {
      learningPath: roadmap,
      estimatedTimeToComplete: totalLearningTime,
      recommendedResources: roadmap.flatMap(item => item.recommended?.resources || []),
      recommendedCourses: roadmap.flatMap(item => item.recommended?.courses || []),
      projectIdeas: roadmap.flatMap(item => item.recommended?.projects || []),
      jobTitle: response.data.jobTitle,
      missingSkills: response.data.missingSkills,
      readinessScore: readinessScore || 0,
      metadata: metadata || {}
    };
  } catch (error) {
    console.error('Error generating learning roadmap with backend:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to generate learning roadmap');
  }
};

// For development and testing purposes, we'll use mock data when backend is not available
export const shouldUseMockData = async () => {
  // Check if we're in development mode and backend is not available
  const isDevelopment = process.env.NODE_ENV === 'development';
  const backendAvailable = await checkBackendAvailability();
  
  return isDevelopment && !backendAvailable;
};

// Function to check if backend is available
const checkBackendAvailability = async () => {
  try {
    await axios.get(`${API_BASE_URL}/health-check`, { timeout: 2000 });
    return true;
  } catch (error) {
    console.warn('Backend not available, using mock data');
    return false;
  }
};

class EnhancedBackendService {
  constructor() {
    this.courseCache = new Map();
    this.lastScrapeTime = new Map();
    this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  }

  async getCourseRecommendations(userId, skillGaps, userLevel, useCache = true) {
    const cacheKey = `${userId}-${skillGaps.join(',')}-${userLevel}`;
    
    // Check cache first
    if (useCache && this.isCacheValid(cacheKey)) {
      return this.courseCache.get(cacheKey);
    }

    try {
      // In a real implementation, this would be an API call
      const mockRecommendations = await this.fetchCourseRecommendations(
        userId, 
        skillGaps, 
        userLevel
      );
      
      // Cache the results
      this.courseCache.set(cacheKey, {
        data: mockRecommendations,
        timestamp: Date.now()
      });

      return mockRecommendations;
    } catch (error) {
      console.error('Error fetching course recommendations:', error);
      throw new Error('Failed to fetch course recommendations');
    }
  }

  isCacheValid(cacheKey) {
    const cached = this.courseCache.get(cacheKey);
    if (!cached) return false;
    
    return (Date.now() - cached.timestamp) < this.CACHE_DURATION;
  }

  async fetchCourseRecommendations(userId, skillGaps, userLevel) {
    // Mock implementation - replace with actual service calls
    return skillGaps.map(skill => ({
      skill,
      courses: this.generateMockCourses(skill, userLevel),
      learningPath: this.generateMockLearningPath(skill, userLevel)
    }));
  }

  generateMockCourses(skill, level) {
    const baseCourses = [
      {
        id: `${skill}-course-1`,
        title: `Complete ${skill} Mastery Course`,
        provider: 'TechEd Pro',
        rating: 4.6,
        enrollments: Math.floor(Math.random() * 100000) + 10000,
        duration: level === 'beginner' ? '40 hours' : level === 'intermediate' ? '60 hours' : '80 hours',
        level: this.capitalizeFirst(level),
        price: Math.floor(Math.random() * 100) + 49,
        skills: [skill],
        url: `https://example.com/courses/${skill}`,
        description: `Comprehensive ${skill} course for ${level} learners`,
        personalizedScore: 4.2 + Math.random() * 0.8,
        matchReasons: ['Matches your skill level', 'Highly rated', 'Popular choice'],
        estimatedCompletionTime: level === 'beginner' ? 45 : level === 'intermediate' ? 38 : 32,
        prerequisites: this.getPrerequisites(skill),
        careerRelevance: Math.random() * 0.4 + 0.6
      },
      {
        id: `${skill}-course-2`,
        title: `${skill} for Professionals`,
        provider: 'SkillUp Academy',
        rating: 4.4,
        enrollments: Math.floor(Math.random() * 80000) + 5000,
        duration: level === 'beginner' ? '35 hours' : level === 'intermediate' ? '50 hours' : '70 hours',
        level: this.capitalizeFirst(level),
        price: Math.floor(Math.random() * 80) + 39,
        skills: [skill],
        url: `https://example.com/professional/${skill}`,
        description: `Professional-grade ${skill} training with real-world projects`,
        personalizedScore: 4.0 + Math.random() * 0.8,
        matchReasons: ['Industry-focused', 'Project-based learning'],
        estimatedCompletionTime: level === 'beginner' ? 40 : level === 'intermediate' ? 35 : 28,
        prerequisites: this.getPrerequisites(skill),
        careerRelevance: Math.random() * 0.3 + 0.7
      }
    ];

    return baseCourses;
  }

  generateMockLearningPath(skill, level) {
    const pathTemplates = {
      beginner: [
        { step: 1, title: `${skill} Fundamentals`, duration: '2-3 weeks', description: 'Learn the basics and core concepts' },
        { step: 2, title: `${skill} Hands-on Practice`, duration: '3-4 weeks', description: 'Apply knowledge with guided projects' },
        { step: 3, title: `${skill} Real-world Projects`, duration: '4-6 weeks', description: 'Build portfolio projects' },
        { step: 4, title: `${skill} Advanced Concepts`, duration: '3-4 weeks', description: 'Master advanced techniques' }
      ],
      intermediate: [
        { step: 1, title: `Advanced ${skill} Patterns`, duration: '2-3 weeks', description: 'Learn industry best practices' },
        { step: 2, title: `${skill} Architecture & Design`, duration: '3-4 weeks', description: 'Understand system design principles' },
        { step: 3, title: `${skill} Performance Optimization`, duration: '2-3 weeks', description: 'Optimize for production use' },
        { step: 4, title: `${skill} Specialization`, duration: '4-6 weeks', description: 'Choose and master a specialization' }
      ],
      advanced: [
        { step: 1, title: `${skill} Expert Techniques`, duration: '2-3 weeks', description: 'Master cutting-edge techniques' },
        { step: 2, title: `${skill} Leadership & Mentoring`, duration: '3-4 weeks', description: 'Lead teams and mentor others' },
        { step: 3, title: `${skill} Innovation & Research`, duration: '4-6 weeks', description: 'Contribute to the field' }
      ]
    };

    return pathTemplates[level] || pathTemplates.intermediate;
  }

  getPrerequisites(skill) {
    const prerequisites = {
      'react': ['javascript', 'html-css'],
      'vue': ['javascript', 'html-css'],
      'angular': ['typescript', 'html-css'],
      'nodejs': ['javascript'],
      'express': ['nodejs'],
      'django': ['python'],
      'spring': ['java'],
      'mongodb': ['database-basics'],
      'postgresql': ['sql'],
      'docker': ['linux-basics'],
      'kubernetes': ['docker'],
      'machine-learning': ['python', 'statistics'],
      'tensorflow': ['python', 'machine-learning']
    };

    return prerequisites[skill] || [];
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async updateCourseData(courseId, updates) {
    // Mock implementation for updating course data
    return {
      success: true,
      courseId,
      updates,
      timestamp: new Date().toISOString()
    };
  }

  async trackUserProgress(userId, courseId, progress) {
    // Mock implementation for tracking user progress
    return {
      success: true,
      userId,
      courseId,
      progress,
      updatedAt: new Date().toISOString()
    };
  }
}

const enhancedBackendService = new EnhancedBackendService();
export default enhancedBackendService;
