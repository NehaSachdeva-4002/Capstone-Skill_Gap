// backend/services/courseService.js

/**
 * Course Recommendation Service
 * Generates personalized course recommendations based on skill gaps
 */
class CourseService {
  
  /**
   * Comprehensive course database organized by skills
   * Data sourced from actual course platforms
   */
  static COURSE_DATABASE = {
    // Programming Languages
    'python': [
      {
        id: 'py-01',
        title: 'Complete Python Bootcamp: Go from Zero to Hero',
        provider: 'Udemy',
        instructor: 'Jose Portilla',
        rating: 4.6,
        students: 1900000,
        duration: '22 hours',
        price: 84.99,
        level: 'Beginner',
        url: 'https://www.udemy.com/course/complete-python-bootcamp/',
        description: 'Learn Python like a Professional! Start from basics and go all the way to creating your own applications and games.',
        skills: ['python', 'object-oriented programming', 'decorators'],
        lastUpdated: '2024-10-15'
      },
      {
        id: 'py-02',
        title: 'Python for Data Science and Machine Learning Bootcamp',
        provider: 'Udemy',
        instructor: 'Jose Portilla',
        rating: 4.6,
        students: 800000,
        duration: '25 hours',
        price: 84.99,
        level: 'Intermediate',
        url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
        description: 'Learn Python for data science, including NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and more!',
        skills: ['python', 'pandas', 'numpy', 'matplotlib', 'machine learning'],
        lastUpdated: '2024-09-20'
      },
      {
        id: 'py-03',
        title: 'Python Programming Masterclass',
        provider: 'Coursera',
        instructor: 'University of Michigan',
        rating: 4.8,
        students: 500000,
        duration: '32 hours',
        price: 'Free (audit)',
        level: 'Beginner',
        url: 'https://www.coursera.org/learn/python',
        description: 'This course will introduce you to the fundamentals of Python programming.',
        skills: ['python', 'programming fundamentals', 'data structures'],
        lastUpdated: '2024-08-10'
      }
    ],

    'javascript': [
      {
        id: 'js-01',
        title: 'The Complete JavaScript Course 2024',
        provider: 'Udemy',
        instructor: 'Jonas Schmedtmann',
        rating: 4.7,
        students: 750000,
        duration: '69 hours',
        price: 84.99,
        level: 'All Levels',
        url: 'https://www.udemy.com/course/the-complete-javascript-course/',
        description: 'The modern JavaScript course for everyone! Master JavaScript with projects, challenges, and theory.',
        skills: ['javascript', 'es6', 'async programming', 'dom manipulation'],
        lastUpdated: '2024-10-01'
      },
      {
        id: 'js-02',
        title: 'JavaScript Algorithms and Data Structures',
        provider: 'freeCodeCamp',
        instructor: 'freeCodeCamp',
        rating: 4.9,
        students: 1000000,
        duration: '300 hours',
        price: 'Free',
        level: 'Beginner to Advanced',
        url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
        description: 'Learn fundamental programming concepts, algorithms, and data structures.',
        skills: ['javascript', 'algorithms', 'data structures', 'problem solving'],
        lastUpdated: '2024-09-15'
      }
    ],

    'react': [
      {
        id: 'react-01',
        title: 'Complete React Developer (w/ Redux, Hooks, GraphQL)',
        provider: 'Udemy',
        instructor: 'Andrei Neagoie',
        rating: 4.7,
        students: 200000,
        duration: '40 hours',
        price: 84.99,
        level: 'Intermediate',
        url: 'https://www.udemy.com/course/complete-react-developer-zero-to-mastery/',
        description: 'Build enterprise-level React applications using React, Redux, Hooks, Context API, React Router, and Firebase.',
        skills: ['react', 'redux', 'hooks', 'react router', 'firebase'],
        lastUpdated: '2024-10-20'
      },
      {
        id: 'react-02',
        title: 'React - The Complete Guide 2024',
        provider: 'Udemy',
        instructor: 'Maximilian Schwarzmüller',
        rating: 4.6,
        students: 650000,
        duration: '49 hours',
        price: 84.99,
        level: 'All Levels',
        url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
        description: 'Dive in and learn React.js from scratch! Learn React, Hooks, Redux, React Router, Next.js, and more!',
        skills: ['react', 'hooks', 'redux', 'next.js', 'typescript'],
        lastUpdated: '2024-10-10'
      },
      {
        id: 'react-03',
        title: 'Frontend Masters: Complete Intro to React v8',
        provider: 'Frontend Masters',
        instructor: 'Brian Holt',
        rating: 4.8,
        students: 50000,
        duration: '6 hours',
        price: 39.00,
        level: 'Intermediate',
        url: 'https://frontendmasters.com/courses/complete-react-v8/',
        description: 'Learn to build real-world applications with React, React Router, and more modern tools.',
        skills: ['react', 'vite', 'react router', 'testing'],
        lastUpdated: '2024-09-01'
      }
    ],

    'nodejs': [
      {
        id: 'node-01',
        title: 'The Complete Node.js Developer Course',
        provider: 'Udemy',
        instructor: 'Andrew Mead',
        rating: 4.7,
        students: 400000,
        duration: '35 hours',
        price: 84.99,
        level: 'All Levels',
        url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/',
        description: 'Learn Node.js by building real-world applications with Node, Express, MongoDB, Jest, and more!',
        skills: ['nodejs', 'express', 'mongodb', 'rest api', 'testing'],
        lastUpdated: '2024-09-25'
      },
      {
        id: 'node-02',
        title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
        provider: 'Udemy',
        instructor: 'Jonas Schmedtmann',
        rating: 4.7,
        students: 200000,
        duration: '42 hours',
        price: 84.99,
        level: 'Intermediate',
        url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/',
        description: 'Master Node by building a real-world RESTful API and web app (with authentication, Node.js security, payments & more)',
        skills: ['nodejs', 'express', 'mongodb', 'jwt', 'api security'],
        lastUpdated: '2024-10-05'
      }
    ],

    'machine learning': [
      {
        id: 'ml-01',
        title: 'Machine Learning Specialization',
        provider: 'Coursera',
        instructor: 'Andrew Ng',
        rating: 4.9,
        students: 1500000,
        duration: '3 months',
        price: 49.00,
        level: 'Beginner',
        url: 'https://www.coursera.org/specializations/machine-learning-introduction',
        description: 'Break into AI with the Machine Learning Specialization taught by AI pioneer Andrew Ng.',
        skills: ['machine learning', 'supervised learning', 'unsupervised learning', 'neural networks'],
        lastUpdated: '2024-08-30'
      },
      {
        id: 'ml-02',
        title: 'Applied Machine Learning in Python',
        provider: 'Coursera',
        instructor: 'University of Michigan',
        rating: 4.6,
        students: 300000,
        duration: '5 weeks',
        price: 'Free (audit)',
        level: 'Intermediate',
        url: 'https://www.coursera.org/learn/python-machine-learning',
        description: 'This course introduces learners to applied machine learning, focusing on techniques and methods.',
        skills: ['machine learning', 'scikit-learn', 'model evaluation', 'feature engineering'],
        lastUpdated: '2024-07-15'
      }
    ],

    'docker': [
      {
        id: 'docker-01',
        title: 'Docker Mastery: with Kubernetes +Swarm from a Docker Captain',
        provider: 'Udemy',
        instructor: 'Bret Fisher',
        rating: 4.6,
        students: 200000,
        duration: '19 hours',
        price: 84.99,
        level: 'All Levels',
        url: 'https://www.udemy.com/course/docker-mastery/',
        description: 'Build, compose, deploy, and manage Docker containers from development to DevOps deployments',
        skills: ['docker', 'kubernetes', 'docker-compose', 'containerization'],
        lastUpdated: '2024-09-10'
      }
    ],

    'aws': [
      {
        id: 'aws-01',
        title: 'AWS Certified Solutions Architect - Associate 2024',
        provider: 'Udemy',
        instructor: 'Stephane Maarek',
        rating: 4.7,
        students: 700000,
        duration: '27 hours',
        price: 84.99,
        level: 'Intermediate',
        url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',
        description: 'Full Practice Exam with Explanations included! PASS the AWS Certified Solutions Architect Associate Certification.',
        skills: ['aws', 'cloud computing', 'ec2', 's3', 'lambda'],
        lastUpdated: '2024-10-12'
      }
    ],

    'sql': [
      {
        id: 'sql-01',
        title: 'The Complete SQL Bootcamp: Go from Zero to Hero',
        provider: 'Udemy',
        instructor: 'Jose Portilla',
        rating: 4.7,
        students: 500000,
        duration: '9 hours',
        price: 84.99,
        level: 'Beginner',
        url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/',
        description: 'Become an expert at SQL! Learn to read and write complex queries to a database using PostgreSQL.',
        skills: ['sql', 'postgresql', 'database design', 'joins', 'queries'],
        lastUpdated: '2024-08-20'
      }
    ],

    'mongodb': [
      {
        id: 'mongo-01',
        title: 'MongoDB - The Complete Developer Guide 2024',
        provider: 'Udemy',
        instructor: 'Maximilian Schwarzmüller',
        rating: 4.6,
        students: 150000,
        duration: '17 hours',
        price: 84.99,
        level: 'All Levels',
        url: 'https://www.udemy.com/course/mongodb-the-complete-developers-guide/',
        description: 'Master MongoDB Development for Web & Mobile Apps. CRUD Operations, Indexes, Aggregation Framework - All in One Place!',
        skills: ['mongodb', 'nosql', 'aggregation', 'indexing'],
        lastUpdated: '2024-09-05'
      }
    ]
  };

