import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LearningRoadmap as LearningRoadmapType } from '../types';
import { Clock, BookOpen, Award, ExternalLink, CheckCircle2, Map, TrendingUp, Code2, AlertCircle } from 'lucide-react';

interface LearningRoadmapProps {
  roadmap: LearningRoadmapType | null;
  loading: boolean;
}

const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ roadmap, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Generating your personalized learning roadmap...</p>
        </CardContent>
      </Card>
    );
  }

  if (!roadmap) {
    return null;
  }

  // Handle both data structures
  const learningPath = roadmap.learningPath || roadmap.roadmap || [];
  const estimatedTimeToComplete = roadmap.estimatedTimeToComplete || roadmap.totalLearningTime || 'Varies';
  const recommendedResources = roadmap.recommendedResources || [];
  const recommendedCourses = roadmap.recommendedCourses || [];
  const projectIdeas = roadmap.projectIdeas || [];
  const readinessScore = roadmap.readinessScore;
  const successMessage = roadmap.message;

  // If no learning path and there's a success message, show congratulations
  if (learningPath.length === 0 && successMessage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-6 h-6 text-primary" />
            Learning Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-semibold">{successMessage}</h3>
            <p className="text-muted-foreground">
              You have all the required skills for this position. Great job!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no learning path at all, show nothing
  if (learningPath.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          Your Learning Roadmap
        </CardTitle>
        <CardDescription>
          A personalized path to help you become a stronger candidate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Readiness Score */}
        {typeof readinessScore === 'number' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Job Readiness Score
              </span>
              <span className="text-3xl font-bold text-blue-600">{readinessScore}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
              {readinessScore >= 80 && '🎉 Excellent! You\'re ready to apply.'}
              {readinessScore >= 60 && readinessScore < 80 && '👍 Good progress! Focus on critical skills.'}
              {readinessScore >= 40 && readinessScore < 60 && '💪 Keep learning! You\'re making progress.'}
              {readinessScore < 40 && '🚀 Start with critical skills first.'}
            </p>
          </div>
        )}
        
        {/* Time Estimate */}
        <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
          <Clock className="w-5 h-5 text-primary" />
          <span className="text-sm">
            Estimated time to complete: <strong>{estimatedTimeToComplete}</strong>
          </span>
        </div>
        
        {/* Learning Path Timeline */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Learning Path
          </h3>
          
          <div className="relative space-y-6 ml-4">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {learningPath.map((step, index) => (
              <div key={index} className="relative flex gap-4">
                {/* Timeline Marker */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                
                {/* Content */}
                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{step.skill || step.title}</CardTitle>
                    <CardDescription>{step.description || `Learn ${step.skill}`}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Details */}
                    <div className="flex flex-wrap gap-2">
                      {step.isCritical && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Critical
                        </Badge>
                      )}
                      {step.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {step.difficulty}
                        </Badge>
                      )}
                      {step.timeToLearn && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.timeToLearn}
                        </Badge>
                      )}
                      {step.category && (
                        <Badge variant="secondary" className="text-xs">
                          {step.category}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Recommended Courses */}
                    {step.recommended?.courses && step.recommended.courses.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Recommended Courses:
                        </h5>
                        <ul className="space-y-2">
                          {step.recommended.courses.slice(0, 3).map((course, idx) => (
                            <li key={idx} className="text-sm bg-muted p-2 rounded">
                              <div className="font-medium">{course.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center justify-between">
                                <span>{course.platform} · {course.duration}</span>
                                {course.rating && <span className="text-yellow-600">⭐ {course.rating}</span>}
                              </div>
                              {course.url && (
                                <a 
                                  href={course.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  View Course <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Project Ideas */}
                    {step.recommended?.projects && step.recommended.projects.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold flex items-center gap-1">
                          <Code2 className="w-4 h-4" />
                          Practice Projects:
                        </h5>
                        <ul className="space-y-1">
                          {step.recommended.projects.slice(0, 2).map((project, idx) => (
                            <li key={idx} className="text-xs bg-secondary/50 p-2 rounded">
                              <span className="font-medium">{project.title}</span>
                              <span className="text-muted-foreground ml-2">({project.estimatedTime})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recommended Resources */}
        {recommendedResources && recommendedResources.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Recommended Resources
            </h3>
            <div className="grid gap-3">
              {recommendedResources.map((resource, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            {resource.title}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningRoadmap;
