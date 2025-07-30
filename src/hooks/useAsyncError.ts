import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AsyncErrorState {
  error: string | null;
  loading: boolean;
  retryCount: number;
  lastAttempt: Date | null;
}

export const useAsyncError = (maxRetries: number = 3) => {
  const [state, setState] = useState<AsyncErrorState>({
    error: null,
    loading: false,
    retryCount: 0,
    lastAttempt: null
  });

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    {
      onSuccess,
      onError,
      showToast = true,
      context = 'operation'
    }: {
      onSuccess?: (result: T) => void;
      onError?: (error: string) => void;
      showToast?: boolean;
      context?: string;
    } = {}
  ): Promise<T | null> => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const result = await asyncFn();
      
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: null,
        retryCount: 0,
        lastAttempt: new Date()
      }));

      if (onSuccess) onSuccess(result);
      if (showToast) toast.success(`${context} completed successfully`);
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || `Failed to complete ${context}`;
      
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1,
        lastAttempt: new Date()
      }));

      if (onError) onError(errorMessage);
      if (showToast) toast.error(errorMessage);
      
      console.error(`${context} error:`, error);
      return null;
    }
  }, []);

  const retry = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: Parameters<typeof execute>[1]
  ) => {
    if (state.retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached');
      return null;
    }
    
    return execute(asyncFn, options);
  }, [execute, state.retryCount, maxRetries]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      error: null,
      loading: false,
      retryCount: 0,
      lastAttempt: null
    });
  }, []);

  return {
    ...state,
    execute,
    retry,
    clearError,
    reset,
    canRetry: state.retryCount < maxRetries
  };
};