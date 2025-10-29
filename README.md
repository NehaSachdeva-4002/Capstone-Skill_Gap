# 🎯 Skill Gap Analysis & Learning Roadmap Platform

> An AI-powered platform that analyzes your resume against job descriptions, identifies skill gaps, and generates personalized learning roadmaps with course recommendations.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Setup](#environment-setup)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

The **Skill Gap Analysis & Learning Roadmap Platform** is a comprehensive full-stack application designed to help job seekers and professionals:

- **Analyze Skills**: Upload resumes and compare them against job descriptions
- **Identify Gaps**: Discover missing skills and competencies
- **Learn & Grow**: Get personalized learning paths with curated course recommendations
- **Visualize Progress**: Interactive knowledge graphs showing skill relationships
- **Track Journey**: Monitor learning progress and skill acquisition

### 🎯 Key Use Cases

1. **Job Seekers**: Understand which skills you need to land your dream job
2. **Career Switchers**: Identify the gap between current and target role skills
3. **Students**: Plan your learning path based on industry requirements
4. **Professionals**: Stay competitive by identifying emerging skill needs

---

## ✨ Features

### 🔍 Core Features

#### 1. **Intelligent Resume Processing**
- 📄 OCR-powered text extraction from PDF and image files
- 🤖 AI-powered skill extraction and parsing
- 📊 Structured data extraction (name, contact, education, experience)
- 🔄 Support for multiple file formats (PDF, JPG, PNG, etc.)

#### 2. **Smart Job Analysis**
- 📝 Job description parsing and skill extraction
- 🎯 Requirement matching against your profile
- 📈 Match percentage calculation
- 🔎 Identifies both matching and missing skills

#### 3. **Skill Gap Analysis**
- ⚡ Real-time skill comparison
- 📊 Visual skill gap representation
- 🎨 Color-coded skill categories
- 📉 Detailed match percentage breakdown

#### 4. **Personalized Learning Roadmap**
- 🗺️ Step-by-step learning paths
- 📚 Course recommendations from top platforms
- ⏱️ Estimated learning time for each skill
- 🎓 Difficulty levels and prerequisites

#### 5. **Knowledge Graph Visualization**
- 🕸️ Interactive skill relationship graphs
- 🔗 Discover related skills and dependencies
- 📊 Visual learning path representation
- 🎯 Identify skill clusters and domains

#### 6. **Authentication & Security**
- 🔐 Firebase OAuth integration (Google & GitHub)
- 🔑 Email/Password authentication
- 🛡️ Secure session management
- 👤 User profile persistence

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript
- **UI Library**: Custom components with Radix UI primitives
- **Styling**: Tailwind CSS 3.3.0 + PostCSS
- **Routing**: React Router DOM 6.30.1
- **HTTP Client**: Axios 1.12.2
- **Icons**: Lucide React 0.546.0
- **Visualizations**: 
  - D3.js 7.8.5 (Data visualization)
  - Cytoscape 3.26.0 (Graph visualization)
- **Build Tool**: Create React App (react-scripts 5.0.1)

### Backend
- **Runtime**: Node.js with Express 4.18.2
- **OCR Engine**: Tesseract.js 4.1.1
- **PDF Processing**: pdf-parse 1.1.1
- **File Upload**: Multer 1.4.5
- **CORS**: cors 2.8.5

### Authentication
- **Firebase**: Firebase 12.4.0
  - Google OAuth
  - GitHub OAuth
  - Email/Password Auth

### Development Tools
- **TypeScript**: 5.9.3
- **Linting**: ESLint (via react-scripts)
- **Testing**: Jest + React Testing Library

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Dashboard  │  │  OCR Scanner │  │     Auth     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────┬───────┴──────────────────┘             │
│                    │                                        │
│            ┌───────▼────────┐                              │
│            │  Services Layer │                              │
│            └───────┬────────┘                              │
└────────────────────┼─────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js)                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Routes  │→ │Controllers│→ │ Services │→ │  OCR/AI  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  API Endpoints:                                             │
│  • /api/ocr/process-resume                                 │
│  • /api/extract-job-skills                                 │
│  • /api/analyze-skill-gap                                  │
│  • /api/generate-roadmap                                   │
│  • /api/courses                                            │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
src/
├── components/           # React Components
│   ├── ui/              # Reusable UI components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── OCRDashboard.tsx # OCR tool
│   ├── SkillGapAnalysis.tsx
│   ├── LearningRoadmap.tsx
│   └── ...
├── services/            # API & Business Logic
│   ├── backendService.js   # API calls
│   ├── aiService.js        # AI operations
│   ├── knowledgeGraph.js   # Graph logic
│   └── ...
├── types/               # TypeScript definitions
├── lib/                 # Utilities
└── App.tsx             # Main app component
```

### Backend Architecture (MVC Pattern)

```
backend/
├── controllers/         # Request handlers
│   └── ocrController.js
├── routes/             # API routes
│   ├── ocrRoutes.js
│   ├── resumeRoutes.js
│   ├── skillsRoutes.js
│   └── courseRoutes.js
├── services/           # Business logic
│   ├── ocrService.js
│   └── resumeService.js
└── server.js          # Entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Git**: Latest version
- **Firebase Account**: For authentication (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd capstone-auth
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure Firebase** (Optional)
   
   Create a Firebase project and update `src/firebase.js` with your config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. **Set Environment Variables** (Optional)
   
   Create `.env` in the root directory:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   ```

### Running the Application

#### Development Mode

1. **Start the Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```
   Backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server** (Terminal 2)
   ```bash
   npm start
   ```
   Frontend will run on `http://localhost:3000`

3. **Access the Application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

#### Production Build

```bash
# Build frontend
npm run build

# Serve production build (requires serve package)
npx serve -s build
```

---

## 📁 Project Structure

```
capstone-auth/
├── backend/                    # Backend server
│   ├── controllers/           # Request handlers
│   ├── routes/               # API endpoints
│   ├── services/             # Business logic
│   ├── package.json
│   └── server.js            # Entry point
│
├── src/                      # Frontend source
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Dashboard.tsx
│   │   ├── OCRDashboard.tsx
│   │   ├── ResumeUploader.tsx
│   │   ├── JobDescription.tsx
│   │   ├── SkillGapAnalysis.tsx
│   │   ├── LearningRoadmap.tsx
│   │   └── KnowledgeGraphDashboard.tsx
│   │
│   ├── services/           # API & business logic
│   │   ├── backendService.js
│   │   ├── aiService.js
│   │   ├── courseDataService.js
│   │   └── knowledgeGraph.js
│   │
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   │
│   ├── lib/              # Utilities
│   │   └── utils.ts
│   │
│   ├── App.tsx           # Main component
│   ├── auth.ts           # Auth service
│   ├── firebase.js       # Firebase config
│   ├── index.tsx         # Entry point
│   └── index.css         # Global styles
│
├── public/               # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
│
├── package.json          # Frontend dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind CSS config
├── postcss.config.js     # PostCSS config
└── README.md            # This file
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Process Resume (OCR)
```http
POST /api/ocr/process-resume
Content-Type: multipart/form-data

Body:
- resume: File (PDF or Image)

Response:
{
  "success": true,
  "data": {
    "raw_text": "Extracted text...",
    "parsedResume": {
      "name": "John Doe",
      "contact": {
        "email": "john@example.com",
        "phone": "+1-234-567-8900",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe"
      },
      "skills": ["JavaScript", "React", "Node.js"],
      "education": [...],
      "experience": [...],
      "projects": [...],
      "certifications": [...]
    }
  }
}
```

#### 2. Extract Job Skills
```http
POST /api/extract-job-skills
Content-Type: application/json

Body:
{
  "jobDescription": "We are looking for a Full Stack Developer..."
}

Response:
{
  "skills": ["react", "node.js", "mongodb", "typescript"]
}
```

#### 3. Analyze Skill Gap
```http
POST /api/analyze-skill-gap
Content-Type: application/json

Body:
{
  "resumeSkills": ["JavaScript", "React", "HTML", "CSS"],
  "jobSkills": ["React", "Node.js", "MongoDB", "TypeScript"]
}

Response:
{
  "missingSkills": ["Node.js", "MongoDB", "TypeScript"],
  "matchingSkills": ["React"],
  "matchPercentage": 25,
  "totalJobSkills": 4,
  "matchedSkills": 1
}
```

#### 4. Generate Learning Roadmap
```http
POST /api/generate-roadmap
Content-Type: application/json

Body:
{
  "missingSkills": ["Node.js", "MongoDB"],
  "jobTitle": "Full Stack Developer"
}

Response:
{
  "jobTitle": "Full Stack Developer",
  "missingSkills": ["Node.js", "MongoDB"],
  "roadmap": [
    {
      "skill": "Node.js",
      "title": "Learn Node.js",
      "description": "Master Node.js to match job requirements",
      "difficulty": "Intermediate",
      "timeToLearn": "4-6 weeks",
      "recommended": {
        "courses": [...],
        "resources": [...]
      }
    }
  ]
}
```

#### 5. Get Courses
```http
GET /api/courses
GET /api/courses/skill/:skillName

Response:
[
  {
    "id": 1,
    "title": "Introduction to Web Development",
    "platform": "Coursera",
    "skillsCovered": ["HTML", "CSS", "JavaScript"],
    "duration": "8 weeks"
  }
]
```

#### 6. Health Check
```http
GET /api/health-check

Response:
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## ⚙️ Environment Setup

### Frontend Environment Variables

Create `.env` in the root directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Firebase Configuration (Optional)
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Backend Environment Variables

Create `.env` in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 📖 Usage Guide

### 1. Sign Up / Sign In

Choose one of three authentication methods:
- **Email/Password**: Traditional signup
- **Google OAuth**: Sign in with Google
- **GitHub OAuth**: Sign in with GitHub

### 2. Upload Resume

1. Click **"Go to Dashboard"** or **"Resume OCR Scanner"**
2. Upload your resume (PDF or image format)
3. Wait for OCR processing (5-15 seconds)
4. Review extracted skills and information

### 3. Enter Job Description

1. Paste the job description
2. Enter the job title
3. Click **"Analyze Skills"**

### 4. View Skill Gap Analysis

- **Matched Skills**: Skills you already have ✅
- **Missing Skills**: Skills you need to learn ❌
- **Match Percentage**: Your qualification level 📊

### 5. Explore Learning Roadmap

- View step-by-step learning path
- Browse recommended courses
- Check estimated learning time
- Access learning resources

### 6. Knowledge Graph (Advanced)

- Visualize skill relationships
- Discover related skills
- Understand learning dependencies
- Explore skill domains

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Not Connecting
**Error**: `ERR_CONNECTION_REFUSED` on port 5000

**Solution**:
```bash
# Make sure backend is running
cd backend
npm start
```

#### 2. CORS Errors
**Error**: Cross-Origin Request Blocked

**Solution**:
- Ensure backend CORS is configured
- Check `backend/server.js` has `app.use(cors())`

#### 3. Firebase OAuth Issues
**Error**: Popup blocked or OAuth fails

**Solution**:
1. Enable popups for localhost in browser
2. Configure Firebase Console:
   - Enable Google/GitHub providers
   - Add `localhost` to authorized domains

#### 4. OCR Not Working
**Error**: Tesseract initialization failed

**Solution**:
- Clear browser cache
- Restart backend server
- Check file size (must be < 10MB)

#### 5. TypeScript Errors
**Error**: Module resolution errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

Enable detailed logging:

```javascript
// In browser console
localStorage.setItem('DEBUG', 'true');
```

---

## 🎨 Customization

### Tailwind Theme

Modify `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  }
}
```

### API Base URL

Update in `src/services/backendService.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
```

### Skill Keywords

Add more skills in `backend/routes/skillsRoutes.js`:

```javascript
const commonSkills = [
  'javascript', 'python', 'java',
  // Add your skills here
];
```

---

## 🧪 Testing

### Run Tests

```bash
# Frontend tests
npm test

# Backend tests (if configured)
cd backend
npm test
```

### Test Coverage

```bash
npm test -- --coverage
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy the `build/` folder

3. Set environment variables in your hosting platform

### Backend Deployment (Heroku/Railway)

1. Create `Procfile`:
   ```
   web: cd backend && npm start
   ```

2. Set environment variables

3. Deploy to your platform

### Environment Variables (Production)

Update API URLs:
```env
REACT_APP_API_BASE_URL=https://your-backend-url.com/api
```

---

## 📊 Performance

### Optimization Tips

1. **Code Splitting**: Lazy load routes
2. **Image Optimization**: Compress uploads before sending
3. **Caching**: Implement Redis for skill analysis
4. **CDN**: Use CDN for static assets

### Metrics

- **Resume Processing**: 5-15 seconds
- **Skill Analysis**: < 1 second
- **Page Load**: < 2 seconds
- **API Response**: < 500ms

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for new components
- Follow ESLint rules
- Use Tailwind CSS for styling
- Write meaningful commit messages

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **Neha Sachdeva** - *Initial work*

---

## 🙏 Acknowledgments

- Firebase for authentication
- Tesseract.js for OCR
- Radix UI for accessible components
- Tailwind CSS for styling
- React community for excellent tools

---

## 📞 Support

For support, email: nehasachdeva4002@gmail.com

---

## 🗺️ Roadmap

### Current Version (v0.1.0)
- ✅ Basic OCR functionality
- ✅ Skill gap analysis
- ✅ Learning roadmap generation
- ✅ Firebase authentication

### Upcoming Features
- 🔄 Real-time collaboration
- 📱 Mobile app
- 🤖 Advanced AI recommendations
- 📊 Progress tracking dashboard
- 🎓 Certification tracking
- 💼 Job application tracking
- 🔔 Skill trend notifications

---

## 📚 Additional Resources

- [Firebase OAuth Setup Guide](./FIREBASE_OAUTH_SETUP.md)
- [API Routes Documentation](./ROUTES_AND_CONNECTIONS_REPORT.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Quick Reference Guide](./OAUTH_QUICK_START.md)

---

<div align="center">

**Made with ❤️ using React, TypeScript, and Node.js**

[⬆ Back to Top](#-skill-gap-analysis--learning-roadmap-platform)

</div>
