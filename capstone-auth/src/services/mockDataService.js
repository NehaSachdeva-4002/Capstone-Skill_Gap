// Mock data for development and testing

// Mock resume skills
export const mockResumeSkills = [
  'JavaScript',
  'React',
  'HTML',
  'CSS',
  'Node.js',
  'Express',
  'MongoDB',
  'Git',
  'Responsive Design',
  'Problem Solving',
  'Team Collaboration',
  'Communication',
];

// Mock job skills for Frontend Developer
export const mockJobSkills = [
  'JavaScript',
  'React',
  'Redux',
  'TypeScript',
  'HTML',
  'CSS',
  'Responsive Design',
  'Jest',
  'Webpack',
  'GraphQL',
  'UI/UX Design Principles',
  'Performance Optimization',
];

// Mock skill gap analysis
export const mockSkillGapAnalysis = {
  matchedSkills: [
    'JavaScript',
    'React',
    'HTML',
    'CSS',
    'Responsive Design',
  ],
  missingSkills: [
    'Redux',
    'TypeScript',
    'Jest',
    'Webpack',
    'GraphQL',
    'UI/UX Design Principles',
    'Performance Optimization',
  ],
  skillGapPercentage: 58,
  overallFit: 42,
};

// Mock learning roadmap
export const mockLearningRoadmap = {
  learningPath: [
    {
      skill: 'TypeScript',
      description: 'Learn TypeScript fundamentals and how to use it with React',
      difficulty: 'Intermediate',
      timeToLearn: '2 weeks',
    },
    {
      skill: 'Redux',
      description: 'Master state management with Redux and React-Redux',
      difficulty: 'Intermediate',
      timeToLearn: '3 weeks',
    },
    {
      skill: 'Jest',
      description: 'Learn testing React applications with Jest and React Testing Library',
      difficulty: 'Intermediate',
      timeToLearn: '2 weeks',
    },
    {
      skill: 'Webpack',
      description: 'Understand module bundling and optimization with Webpack',
      difficulty: 'Intermediate',
      timeToLearn: '1 week',
    },
    {
      skill: 'GraphQL',
      description: 'Learn GraphQL basics and how to use it with React',
      difficulty: 'Advanced',
      timeToLearn: '3 weeks',
    },
  ],
  estimatedTimeToComplete: '11 weeks',
  recommendedResources: [
    {
      type: 'Course',
      title: 'TypeScript for React Developers',
      url: 'https://www.udemy.com/course/typescript-for-react-developers/',
      description: 'Comprehensive course on TypeScript with React applications',
    },
    {
      type: 'Documentation',
      title: 'Redux Official Documentation',
      url: 'https://redux.js.org/',
      description: 'Official Redux documentation with examples and tutorials',
    },
    {
      type: 'Tutorial',
      title: 'Testing React Applications with Jest',
      url: 'https://jestjs.io/docs/tutorial-react',
      description: 'Official Jest tutorial for testing React applications',
    },
    {
      type: 'Book',
      title: 'GraphQL in Action',
      url: 'https://www.manning.com/books/graphql-in-action',
      description: 'Comprehensive guide to GraphQL API development',
    },
  ],
};

