import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ResumeData } from '../types';
import { Upload, FileText, X, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://capstone-backend-env.eba-enkzsfa3.us-east-1.elasticbeanstalk.com/api';

interface ResumeUploaderProps {
  onResumeProcessed: (data: ResumeData) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onResumeProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if file is an image or PDF
    if (!selectedFile.type.match('image.*') && selectedFile.type !== 'application/pdf') {
      setError('Please upload an image file (PNG, JPG, JPEG) or PDF');
      setFile(null);
      setPreview(null);
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Create preview for images only
    if (selectedFile.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDFs, just show the filename
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading resume for enhanced parsing...');

      const response = await fetch(`${API_BASE_URL}/resume/parse-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Enhanced resume data received:', {
        skillsCount: data.skills?.length,
        hasMetadata: !!data.metadata,
        textLength: data.rawText?.length
      });
      
      if (data && data.skills) {
        // Create processed data structure
        const processedData: ResumeData = {
          skills: data.skills || [],
          raw_text: data.rawText || '',
          name: '',
          contact: {},
          education: [],
          experience: [],
          projects: [],
          certifications: [],
          metadata: data.metadata || {}
        };
        
        console.log('Processed resume data:', {
          skillsCount: processedData.skills.length,
          hasRawText: !!processedData.raw_text
        });
        
        onResumeProcessed(processedData);
      } else {
        console.error('Invalid response format from server');
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Error processing resume:', err);
      setError(err.message || 'Failed to process resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInputRef.current.files = dataTransfer.files;
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
      handleFileChange({ target: { files: dataTransfer.files } } as any);
    }
  };

  return (
    <Card className="shadow-lg border-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Resume OCR Scanner
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Upload your resume (PDF or image) to extract information automatically using advanced AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
            </div>
            <p className="text-muted-foreground mt-6 font-medium">Processing your resume with AI...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area with enhanced design */}
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                file 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-inner' 
                  : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="resume-file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              
              {!file ? (
                <label htmlFor="resume-file" className="cursor-pointer block">
                  <div className="mb-4 mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    PDF or Image files (PNG, JPG, JPEG)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 10MB
                  </p>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{file.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Ready to process</span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-3">
                <h3 className="font-semibold">Preview</h3>
                <img 
                  src={preview} 
                  alt="Resume preview" 
                  className="w-full rounded-lg border shadow-sm max-h-96 object-contain"
                />
              </div>
            )}

            {/* Error Message with enhanced styling */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg dark:bg-red-950/50 dark:text-red-300 flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button with enhanced design */}
            <Button 
              type="submit" 
              disabled={!file || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Extract Information with AI
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUploader;
