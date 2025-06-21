
import { useEffect } from "react";

export function useFormPersistence<T = any>(
  form: any,
  storageKey: string,
  enabled: boolean = true
) {
  // Load draft on mount
  useEffect(() => {
    if (!enabled) return;
    try {
      const item = localStorage.getItem(storageKey);
      if (item) {
        const parsed = JSON.parse(item);
        console.log('Loading form data from localStorage:', parsed);
        // Set form values directly, skipping validation (assumes RHF .reset API)
        form.reset(parsed);
      }
    } catch (err) {
      console.error('Error loading form data:', err);
      // Ignore corrupted drafts
      localStorage.removeItem(storageKey);
    }
    // Only run on mount
    // eslint-disable-next-line
  }, [enabled, storageKey]);

  // Auto-save draft on change
  useEffect(() => {
    if (!enabled) return;
    const subscription = form.watch((value: T) => {
      try {
        // Only save if there is meaningful data in the form
        const hasData = Object.values(value).some(val => 
          val !== "" && val !== false && val !== undefined && val !== null
        );
        
        if (hasData) {
          console.log('Saving form data to localStorage:', value);
          localStorage.setItem(storageKey, JSON.stringify(value));
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (err) {
        console.error('Error saving form data:', err);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, enabled, storageKey]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      console.log('Cleared form draft:', storageKey);
    } catch (err) {
      console.error('Error clearing form draft:', err);
    }
  };

  return { clearDraft };
}
