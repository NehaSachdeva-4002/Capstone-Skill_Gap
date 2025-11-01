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
    <Card className="shadow-lg border-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-2 border-blue-100 dark:border-blue-900">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Skill Gap Analysis
          </span>
        </CardTitle>
        <CardDescription className="text-base flex items-center gap-2 mt-2">
          <TrendingUp className="w-4 h-4" />
          See how your skills match the job requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slideUp">
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
        <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-inner animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-900 dark:text-blue-100">Overall Job Fit</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {fit}
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">%</span>
            </div>
          </div>
          <div className="relative">
            <Progress value={fit} className="h-4 bg-blue-200 dark:bg-blue-900" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-md">
                {fit >= 50 ? `${fit}%` : ''}
              </span>
            </div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              {detailedAnalysis?.summary || 
                `You have ${matched.length} exact matches${partialSkills.length > 0 ? `, ${partialSkills.length} partial matches,` : ''} and ${missingSkills.length} skills to develop.`
              }
            </p>
          </div>
        </div>
        
        {/* Skills Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          {/* Matched Skills */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-300 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="font-bold flex items-center gap-2 text-green-700 dark:text-green-300 text-lg">
              <div className="p-1.5 bg-green-500 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span>Exact Matches</span>
              <span className="ml-auto text-2xl font-extrabold">{matched.length}</span>
            </h3>
            {matched.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matched.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="success" 
                    className="text-sm px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    ✓ {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-700 dark:text-green-300 italic bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">No exact matches found.</p>
            )}
          </div>
          
          {/* Partial Matches */}
          {partialSkills.length > 0 && (
            <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border-2 border-blue-300 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="font-bold flex items-center gap-2 text-blue-700 dark:text-blue-300 text-lg">
                <div className="p-1.5 bg-blue-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span>Partial Matches</span>
                <span className="ml-auto text-2xl font-extrabold">{partialSkills.length}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {partialSkills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-sm px-3 py-1.5 border-2 border-blue-500 text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    ● {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Missing Skills */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-xl border-2 border-orange-300 dark:border-orange-800 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="font-bold flex items-center gap-2 text-orange-700 dark:text-orange-300 text-lg">
              <div className="p-1.5 bg-orange-500 rounded-lg">
                <PlusCircle className="w-5 h-5 text-white" />
              </div>
              <span>Skills to Develop</span>
              <span className="ml-auto text-2xl font-extrabold">{missingSkills.length}</span>
            </h3>
            {missingSkills.length > 0 ? (
              <div className="space-y-3">
                {criticalMissing.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Critical Priority:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {criticalMissing.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="destructive" 
                          className="text-sm px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          ⚠️ {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {missingSkills.filter(s => !criticalMissing.includes(s)).length > 0 && (
                  <div>
                    {criticalMissing.length > 0 && (
                      <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-2 mt-3 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                        Additional Skills:
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.filter(s => !criticalMissing.includes(s)).map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="warning" 
                          className="text-sm px-3 py-1.5 bg-gradient-to-r from-orange-400 to-yellow-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          + {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-green-700 dark:text-green-300 font-semibold bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                No skill gaps identified!
              </p>
            )}
          </div>
        </div>
        
        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Personalized Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                  <p className="font-semibold text-indigo-800 dark:text-indigo-200 flex items-start gap-2">
                    <span className="text-lg mt-0.5">✔️</span>
                    <span>{rec.message}</span>
                  </p>
                  <p className="text-indigo-600 dark:text-indigo-400 mt-2 ml-7 flex items-start gap-2">
                    <span>→</span>
                    <span>{rec.action}</span>
                  </p>
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
