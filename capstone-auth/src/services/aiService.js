import {
  parseResumeWithBackend,
  extractJobSkillsWithBackend,
  analyzeSkillGapWithBackend,
  generateLearningRoadmapWithBackend
} from './backendService';

// Parse resume from PDF file
export const parseResume = async (file) => {
  try {
    // Always use backend service for real file processing
    console.log('parseResume called with file:', file);
    
    // Directly use backend service to parse resume
    const result = await parseResumeWithBackend(file);
    console.log('Backend service result:', result);
    return result;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume: ' + error.message);
  }
};

// Extract required skills from job description with enhanced context
export const extractJobSkills = async (jobDescription) => {
  try {
    console.log('Extracting job skills with enhanced context...');
    
    // Use backend service to extract job skills with detailed information
    const result = await extractJobSkillsWithBackend(jobDescription);
    
    console.log('Job skills extracted:', {
      skillsCount: result.skills?.length,
      hasDetailedSkills: !!result.detailedSkills,
      hasExperienceReqs: !!result.experienceRequirements
    });
    
    return result;
  } catch (error) {
    console.error('Error extracting job skills:', error);
    throw new Error('Failed to extract job skills: ' + error.message);
  }
};

// Analyze skill gap between resume and job description with semantic matching
export const analyzeSkillGap = async (resumeSkills, jobSkills, jobContext = {}) => {
  try {
    console.log('Analyzing skill gap with semantic matching...');
    
    // Use backend service to analyze skill gap with enhanced semantic matching
    const result = await analyzeSkillGapWithBackend(resumeSkills, jobSkills, jobContext);
    
    console.log('Skill gap analysis result:', {
      matchPercentage: result.matchPercentage,
      exactMatches: result.matchingSkills?.length,
      partialMatches: result.partialMatches?.length,
      missing: result.missingSkills?.length,
      critical: result.criticalMissingSkills?.length
    });
    
    return result;
  } catch (error) {
    console.error('Error analyzing skill gap:', error);
    throw new Error('Failed to analyze skill gap: ' + error.message);
  }
};

// Generate comprehensive learning roadmap with course recommendations and project ideas
export const generateLearningRoadmap = async (missingSkills, jobTitle, criticalSkills = []) => {
  try {
    console.log('Generating comprehensive learning roadmap...');
    
    // Use backend service to generate comprehensive roadmap
    const result = await generateLearningRoadmapWithBackend(missingSkills, jobTitle, criticalSkills);
    
    console.log('Learning roadmap generated:', {
      pathLength: result.learningPath?.length,
      totalTime: result.estimatedTimeToComplete,
      readinessScore: result.readinessScore,
      hasResources: !!result.recommendedResources,
      hasCourses: !!result.recommendedCourses,
      hasProjects: !!result.projectIdeas
    });
    
    return result;
  } catch (error) {
    console.error('Error generating learning roadmap:', error);
    throw new Error('Failed to generate learning roadmap: ' + error.message);
  }
};

class EnhancedAIService {
  constructor() {
    this.knowledgeGraph = null;
    this.courseRecommendationService = null;
  }

  // Initialize with knowledge graph integration
  async initialize(courseRecommendationService) {
    this.courseRecommendationService = courseRecommendationService;
    await this.courseRecommendationService.initialize();
  }

  // Enhanced skill gap analysis with knowledge graph insights
  async analyzeSkillGapsWithKnowledgeGraph(userSkills, targetRole) {
    const basicGaps = await this.analyzeSkillGaps(userSkills, targetRole);
    
    // Enhance with knowledge graph insights
    const enhancedGaps = await Promise.all(
      basicGaps.map(async (gap) => {
        const relatedSkills = this.findRelatedSkills(gap.skill);
        const courseSuggestions = await this.courseRecommendationService
          .getRecommendations('user', [gap.skill], gap.level);
        
        return {
          ...gap,
          relatedSkills,
          courseSuggestions: courseSuggestions[0]?.courses.slice(0, 3) || [],
          learningPath: courseSuggestions[0]?.learningPath || []
        };
      })
    );

    return enhancedGaps;
  }

  // Find related skills using knowledge graph
  findRelatedSkills(skillId) {
    if (!this.courseRecommendationService?.engine?.knowledgeGraph) {
      return [];
    }

    const graph = this.courseRecommendationService.engine.knowledgeGraph;
    const skill = graph.nodes.get(skillId);
    
    if (!skill) return [];

    const relatedSkills = [];
    for (const connectedId of skill.connections) {
      const connectedNode = graph.nodes.get(connectedId);
      if (connectedNode && connectedNode.type === 'skill') {
        relatedSkills.push(connectedNode.data);
      }
    }

    return relatedSkills;
  }

  // Generate comprehensive learning roadmap
  async generateEnhancedRoadmap(userProfile, targetSkills) {
    const recommendations = await this.courseRecommendationService
      .getRecommendations(userProfile.id, targetSkills, userProfile.level);

    return {
      totalEstimatedTime: this.calculateTotalTime(recommendations),
      skillProgression: this.createSkillProgression(recommendations),
      milestones: this.createMilestones(recommendations),
      recommendations,
      prerequisites: this.identifyPrerequisites(targetSkills)
    };
  }

  calculateTotalTime(recommendations) {
    return recommendations.reduce((total, rec) => {
      const courseTime = rec.courses.reduce((sum, course) => 
        sum + (course.estimatedCompletionTime || 40), 0);
      return total + courseTime;
    }, 0);
  }

  createSkillProgression(recommendations) {
    return recommendations.map((rec, index) => ({
      order: index + 1,
      skill: rec.skill,
      phases: rec.learningPath,
      estimatedDuration: rec.courses[0]?.estimatedCompletionTime || 40
    }));
  }

  createMilestones(recommendations) {
    const milestones = [];
    let cumulativeTime = 0;

    recommendations.forEach((rec, index) => {
      const duration = rec.courses[0]?.estimatedCompletionTime || 40;
      cumulativeTime += duration;

      milestones.push({
        id: index + 1,
        title: `Master ${rec.skill}`,
        description: `Complete ${rec.skill} learning path`,
        estimatedWeeks: Math.ceil(duration / 40),
        cumulativeTime,
        courses: rec.courses.slice(0, 2)
      });
    });

    return milestones;
  }

  identifyPrerequisites(targetSkills) {
    if (!this.courseRecommendationService?.engine?.knowledgeGraph) {
      return [];
    }

    const graph = this.courseRecommendationService.engine.knowledgeGraph;
    const prerequisites = new Set();

    targetSkills.forEach(skillId => {
      // Find prerequisite relationships
      for (const [, edge] of graph.edges) {
        if (edge.to === skillId && edge.relationship === 'prerequisite') {
          const prereqNode = graph.nodes.get(edge.from);
          if (prereqNode) {
            prerequisites.add(prereqNode.data);
          }
        }
      }
    });

    return Array.from(prerequisites);
  }
}

const enhancedAIService = new EnhancedAIService();
export default enhancedAIService;