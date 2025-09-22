import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronRight, 
  Bot,
  Calendar,
  Copy,
  Download 
} from 'lucide-react';
import { AITestReport as AITestReportType } from '@/hooks/useAITesting';
import { toast } from 'sonner';

interface AITestReportProps {
  report: AITestReportType;
}

export const AITestReport: React.FC<AITestReportProps> = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getModelDisplayName = (model: string) => {
    if (model.includes('gemini')) return 'Gemini 2.5 Pro';
    if (model.includes('gpt-5')) return 'GPT-5';
    return model;
  };

  const getModelIcon = (model: string) => {
    return <Bot className="h-4 w-4" />;
  };

  const copyToClipboard = async () => {
    try {
      const content = `AI Test Report - ${report.scenario}
Model: ${getModelDisplayName(report.model)}
Date: ${report.timestamp.toLocaleString()}
Status: ${report.status}

${report.status === 'success' ? report.response : `Error: ${report.error}`}`;
      
      await navigator.clipboard.writeText(content);
      toast.success('Report copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy report');
    }
  };

  const downloadReport = () => {
    const content = `AI Test Report - ${report.scenario}
Model: ${getModelDisplayName(report.model)}
Date: ${report.timestamp.toLocaleString()}
Status: ${report.status}

${report.status === 'success' ? report.response : `Error: ${report.error}`}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-test-report-${report.scenario.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded');
  };

  const formatResponse = (response: string) => {
    // Split response into sections for better readability
    const sections = response.split(/\n(?=\d+\.|\*\*|##)/);
    
    return sections.map((section, index) => {
      // Check if section is a numbered list item
      if (/^\d+\./.test(section.trim())) {
        return (
          <div key={index} className="mb-3">
            <div className="font-medium text-sm mb-1">
              {section.split('\n')[0]}
            </div>
            {section.split('\n').slice(1).map((line, lineIndex) => (
              <div key={lineIndex} className="text-sm text-muted-foreground ml-4">
                {line}
              </div>
            ))}
          </div>
        );
      }
      
      // Check if section is a header
      if (/^\*\*|^##/.test(section.trim())) {
        const lines = section.split('\n');
        const header = lines[0].replace(/^\*\*|\*\*$|^##\s?/g, '');
        const content = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-primary">
              {header}
            </h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {content}
            </div>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <div key={index} className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
          {section}
        </div>
      );
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {report.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <CardTitle className="text-base">{report.scenario}</CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {getModelIcon(report.model)}
                {getModelDisplayName(report.model)}
              </Badge>
              
              <Badge variant={report.status === 'success' ? 'default' : 'destructive'}>
                {report.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadReport}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {report.timestamp.toLocaleString()}
          <span>•</span>
          <span>{report.description}</span>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent>
            {report.status === 'success' ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formatResponse(report.response)}
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm text-destructive">Error</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {report.error || 'Unknown error occurred during testing'}
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};