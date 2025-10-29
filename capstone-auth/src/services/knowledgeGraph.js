// Knowledge Graph Implementation for Course Recommendation System

// 1. Knowledge Graph Data Structure
class KnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // skill/course nodes
    this.edges = new Map(); // relationships between nodes
    this.courseData = new Map(); // detailed course information
  }

  // Add a skill or course node
  addNode(id, type, data) {
    this.nodes.set(id, {
      id,
      type, // 'skill', 'course', 'topic', 'prerequisite'
      data,
      connections: new Set()
    });
  }

  // Add relationship between nodes
  addEdge(fromId, toId, relationship, weight = 1) {
    const edgeId = `${fromId}-${toId}`;
    this.edges.set(edgeId, {
      from: fromId,
      to: toId,
      relationship, // 'requires', 'teaches', 'related_to', 'prerequisite'
      weight
    });
    
    // Update node connections
    if (this.nodes.has(fromId)) {
      this.nodes.get(fromId).connections.add(toId);
    }
  }

  // Find related courses for a skill
  findRelatedCourses(skillId, maxDepth = 2) {
    const visited = new Set();
    const courses = [];
    
    const traverse = (nodeId, depth) => {
      if (depth > maxDepth || visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = this.nodes.get(nodeId);
      if (!node) return;
      
      if (node.type === 'course') {
        courses.push({
          ...node.data,
          relevanceScore: this.calculateRelevanceScore(skillId, nodeId)
        });
      }
      
      // Traverse connected nodes
      for (const connectedId of node.connections) {
        traverse(connectedId, depth + 1);
      }
    };
    
    traverse(skillId, 0);
    return courses.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  calculateRelevanceScore(skillId, courseId) {
    // Simple relevance scoring based on connection strength
    const edgeId = `${skillId}-${courseId}`;
    const edge = this.edges.get(edgeId);
    return edge ? edge.weight : 0.5;
  }
}

// 2. Web Scraping Service for Course Data
class CourseScrapingService {
  constructor() {
    this.scrapedData = new Map();
    this.rateLimiter = new Map(); // Simple rate limiting
  }

  // Scrape course data from multiple platforms
  async scrapeCourseData(query, platforms = ['coursera', 'udemy', 'edx']) {
    const results = [];
    
    for (const platform of platforms) {
      try {
        const courses = await this.scrapeFromPlatform(platform, query);
        results.push(...courses);
        
        // Rate limiting
        await this.delay(1000);
      } catch (error) {
        console.error(`Error scraping ${platform}:`, error);
      }
    }
    
    return this.deduplicateResults(results);
  }

  async scrapeFromPlatform(platform, query) {
    // Mock implementation - in real app, use puppeteer or cheerio
    const mockData = {
      coursera: [
        {
          id: `coursera_${Date.now()}`,
          title: `Advanced ${query} Specialization`,
          provider: 'Coursera',
          rating: 4.6,
          enrollments: 45000,
          duration: '6 months',
          level: 'Advanced',
          price: 49,
          skills: this.extractSkillsFromTitle(query),
          url: `https://coursera.org/specializations/${query.toLowerCase()}`,
          description: `Comprehensive ${query} course covering industry best practices`
        }
      ],
      udemy: [
        {
          id: `udemy_${Date.now()}`,
          title: `Complete ${query} Bootcamp`,
          provider: 'Udemy',
          rating: 4.4,
          enrollments: 125000,
          duration: '40 hours',
          level: 'Beginner to Advanced',
          price: 84.99,
          skills: this.extractSkillsFromTitle(query),
          url: `https://udemy.com/course/${query.toLowerCase()}-bootcamp`,
          description: `Hands-on ${query} training with real projects`
        }
      ],
      edx: [
        {
          id: `edx_${Date.now()}`,
          title: `${query} Professional Certificate`,
          provider: 'edX',
          rating: 4.7,
          enrollments: 32000,
          duration: '4 months',
          level: 'Intermediate',
          price: 0, // Free audit
          skills: this.extractSkillsFromTitle(query),
          url: `https://edx.org/professional-certificate/${query.toLowerCase()}`,
          description: `Professional-grade ${query} certification program`
        }
      ]
    };

    return mockData[platform] || [];
  }

  extractSkillsFromTitle(title) {
    // Extract relevant skills from course title
    const skillKeywords = [
      'javascript', 'python', 'react', 'node.js', 'machine learning',
      'data science', 'web development', 'mobile development', 'devops',
      'cloud computing', 'artificial intelligence', 'blockchain'
    ];
    
    const titleLower = title.toLowerCase();
    return skillKeywords.filter(skill => titleLower.includes(skill));
  }

  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(course => {
      const key = `${course.title}-${course.provider}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 3. Enhanced Course Recommendation Engine
class EnhancedCourseRecommendationEngine {
  constructor() {
    this.knowledgeGraph = new KnowledgeGraph();
    this.scrapingService = new CourseScrapingService();
    this.userProfiles = new Map();
  }

  // Initialize knowledge graph with base data
  async initializeKnowledgeGraph() {
    // Add skill nodes
    const skills = [
      { id: 'javascript', name: 'JavaScript', category: 'Programming' },
      { id: 'react', name: 'React', category: 'Frontend' },
      { id: 'nodejs', name: 'Node.js', category: 'Backend' },
      { id: 'python', name: 'Python', category: 'Programming' },
      { id: 'machine-learning', name: 'Machine Learning', category: 'AI/ML' }
    ];

    skills.forEach(skill => {
      this.knowledgeGraph.addNode(skill.id, 'skill', skill);
    });

    // Add skill relationships
    this.knowledgeGraph.addEdge('javascript', 'react', 'prerequisite', 0.9);
    this.knowledgeGraph.addEdge('javascript', 'nodejs', 'related_to', 0.8);
    this.knowledgeGraph.addEdge('python', 'machine-learning', 'prerequisite', 0.85);
  }

  // Generate personalized course recommendations
  async generateRecommendations(userId, targetSkills, userCurrentLevel) {
    const userProfile = this.getUserProfile(userId);
    const recommendations = [];

    for (const skill of targetSkills) {
      // Get courses from knowledge graph
      const relatedCourses = this.knowledgeGraph.findRelatedCourses(skill);
      
      // Scrape fresh course data
      const scrapedCourses = await this.scrapingService.scrapeCourseData(skill);
      
      // Combine and enhance course data
      const enhancedCourses = this.enhanceCourseData(
        [...relatedCourses, ...scrapedCourses],
        userProfile,
        userCurrentLevel
      );

      recommendations.push({
        skill,
        courses: enhancedCourses.slice(0, 5), // Top 5 recommendations
        learningPath: this.generateLearningPath(skill, userCurrentLevel)
      });
    }

    return this.rankRecommendations(recommendations, userProfile);
  }

  enhanceCourseData(courses, userProfile, userLevel) {
    return courses.map(course => {
      const personalizedScore = this.calculatePersonalizedScore(
        course,
        userProfile,
        userLevel
      );
      
      return {
        ...course,
        personalizedScore,
        matchReasons: this.getMatchReasons(course, userProfile),
        estimatedCompletionTime: this.estimateCompletionTime(course, userLevel),
        prerequisites: this.identifyPrerequisites(course),
        careerRelevance: this.assessCareerRelevance(course, userProfile)
      };
    });
  }

  calculatePersonalizedScore(course, userProfile, userLevel) {
    let score = course.rating || 4.0;
    
    // Level matching
    if (this.matchesUserLevel(course.level, userLevel)) {
      score += 0.5;
    }
    
    // Career goal alignment
    if (userProfile.careerGoals && 
        course.skills.some(skill => userProfile.careerGoals.includes(skill))) {
      score += 0.3;
    }
    
    // Learning preferences
    if (userProfile.preferredDuration && 
        this.matchesDurationPreference(course.duration, userProfile.preferredDuration)) {
      score += 0.2;
    }
    
    return Math.min(score, 5.0);
  }

  generateLearningPath(skill, userLevel) {
    // Generate step-by-step learning path
    const pathSteps = [];
    
    if (userLevel === 'beginner') {
      pathSteps.push(
        { step: 1, title: `${skill} Fundamentals`, duration: '2-4 weeks' },
        { step: 2, title: `${skill} Practical Projects`, duration: '4-6 weeks' },
        { step: 3, title: `Advanced ${skill} Concepts`, duration: '6-8 weeks' }
      );
    } else if (userLevel === 'intermediate') {
      pathSteps.push(
        { step: 1, title: `Advanced ${skill} Techniques`, duration: '3-5 weeks' },
        { step: 2, title: `${skill} Best Practices`, duration: '4-6 weeks' },
        { step: 3, title: `${skill} Specialization`, duration: '6-10 weeks' }
      );
    }
    
    return pathSteps;
  }

  getUserProfile(userId) {
    return this.userProfiles.get(userId) || {
      careerGoals: [],
      preferredDuration: 'medium',
      learningStyle: 'mixed',
      completedCourses: [],
      skillLevels: new Map()
    };
  }

  // Utility methods
  matchesUserLevel(courseLevel, userLevel) {
    const levelMap = {
      'beginner': ['beginner', 'beginner to intermediate'],
      'intermediate': ['intermediate', 'beginner to advanced'],
      'advanced': ['advanced', 'intermediate to advanced']
    };
    
    return levelMap[userLevel]?.some(level => 
      courseLevel.toLowerCase().includes(level)
    );
  }

  matchesDurationPreference(courseDuration, preferredDuration) {
    // Simple duration matching logic
    const duration = courseDuration.toLowerCase();
    
    switch (preferredDuration) {
      case 'short': return duration.includes('week') || duration.includes('hour');
      case 'medium': return duration.includes('month');
      case 'long': return duration.includes('month') && !duration.includes('1 month');
      default: return true;
    }
  }

  getMatchReasons(course, userProfile) {
    const reasons = [];
    
    if (course.rating >= 4.5) reasons.push('Highly rated course');
    if (course.enrollments > 50000) reasons.push('Popular choice');
    if (userProfile.careerGoals.some(goal => 
        course.skills.includes(goal))) {
      reasons.push('Matches your career goals');
    }
    
    return reasons;
  }

  estimateCompletionTime(course, userLevel) {
    // Estimate based on course duration and user level
    const baseDuration = this.parseDuration(course.duration);
    const levelMultiplier = {
      'beginner': 1.3,
      'intermediate': 1.0,
      'advanced': 0.8
    };
    
    return baseDuration * (levelMultiplier[userLevel] || 1.0);
  }

  parseDuration(duration) {
    // Simple duration parsing
    const match = duration.match(/(\d+)\s*(hour|week|month)/);
    if (!match) return 40; // default 40 hours
    
    const [, amount, unit] = match;
    const multipliers = { hour: 1, week: 40, month: 160 };
    return parseInt(amount) * (multipliers[unit] || 40);
  }

  identifyPrerequisites(course) {
    // Identify course prerequisites based on skills
    return course.skills.filter(skill => 
      this.knowledgeGraph.nodes.has(skill)
    );
  }

  assessCareerRelevance(course, userProfile) {
    // Assess how relevant the course is to user's career goals
    const overlap = course.skills.filter(skill => 
      userProfile.careerGoals.includes(skill)
    );
    
    return overlap.length / Math.max(course.skills.length, 1);
  }

  rankRecommendations(recommendations, userProfile) {
    return recommendations.map(rec => ({
      ...rec,
      courses: rec.courses.sort((a, b) => b.personalizedScore - a.personalizedScore)
    })).sort((a, b) => {
      const avgScoreA = a.courses.reduce((sum, c) => sum + c.personalizedScore, 0) / a.courses.length;
      const avgScoreB = b.courses.reduce((sum, c) => sum + c.personalizedScore, 0) / b.courses.length;
      return avgScoreB - avgScoreA;
    });
  }
}

// 4. Integration Service
class CourseRecommendationService {
  constructor() {
    this.engine = new EnhancedCourseRecommendationEngine();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.engine.initializeKnowledgeGraph();
      this.initialized = true;
    }
  }

  async getRecommendations(userId, skillGaps, userLevel) {
    await this.initialize();
    
    return await this.engine.generateRecommendations(
      userId, 
      skillGaps, 
      userLevel
    );
  }

  async updateUserProfile(userId, profileData) {
    this.engine.userProfiles.set(userId, {
      ...this.engine.getUserProfile(userId),
      ...profileData
    });
  }

  async addCourseToKnowledgeGraph(courseData) {
    this.engine.knowledgeGraph.addNode(
      courseData.id, 
      'course', 
      courseData
    );
    
    // Add relationships to skills
    courseData.skills.forEach(skill => {
      this.engine.knowledgeGraph.addEdge(
        skill, 
        courseData.id, 
        'teaches', 
        0.8
      );
    });
  }
}

// Export for use in your application
export {
  KnowledgeGraph,
  CourseScrapingService,
  EnhancedCourseRecommendationEngine,
  CourseRecommendationService
};

// Example usage:
/*
const recommendationService = new CourseRecommendationService();

// Get recommendations for a user
const recommendations = await recommendationService.getRecommendations(
  'user123', 
  ['javascript', 'react', 'machine-learning'], 
  'intermediate'
);

console.log(recommendations);
*/