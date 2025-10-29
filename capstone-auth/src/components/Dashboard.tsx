import React, { useState } from 'react';
import ResumeUploader from './ResumeUploader';
import JobDescription from './JobDescription';
import SkillGapAnalysis from './SkillGapAnalysis';
import LearningRoadmap from './LearningRoadmap';
import KnowledgeGraphDashboard from './KnowledgeGraphDashboard';
import HelpTips from './HelpTips';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ResumeData, SkillGapAnalysis as SkillGapType, LearningRoadmap as RoadmapType, JobInfo } from '../types';
// @ts-ignore
import { extractJobSkills, analyzeSkillGap, generateLearningRoadmap } from '../services/aiService';
// @ts-ignore
import { CourseRecommendationService } from '../services/knowledgeGraph';
import { RotateCcw, Printer, CheckCircle, Sparkles, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [analysis, setAnalysis] = useState<SkillGapType | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseService] = useState(() => new CourseRecommendationService());
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);

  const handleResumeUpload = async (parsedResumeData: ResumeData) => {
    setLoading(true);
    setError('');
    
    try {
      setResumeData(parsedResumeData);
      setCurrentStep(2);
    } catch (err: any) {
      setError('Error processing resume: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJobDescriptionSubmit = async (jobInfoData: JobInfo) => {
    setLoading(true);
    setError('');
    
    try {
      setJobInfo(jobInfoData);
      
      console.log('Extracting job skills with enhanced context...');
      const jobSkillsResult = await extractJobSkills(jobInfoData.jobDescription);
      console.log('Enhanced job skills extraction result:', {
        skillsCount: jobSkillsResult.skills?.length,
        hasDetails: !!jobSkillsResult.detailedSkills,
        hasExperience: !!jobSkillsResult.experienceRequirements
      });
      
      if (!resumeData || !resumeData.skills || resumeData.skills.length === 0) {
        throw new Error('No resume skills found. Please upload your resume first.');
      }
      
      console.log('Analyzing skill gap with semantic matching...');
      console.log('Resume skills:', resumeData.skills.length);
      console.log('Job skills:', jobSkillsResult.skills?.length || 0);
      
      // Use enhanced skill gap analysis with job context
      const gapAnalysis = await analyzeSkillGap(
        resumeData.skills, 
        jobSkillsResult.skills || [], 
        jobSkillsResult.detailedSkills || {}
      );
      
      console.log('Enhanced skill gap analysis:', {
        matchPercentage: gapAnalysis.matchPercentage,
        exactMatches: gapAnalysis.matchingSkills?.length,
        partialMatches: gapAnalysis.partialMatches?.length,
        missing: gapAnalysis.missingSkills?.length,
        critical: gapAnalysis.criticalMissingSkills?.length
      });
      
      setAnalysis(gapAnalysis);
      
      // Generate comprehensive learning roadmap
      let learningRoadmap: RoadmapType;
      if (gapAnalysis.missingSkills && gapAnalysis.missingSkills.length > 0) {
        console.log('Generating comprehensive roadmap...');
        learningRoadmap = await generateLearningRoadmap(
          gapAnalysis.missingSkills, 
          jobInfoData.jobTitle,
          gapAnalysis.criticalMissingSkills || []
        );
        console.log('Roadmap generated:', {
          pathLength: learningRoadmap.learningPath?.length,
          totalTime: learningRoadmap.estimatedTimeToComplete,
          readinessScore: learningRoadmap.readinessScore
        });
      } else {
        learningRoadmap = {
          learningPath: [],
          estimatedTimeToComplete: '0 weeks',
          recommendedResources: [],
          readinessScore: 100,
          message: '🎉 Congratulations! You already have all the required skills for this position.'
        };
      }
      
      setRoadmap(learningRoadmap);
      setCurrentStep(3);
    } catch (err: any) {
      console.error('Error in handleJobDescriptionSubmit:', err);
      setError('Error analyzing job requirements: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setCurrentStep(1);
    setResumeData(null);
    setAnalysis(null);
    setRoadmap(null);
    setJobInfo(null);
    setError('');
  };

  const steps = [
    { number: 1, label: 'Upload Resume' },
    { number: 2, label: 'Job Description' },
    { number: 3, label: 'Results' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 p-4 md:p-8 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <HelpTips />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header with gradient */}
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Career Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Skill Gap Analyzer & Roadmap Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Upload your resume, enter a job description, and get <span className="font-semibold text-blue-600 dark:text-blue-400">personalized insights</span> and <span className="font-semibold text-purple-600 dark:text-purple-400">learning paths</span> powered by advanced AI.
          </p>
        </div>
        
        {/* Progress Tracker with enhanced design */}
        <Card className="shadow-lg border-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 animate-slideUp">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-110 animate-pulse-glow' 
                        : 'bg-muted text-muted-foreground scale-100'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-7 h-7" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className={`mt-3 text-sm font-semibold transition-colors ${
                      currentStep >= step.number ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-4 -mt-10 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: currentStep > step.number ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2 bg-blue-100 dark:bg-blue-900/30" />
          </CardContent>
        </Card>
        
        {/* Error Banner with enhanced design */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md dark:bg-red-950/50 dark:text-red-300 animate-slideUp flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Error Occurred</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {/* Main Content with animation */}
        <div className="space-y-6 animate-fadeIn">
          {currentStep === 1 && (
            <div className="animate-slideUp">
              <ResumeUploader onResumeProcessed={handleResumeUpload} />
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="animate-slideUp">
              <JobDescription onJobDescriptionSubmit={handleJobDescriptionSubmit} />
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <SkillGapAnalysis analysis={analysis} loading={loading} />
              <LearningRoadmap roadmap={roadmap} loading={loading} />
              
              {analysis && analysis.missingSkills && analysis.missingSkills.length > 0 && (
                <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                  <KnowledgeGraphDashboard 
                    courseService={courseService}
                    userSkills={resumeData?.skills || []}
                    targetSkills={analysis.missingSkills || []}
                  />
                </div>
              )}
              
              <Card className="shadow-lg border-2 backdrop-blur-sm bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button 
                      onClick={resetProcess} 
                      variant="outline" 
                      size="lg"
                      className="border-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Start Over
                    </Button>
                    <Button 
                      onClick={() => window.print()} 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      Print Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
