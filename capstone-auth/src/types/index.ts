// User and Authentication Types
export interface User {
  email: string;
  id: string;
  authenticated: boolean;
  provider?: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthConfig {
  loginEndpoint: string;
  logoutEndpoint: string;
  signupEndpoint: string;
  googleOAuthEndpoint: string;
  tokenKey: string;
  userKey: string;
}

// Resume and Skill Types
export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience?: string[];
  education?: string[];
  raw_text?: string;
  [key: string]: any;
}

export interface ProcessedResumeResponse {
  success: boolean;
  data: {
    raw_text: string;
    parsedResume: ResumeData;
  };
}

// Job and Skill Gap Analysis Types
export interface JobInfo {
  jobTitle: string;
  jobDescription: string;
}

export interface SkillGapAnalysis {
  matchedSkills?: string[];
  matchingSkills?: string[];
  partialMatches?: string[] | Array<{ skill: string; matchedWith: string; similarity: number }>;
  missingSkills: string[];
  criticalMissingSkills?: string[];
  overallFit?: number;
  matchPercentage?: number;
  detailedAnalysis?: {
    summary: string;
    exactMatches: number;
    partialMatches: number;
    totalMissing: number;
    criticalGaps: string[];
    mediumGaps: string[];
    optionalGaps: string[];
    strengths: string[];
    matchQuality?: string;
  };
  recommendations?: Array<{
    type: string;
    message: string;
    action: string;
  }>;
}

// Learning Roadmap Types
export interface CourseRecommendation {
  title: string;
  platform: string;
  duration: string;
  url?: string;
  level?: string;
  rating?: string;
}

export interface LearningPathStep {
  id?: number;
  skill: string;
  title?: string;
  description?: string;
  difficulty?: string;
  timeToLearn?: string;
  category?: string;
  isCritical?: boolean;
  priority?: string;
  recommended?: {
    courses: CourseRecommendation[];
    resources?: Resource[];
    projects?: Array<{
      id: number;
      title: string;
      difficulty: string;
      estimatedTime: string;
    }>;
  };
}

export interface Resource {
  type: string;
  title: string;
  url: string;
  description: string;
}

export interface LearningRoadmap {
  learningPath?: LearningPathStep[];
  roadmap?: LearningPathStep[];
  estimatedTimeToComplete?: string;
  recommendedResources?: Resource[];
  recommendedCourses?: CourseRecommendation[];
  projectIdeas?: Array<{
    id: number;
    title: string;
    difficulty: string;
    estimatedTime: string;
  }>;
  message?: string;
  readinessScore?: number;
  totalLearningTime?: string;
  jobTitle?: string;
  missingSkills?: string[];
  metadata?: any;
}

// OCR Types
export interface OCRResult {
  text: string;
  confidence: number;
}

// Knowledge Graph Types
export interface CourseNode {
  id: string;
  name: string;
  type: string;
  difficulty?: string;
  duration?: string;
  [key: string]: any;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

// Component Props Types
export interface StatusBadgeProps {
  count: number | string;
  label: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'destructive';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
