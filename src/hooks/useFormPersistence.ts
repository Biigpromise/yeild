
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
        // Set form values directly, skipping validation (assumes RHF .reset API)
        form.reset(parsed);
      }
    } catch (err) {
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
      // Only save if there is data in the form
      if (Object.values(value).some(val => val !== "" && val !== false && val !== undefined)) {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } else {
        localStorage.removeItem(storageKey);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, enabled, storageKey]);

  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  return { clearDraft };
}