class EnhancedMockDataService {
  static getKnowledgeGraphSeedData() {
    return {
      skills: [
        // Programming Languages
        { id: 'javascript', name: 'JavaScript', category: 'Programming', difficulty: 'medium' },
        { id: 'python', name: 'Python', category: 'Programming', difficulty: 'easy' },
        { id: 'typescript', name: 'TypeScript', category: 'Programming', difficulty: 'medium' },
        { id: 'java', name: 'Java', category: 'Programming', difficulty: 'medium' },
        
        // Frontend
        { id: 'react', name: 'React', category: 'Frontend', difficulty: 'medium' },
        { id: 'vue', name: 'Vue.js', category: 'Frontend', difficulty: 'medium' },
        { id: 'angular', name: 'Angular', category: 'Frontend', difficulty: 'hard' },
        { id: 'html-css', name: 'HTML/CSS', category: 'Frontend', difficulty: 'easy' },
        
        // Backend
        { id: 'nodejs', name: 'Node.js', category: 'Backend', difficulty: 'medium' },
        { id: 'express', name: 'Express.js', category: 'Backend', difficulty: 'easy' },
        { id: 'django', name: 'Django', category: 'Backend', difficulty: 'medium' },
        { id: 'spring', name: 'Spring Boot', category: 'Backend', difficulty: 'hard' },
        
        // Database
        { id: 'mongodb', name: 'MongoDB', category: 'Database', difficulty: 'medium' },
        { id: 'postgresql', name: 'PostgreSQL', category: 'Database', difficulty: 'medium' },
        { id: 'redis', name: 'Redis', category: 'Database', difficulty: 'easy' },
        
        // DevOps & Cloud
        { id: 'docker', name: 'Docker', category: 'DevOps', difficulty: 'medium' },
        { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', difficulty: 'hard' },
        { id: 'aws', name: 'AWS', category: 'Cloud', difficulty: 'medium' },
        { id: 'ci-cd', name: 'CI/CD', category: 'DevOps', difficulty: 'medium' },
        
        // Data Science & ML
        { id: 'machine-learning', name: 'Machine Learning', category: 'AI/ML', difficulty: 'hard' },
        { id: 'data-analysis', name: 'Data Analysis', category: 'Data Science', difficulty: 'medium' },
        { id: 'tensorflow', name: 'TensorFlow', category: 'AI/ML', difficulty: 'hard' },
        { id: 'pandas', name: 'Pandas', category: 'Data Science', difficulty: 'medium' }
      ],
      
      relationships: [
        // Prerequisites
        { from: 'html-css', to: 'react', type: 'prerequisite', weight: 0.9 },
        { from: 'javascript', to: 'react', type: 'prerequisite', weight: 0.95 },
        { from: 'javascript', to: 'nodejs', type: 'prerequisite', weight: 0.9 },
        { from: 'javascript', to: 'typescript', type: 'prerequisite', weight: 0.8 },
        { from: 'nodejs', to: 'express', type: 'prerequisite', weight: 0.85 },
        { from: 'python', to: 'django', type: 'prerequisite', weight: 0.9 },
        { from: 'python', to: 'machine-learning', type: 'prerequisite', weight: 0.85 },
        { from: 'python', to: 'pandas', type: 'prerequisite', weight: 0.8 },
        { from: 'docker', to: 'kubernetes', type: 'prerequisite', weight: 0.9 },
        
        // Related skills
        { from: 'react', to: 'vue', type: 'related', weight: 0.7 },
        { from: 'react', to: 'angular', type: 'related', weight: 0.6 },
        { from: 'nodejs', to: 'express', type: 'related', weight: 0.9 },
        { from: 'mongodb', to: 'nodejs', type: 'related', weight: 0.8 },
        { from: 'postgresql', to: 'django', type: 'related', weight: 0.8 },
        { from: 'aws', to: 'docker', type: 'related', weight: 0.7 },
        { from: 'machine-learning', to: 'tensorflow', type: 'related', weight: 0.9 },
        { from: 'data-analysis', to: 'pandas', type: 'related', weight: 0.85 }
      ],
      
      courseTemplates: [
        {
          skillId: 'react',
          templates: [
            {
              title: 'Complete React Developer Course',
              level: 'beginner',
              duration: '50 hours',
              rating: 4.6,
              skills: ['react', 'javascript', 'html-css'],
              provider: 'Multiple'
            }
          ]
        },
        {
          skillId: 'python',
          templates: [
            {
              title: 'Python for Everybody Specialization',
              level: 'beginner',
              duration: '8 months',
              rating: 4.7,
              skills: ['python', 'data-analysis'],
              provider: 'Multiple'
            }
          ]
        }
      ]
    };
  }

  static getEnhancedJobRoles() {
    return [
      {
        id: 'fullstack-developer',
        title: 'Full Stack Developer',
        requiredSkills: ['javascript', 'react', 'nodejs', 'mongodb'],
        preferredSkills: ['typescript', 'aws', 'docker'],
        salaryRange: '$70k - $120k',
        careerPath: ['Junior Developer', 'Senior Developer', 'Tech Lead'],
        growthRate: 'High'
      },
      {
        id: 'data-scientist',
        title: 'Data Scientist',
        requiredSkills: ['python', 'machine-learning', 'data-analysis', 'pandas'],
        preferredSkills: ['tensorflow', 'aws', 'docker'],
        salaryRange: '$80k - $150k',
        careerPath: ['Data Analyst', 'Senior Data Scientist', 'ML Engineer'],
        growthRate: 'Very High'
      },
      {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        requiredSkills: ['docker', 'kubernetes', 'aws', 'ci-cd'],
        preferredSkills: ['python', 'monitoring', 'security'],
        salaryRange: '$90k - $140k',
        careerPath: ['System Admin', 'Senior DevOps', 'Platform Architect'],
        growthRate: 'High'
      }
    ];
  }
}

export default EnhancedMockDataService;