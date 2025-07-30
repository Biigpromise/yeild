import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface DataLoaderState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

interface UseDataLoaderOptions {
  onError?: (error: string) => void;
  showToast?: boolean;
  cacheTimeout?: number; // in milliseconds
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const useDataLoader = <T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataLoaderOptions = {}
) => {
  const {
    onError,
    showToast = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes default
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds default
  } = options;

  const [state, setState] = useState<DataLoaderState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  const loadData = useCallback(async (force = false) => {
    // Check cache validity
    if (!force && state.data && state.lastFetch) {
      const timeSinceLastFetch = Date.now() - state.lastFetch.getTime();
      if (timeSinceLastFetch < cacheTimeout) {
        return state.data;
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchFn();
      setState({
        data: result,
        loading: false,
        error: null,
        lastFetch: new Date()
      });
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load data';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      if (onError) onError(errorMessage);
      if (showToast) toast.error(errorMessage);
      
      console.error('Data loading error:', error);
      return null;
    }
  }, [fetchFn, state.data, state.lastFetch, cacheTimeout, onError, showToast]);

  const refresh = useCallback(() => loadData(true), [loadData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null
    });
  }, []);

  // Initial load and dependency-based reloads
  useEffect(() => {
    loadData();
  }, dependencies);

  // Auto refresh setup
  useEffect(() => {
    if (!autoRefresh || !state.data) return;

    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, state.data, loadData]);

  return {
    ...state,
    loadData,
    refresh,
    clearError,
    reset,
    isStale: state.lastFetch && (Date.now() - state.lastFetch.getTime()) > cacheTimeout
  };
};