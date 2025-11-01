import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Network, ExternalLink, BookOpen, AlertCircle } from 'lucide-react';
// @ts-ignore
import { courseAPI } from '../services/api';

interface KnowledgeGraphDashboardProps {
  courseService: any;
  userSkills: string[];
  targetSkills: string[];
}

const KnowledgeGraphDashboard: React.FC<KnowledgeGraphDashboardProps> = ({ 
  courseService, 
  userSkills, 
  targetSkills 
}) => {
  const [courseData, setCourseData] = useState<any>({});
  const [graphData, setGraphData] = useState<any>({ nodes: [], edges: [] });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseData = async () => {
      // If no target skills, reset state
      if (!targetSkills || targetSkills.length === 0) {
        setGraphData({ nodes: [], edges: [] });
        setCourseData({});
        setRecommendations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Loading course data from backend API for skills:', targetSkills);
        
        // Call real backend API instead of mock data
        const response = await courseAPI.getRecommendations(targetSkills);
        
        console.log('Backend API response:', response);
        
        // Transform response into component state
        const transformedData: any = {};
        const flatRecommendations: any[] = [];
        
        if (response.recommendations) {
          Object.entries(response.recommendations).forEach(([skill, data]: [string, any]) => {
            transformedData[skill] = {
              courses: data.courses || [],
              learningPath: data.learningPath || []
            };
            
            // Flatten courses for display
            if (data.courses && data.courses.length > 0) {
              data.courses.forEach((course: any) => {
                flatRecommendations.push({
                  ...course,
                  skill: skill // Add skill context
                });
              });
            }
          });
        }

        setCourseData(transformedData);
        setRecommendations(flatRecommendations);

        console.log('Transformed course data:', transformedData);
        console.log('Flat recommendations:', flatRecommendations);

        // Generate graph visualization data
        try {
          const graphResponse = await courseAPI.getKnowledgeGraphData(targetSkills);
          if (graphResponse && graphResponse.graphData) {
            setGraphData(graphResponse.graphData);
            console.log('Knowledge graph data loaded:', graphResponse.graphData);
          }
        } catch (graphErr) {
          console.warn('Knowledge graph not available, continuing without it:', graphErr);
          // Graph is optional, don't fail if it's not available
        }

        console.log('Successfully loaded real course data from backend');
      } catch (err: any) {
        console.error('Error loading courses from backend:', err);
        setError(err.message || 'Failed to load course recommendations. Please try again.');
        
        // Fallback to course service if backend fails
        if (courseService && targetSkills.length > 0) {
          console.log('Falling back to course service...');
          try {
            const recs = await courseService.getRecommendations(targetSkills);
            setRecommendations(recs || []);
            setError(null);
          } catch (fallbackErr) {
            console.error('Fallback also failed:', fallbackErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [targetSkills, courseService]);

  if (loading) {
    return (
      <Card className="shadow-lg border-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 border-r-pink-600 border-b-indigo-600 border-l-transparent"></div>
            <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 animate-ping"></div>
          </div>
          <p className="text-muted-foreground mt-6 font-medium">Loading personalized course recommendations...</p>
          <p className="text-sm text-muted-foreground mt-2">Analyzing your skill gaps</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 hover:shadow-xl transition-all duration-300 animate-slideUp">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-b-2 border-cyan-100 dark:border-cyan-900">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
            <Network className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Knowledge Graph & Course Recommendations
          </span>
        </CardTitle>
        <CardDescription className="text-base flex items-center gap-2 mt-2">
          <BookOpen className="w-4 h-4" />
          Personalized course recommendations based on your skill gaps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-md flex items-start gap-3 animate-slideUp">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Failed to load courses</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Course Recommendations */}
        {recommendations.length > 0 ? (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="flex items-center gap-6 text-sm font-semibold p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800 shadow-sm">
              <span className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <span className="text-xl">📚</span>
                <span>{recommendations.length} courses found</span>
              </span>
              <span className="text-cyan-600 dark:text-cyan-400">•</span>
              <span className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <span className="text-xl">🎯</span>
                <span>{Object.keys(courseData).length} skills covered</span>
              </span>
            </div>

            {/* Course Cards */}
            <div className="grid gap-5">
              {recommendations.map((course, index) => (
                <Card 
                  key={index} 
                  className="border-2 border-cyan-200 dark:border-cyan-800 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-cyan-50/30 dark:from-gray-900 dark:to-cyan-950/10 animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-bold text-lg text-cyan-900 dark:text-cyan-100">{course.name || course.title}</h4>
                        </div>
                        {course.description && (
                          <p className="text-sm text-cyan-700 dark:text-cyan-300 leading-relaxed pl-11">{course.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 pl-11">
                          {course.skill && (
                            <Badge variant="default" className="text-xs px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-sm">
                              🎯 {course.skill}
                            </Badge>
                          )}
                          {course.difficulty && (
                            <Badge variant="outline" className="text-xs px-3 py-1 border-2 border-cyan-400 text-cyan-700 dark:text-cyan-300">
                              {course.difficulty}
                            </Badge>
                          )}
                          {course.duration && (
                            <Badge variant="outline" className="text-xs px-3 py-1 border-2 border-blue-400 text-blue-700 dark:text-blue-300">
                              ⏱️ {course.duration}
                            </Badge>
                          )}
                          {course.platform && (
                            <Badge variant="secondary" className="text-xs px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300">
                              🏛️ {course.platform}
                            </Badge>
                          )}
                          {course.rating && (
                            <Badge variant="outline" className="text-xs px-3 py-1 border-2 border-yellow-400 text-yellow-700 dark:text-yellow-300 font-semibold">
                              ⭐ {course.rating}
                            </Badge>
                          )}
                        </div>
                        {course.enrollments && (
                          <p className="text-xs text-cyan-600 dark:text-cyan-400 pl-11 font-medium">
                            👥 {course.enrollments.toLocaleString()} students enrolled
                          </p>
                        )}
                      </div>
                      {course.url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0 hover:from-cyan-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          <a href={course.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            <span>View Course</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground animate-fadeIn">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
              <Network className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No course recommendations available at this time.</p>
            {targetSkills.length === 0 && (
              <p className="text-sm mt-3 text-gray-600 dark:text-gray-400">Upload a resume and enter a job description to get started.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeGraphDashboard;