  /**
   * Get course recommendations for a specific skill
   */
  static getCoursesForSkill(skill) {
    const normalizedSkill = skill.toLowerCase().trim();
    
    // Direct match
    if (this.COURSE_DATABASE[normalizedSkill]) {
      return this.COURSE_DATABASE[normalizedSkill];
    }
    
    // Handle skill variations
    const skillVariations = {
      'node.js': 'nodejs',
      'node': 'nodejs',
      'reactjs': 'react',
      'react.js': 'react',
      'js': 'javascript',
      'typescript': 'javascript',
      'ml': 'machine learning',
      'ai': 'machine learning',
      'postgres': 'sql',
      'postgresql': 'sql',
      'mysql': 'sql',
      'mongo': 'mongodb'
    };
    
    const mappedSkill = skillVariations[normalizedSkill];
    if (mappedSkill && this.COURSE_DATABASE[mappedSkill]) {
      return this.COURSE_DATABASE[mappedSkill];
    }
    
    // If no direct match, return generic programming courses
    return this.getGenericCourses(skill);
  }

  /**
   * Get generic courses when specific skill not found
   */
  static getGenericCourses(skill) {
    return [
      {
        id: `generic-${skill}`,
        title: `Learn ${skill} - Complete Guide`,
        provider: 'Multiple Platforms',
        instructor: 'Various',
        rating: 4.5,
        students: 10000,
        duration: '20-40 hours',
        price: 'Varies',
        level: 'All Levels',
        url: `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}+course`,
        description: `Comprehensive ${skill} course covering fundamentals to advanced topics.`,
        skills: [skill],
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    ];
  }

  /**
   * Generate learning roadmap for a skill
   */
  static generateLearningPath(skill, userLevel = 'beginner') {
    const courses = this.getCoursesForSkill(skill);
    
    // Sort by difficulty: Beginner → All Levels → Intermediate → Advanced
    const difficultyOrder = { 'Beginner': 1, 'All Levels': 2, 'Intermediate': 3, 'Advanced': 4 };
    const sortedCourses = [...courses].sort((a, b) => {
      const levelA = difficultyOrder[a.level] || 2;
      const levelB = difficultyOrder[b.level] || 2;
      return levelA - levelB;
    });

    return {
      skill,
      phases: [
        {
          phase: 1,
          title: 'Fundamentals',
          duration: '4-6 weeks',
          description: `Learn the basics of ${skill}`,
          courses: sortedCourses.filter(c => c.level === 'Beginner' || c.level === 'All Levels').slice(0, 2)
        },
        {
          phase: 2,
          title: 'Practical Application',
          duration: '6-8 weeks',
          description: `Build projects with ${skill}`,
          courses: sortedCourses.filter(c => c.level === 'Intermediate' || c.level === 'All Levels').slice(0, 2)
        },
        {
          phase: 3,
          title: 'Mastery',
          duration: '8-12 weeks',
          description: `Advanced concepts and real-world applications`,
          courses: sortedCourses.filter(c => c.level === 'Advanced' || c.level === 'Intermediate').slice(0, 2)
        }
      ],
      totalDuration: '18-26 weeks',
      estimatedCost: this.calculateTotalCost(courses)
    };
  }

  /**
   * Calculate total cost of courses
   */
  static calculateTotalCost(courses) {
    const total = courses.reduce((sum, course) => {
      if (typeof course.price === 'number') {
        return sum + course.price;
      }
      return sum;
    }, 0);
    
    return total > 0 ? `$${total.toFixed(2)}` : 'Free/Varied';
  }

  /**
   * Get recommendations for multiple skills
   */
  static getRecommendationsForSkills(skills) {
    const recommendations = {};
    
    skills.forEach(skill => {
      recommendations[skill] = {
        courses: this.getCoursesForSkill(skill).slice(0, 3), // Top 3 courses per skill
        learningPath: this.generateLearningPath(skill)
      };
    });
    
    return recommendations;
  }

  /**
   * Generate knowledge graph data structure
   */
  static generateKnowledgeGraphData(skills) {
    const nodes = [];
    const edges = [];
    
    // Add skill nodes
    skills.forEach((skill, index) => {
      nodes.push({
        data: {
          id: `skill-${index}`,
          label: skill,
          type: 'skill',
          color: '#3b82f6'
        }
      });
      
      // Add course nodes for this skill
      const courses = this.getCoursesForSkill(skill).slice(0, 3);
      courses.forEach((course, courseIndex) => {
        const courseId = `course-${index}-${courseIndex}`;
        nodes.push({
          data: {
            id: courseId,
            label: course.title,
            type: 'course',
            provider: course.provider,
            rating: course.rating,
            color: this.getProviderColor(course.provider)
          }
        });
        
        // Add edge connecting skill to course
        edges.push({
          data: {
            source: `skill-${index}`,
            target: courseId,
            label: 'teaches'
          }
        });
      });
    });
    
    return { nodes, edges };
  }

  /**
   * Get color based on provider
   */
  static getProviderColor(provider) {
    const colors = {
      'Udemy': '#a435f0',
      'Coursera': '#0056d2',
      'Frontend Masters': '#c02d28',
      'freeCodeCamp': '#0a0a23',
      'Multiple Platforms': '#64748b'
    };
    return colors[provider] || '#6b7280';
  }
}

module.exports = CourseService;
