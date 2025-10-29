import React from 'react';
import StatusBadge from './StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { SkillGapAnalysis as SkillGapType } from '../types';
import { CheckCircle2, PlusCircle, Target, TrendingUp } from 'lucide-react';

interface SkillGapAnalysisProps {
  analysis: SkillGapType | null;
  loading: boolean;
}

const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Analyzing skills and generating insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const { 
    matchedSkills = [], 
    missingSkills = [], 
    overallFit = 0,
    matchingSkills = [],
    partialMatches = [],
    criticalMissingSkills = [],
    matchPercentage = 0,
    detailedAnalysis,
    recommendations
  } = analysis;
  
  // Use matchingSkills or matchedSkills depending on what's available
  const matched = matchedSkills.length > 0 ? matchedSkills : matchingSkills;
  const fit = overallFit || matchPercentage || 0;
  
  // Extract partial match skills
  const partialSkills = Array.isArray(partialMatches) 
    ? partialMatches.map(m => typeof m === 'string' ? m : m.skill)
    : [];
  
  // Categorize missing skills
  const criticalMissing = criticalMissingSkills || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Skill Gap Analysis
        </CardTitle>
        <CardDescription>
          See how your skills match the job requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatusBadge 
            count={fit + '%'}
            label="Job Match"
            icon="🎯"
            color="primary"
          />
          <StatusBadge 
            count={matched.length}
            label="Exact Matches"
            icon="✅"
            color="success"
          />
          <StatusBadge 
            count={partialSkills.length}
            label="Partial Matches"
            icon="🔶"
            color="warning"
          />
          <StatusBadge 
            count={missingSkills.length}
            label="To Learn"
            icon="📚"
            color="destructive"
          />
        </div>
        
        {/* Overall Fit Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold">Overall Job Fit</span>
            </div>
            <span className="text-2xl font-bold text-primary">{fit}%</span>
          </div>
          <Progress value={fit} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {detailedAnalysis?.summary || 
              `You have ${matched.length} exact matches${partialSkills.length > 0 ? `, ${partialSkills.length} partial matches,` : ''} and ${missingSkills.length} skills to develop.`
            }
          </p>
        </div>
        
        {/* Skills Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Matched Skills */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Exact Matches ({matched.length})
            </h3>
            {matched.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matched.map((skill, index) => (
                  <Badge key={index} variant="success" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No exact matches found.</p>
            )}
          </div>
          
          {/* Partial Matches */}
          {partialSkills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Target className="w-5 h-5" />
                Partial Matches ({partialSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {partialSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm border-blue-500 text-blue-700 dark:text-blue-400">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Missing Skills */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <PlusCircle className="w-5 h-5" />
              Skills to Develop ({missingSkills.length})
            </h3>
            {missingSkills.length > 0 ? (
              <div className="space-y-2">
                {criticalMissing.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">🔴 Critical:</p>
                    <div className="flex flex-wrap gap-2">
                      {criticalMissing.map((skill, index) => (
                        <Badge key={index} variant="destructive" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {missingSkills.filter(s => !criticalMissing.includes(s)).length > 0 && (
                  <div>
                    {criticalMissing.length > 0 && <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1 mt-2">Other:</p>}
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.filter(s => !criticalMissing.includes(s)).map((skill, index) => (
                        <Badge key={index} variant="warning" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">🎉 No skill gaps identified!</p>
            )}
          </div>
        </div>
        
        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">💡 Recommendations</h3>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">{rec.message}</p>
                  <p className="text-blue-600 dark:text-blue-400 mt-1">→ {rec.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillGapAnalysis;
