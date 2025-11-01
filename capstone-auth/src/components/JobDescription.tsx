import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { JobInfo } from '../types';
import { Briefcase, Loader2, Sparkles, Target } from 'lucide-react';

interface JobDescriptionProps {
  onJobDescriptionSubmit: (data: JobInfo) => Promise<void>;
}

const JobDescription: React.FC<JobDescriptionProps> = ({ onJobDescriptionSubmit }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle.trim()) {
      setError('Please enter a job title');
      return;
    }
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    try {
      await onJobDescriptionSubmit({ jobTitle, jobDescription });
      setError('');
    } catch (err: any) {
      setError('Error processing job description: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Enter Job Details
          </span>
        </CardTitle>
        <CardDescription className="text-base flex items-center gap-2">
          <Target className="w-4 h-4" />
          Provide the job title and description to compare against your resume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="job-title" className="text-sm font-semibold flex items-center gap-2">
              <span className="text-lg">💼</span>
              Job Title
            </Label>
            <Input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Full-Stack Developer"
              disabled={loading}
              className="h-12 text-base border-2 focus:border-purple-500 transition-all duration-300 hover:border-purple-300"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="job-description" className="text-sm font-semibold flex items-center gap-2">
              <span className="text-lg">📋</span>
              Job Description
            </Label>
            <div className="relative">
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here... Include requirements, responsibilities, and qualifications."
                disabled={loading}
                className="flex min-h-[250px] w-full rounded-lg border-2 border-input bg-white dark:bg-gray-800 px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-purple-300 shadow-sm"
                rows={10}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-white dark:bg-gray-800 px-2 py-1 rounded-md">
                {jobDescription.length} characters
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg dark:bg-red-950/50 dark:text-red-300 flex items-start gap-3 animate-slideUp shadow-md">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold">Validation Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <Button 
            type="submit"
            disabled={loading || !jobTitle.trim() || !jobDescription.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                <span>Analyze Job Requirements</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobDescription;
