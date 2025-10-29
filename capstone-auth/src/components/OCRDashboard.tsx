import React, { useState } from 'react';
import ResumeUploader from './ResumeUploader';
import ResumeResults from './ResumeResults';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ResumeData } from '../types';
import { ScanLine, RotateCcw } from 'lucide-react';

const OCRDashboard: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [error, setError] = useState('');

  const handleResumeProcessed = (data: ResumeData) => {
    setResumeData(data);
    setError('');
  };

  const resetProcess = () => {
    setResumeData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <ScanLine className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Resume OCR Scanner
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a resume image or PDF and get structured information extracted using OCR technology
          </p>
        </div>
        
        {/* Error Banner */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-6 py-4 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}
        
        {/* Main Content */}
        <div className="space-y-6">
          {!resumeData ? (
            <ResumeUploader onResumeProcessed={handleResumeProcessed} />
          ) : (
            <>
              <ResumeResults resumeData={resumeData} />
              
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={resetProcess} className="w-full" size="lg">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Scan Another Resume
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRDashboard;
