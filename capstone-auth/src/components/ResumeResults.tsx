import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ResumeData } from '../types';
import { User, Mail, Phone, Linkedin, Github, GraduationCap, Briefcase, Award, FolderKanban, Code } from 'lucide-react';

interface ResumeResultsProps {
  resumeData: ResumeData;
}

const ResumeResults: React.FC<ResumeResultsProps> = ({ resumeData }) => {
  if (!resumeData) {
    return null;
  }

  console.log('Resume data received:', resumeData);
  
  const parsedResume = resumeData || {};
  const raw_text = resumeData.raw_text || '';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Resume Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="structured" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="structured">Structured Data</TabsTrigger>
            <TabsTrigger value="raw">Raw Text</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structured" className="space-y-6 mt-6">
            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>
              <div className="space-y-2 pl-7">
                {parsedResume.name && (
                  <p className="text-xl font-medium">{parsedResume.name}</p>
                )}
                
                {parsedResume.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{parsedResume.email}</span>
                  </div>
                )}
                
                {parsedResume.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{parsedResume.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Skills */}
            {parsedResume.skills && parsedResume.skills.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 pl-7">
                  {parsedResume.skills.map((skill, index) => (
                    <Badge key={`skill-${index}`} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Education */}
            {parsedResume.education && parsedResume.education.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Education
                </h3>
                <ul className="space-y-2 pl-7 list-disc list-inside">
                  {parsedResume.education.map((item, index) => (
                    <li key={`edu-${index}`} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Experience */}
            {parsedResume.experience && parsedResume.experience.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Experience
                </h3>
                <ul className="space-y-2 pl-7 list-disc list-inside">
                  {parsedResume.experience.map((item, index) => (
                    <li key={`exp-${index}`} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Projects */}
            {parsedResume.projects && parsedResume.projects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-primary" />
                  Projects
                </h3>
                <ul className="space-y-2 pl-7 list-disc list-inside">
                  {parsedResume.projects.map((item: any, index: number) => (
                    <li key={`proj-${index}`} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Certifications */}
            {parsedResume.certifications && parsedResume.certifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Certifications
                </h3>
                <ul className="space-y-2 pl-7 list-disc list-inside">
                  {parsedResume.certifications.map((item: any, index: number) => (
                    <li key={`cert-${index}`} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="raw" className="mt-6">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-mono">{raw_text}</pre>
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="mt-6">
            <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm font-mono">{JSON.stringify(parsedResume, null, 2)}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeResults;
