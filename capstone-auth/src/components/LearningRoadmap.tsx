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
    <Card className="shadow-lg border-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-2 border-purple-100 dark:border-purple-900">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
            <Map className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Learning Roadmap
          </span>
        </CardTitle>
        <CardDescription className="text-base flex items-center gap-2 mt-2">
          <TrendingUp className="w-4 h-4" />
          A personalized path to help you become a stronger candidate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Readiness Score */}
        {typeof readinessScore === 'number' && (
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-indigo-950/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-lg animate-slideUp hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold flex items-center gap-3 text-purple-900 dark:text-purple-100 text-lg">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Job Readiness Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {readinessScore}
                </span>
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">%</span>
              </div>
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-4 overflow-hidden shadow-inner relative">
              <div 
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                style={{ width: `${readinessScore}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-shimmer"></div>
              </div>
              {readinessScore >= 30 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">{readinessScore}%</span>
                </div>
              )}
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg mt-4 border border-purple-300 dark:border-purple-700 backdrop-blur-sm">
              <p className="text-base text-purple-800 dark:text-purple-200 font-semibold flex items-start gap-2">
                {readinessScore >= 80 && (
                  <>
                    <span className="text-2xl">🎉</span>
                    <span>Excellent! You're ready to apply with confidence.</span>
                  </>
                )}
                {readinessScore >= 60 && readinessScore < 80 && (
                  <>
                    <span className="text-2xl">👍</span>
                    <span>Good progress! Focus on critical skills to boost your chances.</span>
                  </>
                )}
                {readinessScore >= 40 && readinessScore < 60 && (
                  <>
                    <span className="text-2xl">💪</span>
                    <span>Keep learning! You're making solid progress.</span>
                  </>
                )}
                {readinessScore < 40 && (
                  <>
                    <span className="text-2xl">🚀</span>
                    <span>Start with critical skills first to accelerate your journey.</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
        
        {/* Time Estimate */}
        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 shadow-md hover:shadow-lg transition-all duration-300 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">Estimated Time to Complete</p>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{estimatedTimeToComplete}</p>
          </div>
        </div>
        
        {/* Learning Path Timeline */}
        <div className="space-y-5 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-bold flex items-center gap-3 text-xl text-purple-900 dark:text-purple-100">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            Learning Path
          </h3>
          
          <div className="relative space-y-8 ml-6">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-indigo-600 rounded-full shadow-lg"></div>
            
            {learningPath.map((step, index) => (
              <div key={index} className="relative flex gap-6 animate-slideUp" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                {/* Timeline Marker */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xl ring-4 ring-white dark:ring-gray-900 transform hover:scale-110 transition-all duration-300">
                    {index + 1}
                  </div>
                </div>
                
                {/* Content */}
                <Card className="flex-1 border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                  <CardHeader className="pb-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 border-b border-purple-100 dark:border-purple-900">
                    <CardTitle className="text-xl flex items-start gap-2">
                      <span className="text-2xl mt-0.5">🎯</span>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {step.skill || step.title}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-base mt-2">{step.description || `Learn ${step.skill}`}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Details */}
                    <div className="flex flex-wrap gap-2">
                      {step.isCritical && (
                        <Badge variant="destructive" className="text-xs px-3 py-1 bg-gradient-to-r from-red-500 to-orange-600 border-0 shadow-md animate-pulse">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Critical Priority
                        </Badge>
                      )}
                      {step.difficulty && (
                        <Badge variant="outline" className="text-xs px-3 py-1 border-2 border-purple-400 text-purple-700 dark:text-purple-300 shadow-sm">
                          <Award className="w-3 h-3 mr-1" />
                          {step.difficulty}
                        </Badge>
                      )}
                      {step.timeToLearn && (
                        <Badge variant="outline" className="text-xs px-3 py-1 border-2 border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.timeToLearn}
                        </Badge>
                      )}
                      {step.category && (
                        <Badge variant="secondary" className="text-xs px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 text-pink-700 dark:text-pink-300 shadow-sm">
                          {step.category}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Recommended Courses */}
                    {step.recommended?.courses && step.recommended.courses.length > 0 && (
                      <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h5 className="text-sm font-bold flex items-center gap-2 text-green-800 dark:text-green-200">
                          <CheckCircle2 className="w-4 h-4" />
                          Recommended Courses:
                        </h5>
                        <ul className="space-y-3">
                          {step.recommended.courses.slice(0, 3).map((course, idx) => (
                            <li key={idx} className="text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-300 dark:border-green-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                              <div className="font-semibold text-green-900 dark:text-green-100">📚 {course.title}</div>
                              <div className="text-xs text-green-700 dark:text-green-300 flex items-center justify-between mt-1">
                                <span className="flex items-center gap-1">
                                  <span>🏛️</span>
                                  {course.platform} • {course.duration}
                                </span>
                                {course.rating && <span className="text-yellow-600 dark:text-yellow-400 font-semibold">⭐ {course.rating}</span>}
                              </div>
                              {course.url && (
                                <a 
                                  href={course.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline flex items-center gap-1 mt-2 font-semibold transition-colors"
                                >
                                  🔗 View Course <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Project Ideas */}
                    {step.recommended?.projects && step.recommended.projects.length > 0 && (
                      <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h5 className="text-sm font-bold flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Code2 className="w-4 h-4" />
                          Practice Projects:
                        </h5>
                        <ul className="space-y-2">
                          {step.recommended.projects.slice(0, 2).map((project, idx) => (
                            <li key={idx} className="text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-300 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-300">
                              <span className="font-semibold text-blue-900 dark:text-blue-100">🛠️ {project.title}</span>
                              <span className="text-blue-600 dark:text-blue-400 ml-2">({project.estimatedTime})</span>
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
          <div className="space-y-4 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-bold flex items-center gap-3 text-xl text-indigo-900 dark:text-indigo-100">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              Recommended Resources
            </h3>
            <div className="grid gap-4">
              {recommendedResources.map((resource, index) => (
                <Card key={index} className="border-2 border-indigo-200 dark:border-indigo-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/10">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary" className="text-xs px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 shadow-sm">
                            {resource.type}
                          </Badge>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-2 text-base transition-colors"
                          >
                            {resource.title}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2 leading-relaxed">{resource.description}</p>
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
