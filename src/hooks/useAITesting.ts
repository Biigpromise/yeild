import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AITestReport {
  id: string;
  timestamp: Date;
  model: string;
  scenario: string;
  description: string;
  response: string;
  status: 'success' | 'error';
  error?: string;
}

export const useAITesting = () => {
  const [reports, setReports] = useState<AITestReport[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async (
    prompt: string,
    model: string = 'google/gemini-2.5-pro',
    scenario: string = 'Custom Test',
    description: string = 'Custom testing scenario'
  ) => {
    if (!prompt.trim()) {
      toast.error('Please provide testing instructions');
      return;
    }

    setLoading(true);
    
    const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai', {
        body: {
          message: prompt,
          model: model,
          testingScenario: scenario,
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get AI response');
      }

      const newReport: AITestReport = {
        id: testId,
        timestamp: new Date(),
        model: model,
        scenario: scenario,
        description: description,
        response: data.response,
        status: 'success'
      };

      setReports(prev => [newReport, ...prev]);
      toast.success(`AI test completed using ${model.includes('gemini') ? 'Gemini' : 'GPT-5'}`);
      
    } catch (error) {
      console.error('AI Testing Error:', error);
      
      const errorReport: AITestReport = {
        id: testId,
        timestamp: new Date(),
        model: model,
        scenario: scenario,
        description: description,
        response: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      setReports(prev => [errorReport, ...prev]);
      toast.error('Failed to run AI test: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const runBothModels = async (
    prompt: string,
    scenario: string = 'Custom Test',
    description: string = 'Custom testing scenario'
  ) => {
    setLoading(true);
    
    try {
      // Run both models in parallel
      const promises = [
        runSingleTest(prompt, 'google/gemini-2.5-pro', scenario, description + ' (Gemini)'),
        runSingleTest(prompt, 'openai/gpt-5', scenario, description + ' (GPT-5)')
      ];

      const results = await Promise.allSettled(promises);
      
      // Process results
      results.forEach((result, index) => {
        const model = index === 0 ? 'google/gemini-2.5-pro' : 'openai/gpt-5';
        const modelName = index === 0 ? 'Gemini' : 'GPT-5';
        const testId = `compare-${Date.now()}-${index}`;
        
        if (result.status === 'fulfilled') {
          const newReport: AITestReport = {
            id: testId,
            timestamp: new Date(),
            model: model,
            scenario: scenario,
            description: description + ` (${modelName})`,
            response: result.value,
            status: 'success'
          };
          setReports(prev => [newReport, ...prev]);
        } else {
          const errorReport: AITestReport = {
            id: testId,
            timestamp: new Date(),
            model: model,
            scenario: scenario,
            description: description + ` (${modelName})`,
            response: '',
            status: 'error',
            error: result.reason?.message || 'Unknown error occurred'
          };
          setReports(prev => [errorReport, ...prev]);
        }
      });

      toast.success('Comparison test completed for both AI models');
      
    } catch (error) {
      console.error('Comparison test error:', error);
      toast.error('Failed to run comparison test');
    } finally {
      setLoading(false);
    }
  };

  const runSingleTest = async (
    prompt: string,
    model: string,
    scenario: string,
    description: string
  ): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: {
        message: prompt,
        model: model,
        testingScenario: scenario,
      }
    });

    if (error) {
      throw new Error(error.message || `Failed to get ${model} response`);
    }

    return data.response;
  };

  const clearReports = () => {
    setReports([]);
    toast.success('Test reports cleared');
  };

  return {
    reports,
    loading,
    runTest,
    runBothModels,
    clearReports
  };
};