import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, Lightbulb, FileText, Target, TrendingUp, BarChart3 } from 'lucide-react';

const HelpTips: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tips = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Upload Clear Resume',
      description: 'Use high-quality PDFs or images for best OCR results'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Detailed Job Description',
      description: 'Include complete job requirements for accurate skill matching'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Update Regularly',
      description: 'Keep your skills updated as you learn new technologies'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Track Progress',
      description: 'Use the roadmap to monitor your learning journey'
    }
  ];

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        size="icon"
      >
        <Lightbulb className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 animate-in slide-in-from-right">
      <Card className="shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Pro Tips
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <div className="text-primary flex-shrink-0">
                {tip.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">{tip.title}</h4>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpTips;
