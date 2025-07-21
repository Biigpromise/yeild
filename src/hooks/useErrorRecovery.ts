
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorState {
  error: Error | null;
  isRecovering: boolean;
  retryCount: number;
  maxRetries: number;
}

export const useErrorRecovery = (maxRetries: number = 3) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRecovering: false,
    retryCount: 0,
    maxRetries,
  });

  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    setErrorState(prev => ({
      ...prev,
      error,
      retryCount: prev.retryCount + 1,
    }));

    // Show user-friendly error message
    toast.error(`Something went wrong: ${error.message}`);
  }, []);

  const retry = useCallback(async (retryFn: () => Promise<void>) => {
    if (errorState.retryCount >= errorState.maxRetries) {
      toast.error('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRecovering: true,
    }));

    try {
      await retryFn();
      
      // Clear error on successful retry
      setErrorState({
        error: null,
        isRecovering: false,
        retryCount: 0,
        maxRetries,
      });
      
      toast.success('Operation completed successfully');
    } catch (error) {
      handleError(error as Error, 'retry operation');
    } finally {
      setErrorState(prev => ({
        ...prev,
        isRecovering: false,
      }));
    }
  }, [errorState.retryCount, errorState.maxRetries, handleError, maxRetries]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRecovering: false,
      retryCount: 0,
      maxRetries,
    });
  }, [maxRetries]);

  return {
    errorState,
    handleError,
    retry,
    clearError,
  };
};
