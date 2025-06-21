
import { useEffect, useRef } from "react";

// Generic version for plain JS object forms
export function useSimpleFormPersistence<T = any>({
  formData,
  setFormData,
  storageKey,
  enabled = true,
  excludeKeys = [],
}: {
  formData: T;
  setFormData: (data: T) => void;
  storageKey: string;
  enabled?: boolean;
  excludeKeys?: string[];
}) {
  // Avoid loading more than once
  const loaded = useRef(false);

  // Load draft
  useEffect(() => {
    if (!enabled) return;
    if (loaded.current) return;
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        console.log('Loading simple form data from localStorage:', parsed);
        // Merge with existing form data
        setFormData({ ...formData, ...parsed });
      }
    } catch (e) {
      console.error('Error loading simple form data:', e);
      localStorage.removeItem(storageKey);
    }
    loaded.current = true;
    // eslint-disable-next-line
  }, [enabled, storageKey]);
  
  // Save draft
  useEffect(() => {
    if (!enabled) return;
    if (!loaded.current) return; // Don't save on first mount before loading
    
    try {
      // Only save if at least one useful field is filled in
      const values = Object.entries(formData || {}).filter(
        ([k]) => !excludeKeys.includes(k)
      );
      
      if (!values.length) return;
      
      const hasData = values.some(([_, val]) =>
        val !== "" && val !== false && val !== undefined && val !== null
      );
      
      if (hasData) {
        const dataToSave = Object.fromEntries(
          values.filter(([k]) => !excludeKeys.includes(k))
        );
        console.log('Saving simple form data to localStorage:', dataToSave);
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (err) {
      console.error('Error saving simple form data:', err);
    }
  }, [formData, enabled, storageKey, excludeKeys]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      console.log('Cleared simple form draft:', storageKey);
    } catch (err) {
      console.error('Error clearing simple form draft:', err);
    }
  };

  return { clearDraft };
}
