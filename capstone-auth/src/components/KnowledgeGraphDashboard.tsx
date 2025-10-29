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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading course recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-6 h-6 text-primary" />
          Knowledge Graph & Course Recommendations
        </CardTitle>
        <CardDescription>
          Personalized course recommendations based on your skill gaps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load courses</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Course Recommendations */}
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {/* Statistics */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>📚 {recommendations.length} courses found</span>
              <span>•</span>
              <span>🎯 {Object.keys(courseData).length} skills covered</span>
            </div>

            {/* Course Cards */}
            <div className="grid gap-4">
              {recommendations.map((course, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold">{course.name || course.title}</h4>
                        </div>
                        {course.description && (
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {course.skill && (
                            <Badge variant="default" className="text-xs">
                              {course.skill}
                            </Badge>
                          )}
                          {course.difficulty && (
                            <Badge variant="outline">{course.difficulty}</Badge>
                          )}
                          {course.duration && (
                            <Badge variant="outline">{course.duration}</Badge>
                          )}
                          {course.platform && (
                            <Badge variant="secondary">{course.platform}</Badge>
                          )}
                          {course.rating && (
                            <Badge variant="outline" className="text-yellow-600">
                              ⭐ {course.rating}
                            </Badge>
                          )}
                        </div>
                        {course.enrollments && (
                          <p className="text-xs text-muted-foreground">
                            {course.enrollments.toLocaleString()} students enrolled
                          </p>
                        )}
                      </div>
                      {course.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={course.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
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
          <div className="text-center py-8 text-muted-foreground">
            <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No course recommendations available at this time.</p>
            {targetSkills.length === 0 && (
              <p className="text-sm mt-2">Upload a resume and enter a job description to get started.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeGraphDashboard;
