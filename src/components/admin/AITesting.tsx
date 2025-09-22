import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Play, FileText, Loader2, Brain, Sparkles } from 'lucide-react';
import { useAITesting } from '@/hooks/useAITesting';
import { AITestReport } from './AITestReport';

export const AITesting = () => {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-pro');
  
  const { 
    runTest, 
    runBothModels, 
    reports, 
    loading, 
    clearReports 
  } = useAITesting();

  const testScenarios = [
    {
      id: 'new-user-signup',
      name: 'New User Signup Flow',
      description: 'Test the complete user registration and onboarding process',
      prompt: `I'm testing the new user signup flow on yeildsocials.com. Please analyze:

1. Landing page first impression and value proposition clarity
2. Signup form usability and error handling
3. Email verification process
4. Onboarding flow and tutorial effectiveness
5. First-time user dashboard experience
6. Task discovery and completion process

Visit the site as if you're a new user and provide detailed feedback on each step.`
    },
    {
      id: 'task-completion',
      name: 'Task Completion Journey',
      description: 'Analyze the task discovery, execution, and reward process',
      prompt: `I'm evaluating the task completion journey on yeildsocials.com. Please assess:

1. Task discovery and browsing experience
2. Task details and instructions clarity
3. Task submission process
4. Reward system and gamification elements
5. Progress tracking and feedback
6. Mobile task completion experience

Focus on user motivation and friction points throughout the process.`
    },
    {
      id: 'dashboard-navigation',
      name: 'Dashboard & Navigation',
      description: 'Test the main dashboard functionality and site navigation',
      prompt: `I'm testing the dashboard and navigation on yeildsocials.com. Please evaluate:

1. Dashboard layout and information hierarchy
2. Navigation menu clarity and organization
3. Key feature accessibility
4. User profile and settings access
5. Search and filtering capabilities
6. Overall user interface consistency

Provide feedback on usability and design patterns.`
    },
    {
      id: 'mobile-responsiveness',
      name: 'Mobile Experience',
      description: 'Comprehensive mobile usability and responsiveness testing',
      prompt: `I'm conducting mobile experience testing for yeildsocials.com. Please analyze:

1. Mobile layout and responsive design
2. Touch interactions and button sizing
3. Mobile navigation and menu functionality
4. Form completion on mobile devices
5. Page loading speed on mobile
6. Mobile-specific features and optimizations

Focus on mobile-first user experience and accessibility.`
    },
    {
      id: 'conversion-optimization',
      name: 'Conversion Optimization',
      description: 'Analyze signup conversion and user engagement factors',
      prompt: `I'm analyzing conversion optimization for yeildsocials.com. Please evaluate:

1. Landing page conversion elements
2. Call-to-action effectiveness
3. Trust signals and social proof
4. Signup friction and abandonment points
5. User engagement and retention features
6. Onboarding completion rates

Provide specific recommendations to improve conversions.`
    }
  ];

  const handleRunTest = async () => {
    if (!selectedScenario && !customPrompt.trim()) return;
    
    const scenario = testScenarios.find(s => s.id === selectedScenario);
    const prompt = customPrompt.trim() || scenario?.prompt || '';
    
    await runTest(
      prompt,
      selectedModel,
      scenario?.name || 'Custom Test',
      scenario?.description || 'Custom testing scenario'
    );
  };

  const handleRunBothModels = async () => {
    if (!selectedScenario && !customPrompt.trim()) return;
    
    const scenario = testScenarios.find(s => s.id === selectedScenario);
    const prompt = customPrompt.trim() || scenario?.prompt || '';
    
    await runBothModels(
      prompt,
      scenario?.name || 'Custom Test',
      scenario?.description || 'Custom testing scenario'
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Website Testing
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use advanced AI models to test your website and get comprehensive UX feedback
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google/gemini-2.5-pro">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Gemini 2.5 Pro (Best for analysis)
                  </div>
                </SelectItem>
                <SelectItem value="openai/gpt-5">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    GPT-5 (Advanced reasoning)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test Scenarios */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Testing Scenario</label>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger>
                <SelectValue placeholder="Select a testing scenario" />
              </SelectTrigger>
              <SelectContent>
                {testScenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    <div>
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {scenario.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Instructions (Optional)</label>
            <Textarea
              placeholder="Add custom testing instructions or override the selected scenario..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleRunTest}
              disabled={loading || (!selectedScenario && !customPrompt.trim())}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Test ({selectedModel.includes('gemini') ? 'Gemini' : 'GPT-5'})
            </Button>
            
            <Button 
              onClick={handleRunBothModels}
              disabled={loading || (!selectedScenario && !customPrompt.trim())}
              variant="outline"
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Compare Both Models
            </Button>
          </div>

          {reports.length > 0 && (
            <div className="flex justify-between items-center pt-2">
              <Badge variant="secondary">
                {reports.length} Report{reports.length !== 1 ? 's' : ''} Generated
              </Badge>
              <Button 
                onClick={clearReports} 
                variant="ghost" 
                size="sm"
              >
                Clear Reports
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Reports */}
      {reports.map((report, index) => (
        <AITestReport key={index} report={report} />
      ))}
    </div>
  );
};