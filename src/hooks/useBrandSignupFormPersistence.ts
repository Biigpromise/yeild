
import { useEffect } from "react";

const STORAGE_KEY = "brandSignupFormDraft";

export function useBrandSignupFormPersistence(form: any, enabled: boolean = true) {
  // Load on mount
  useEffect(() => {
    if (!enabled) return;
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        // set form values without validation
        form.reset(parsed);
      }
    } catch (err) {
      // Ignore corrupted drafts
      localStorage.removeItem(STORAGE_KEY);
    }
    // Only run on mount
    // eslint-disable-next-line
  }, [enabled]);

  // Auto-save changes
  useEffect(() => {
    if (!enabled) return;
    const subscription = form.watch((value) => {
      // Don't save if totally empty
      if (Object.keys(value).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, enabled]);

  // Helper to clear the draft
  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { clearDraft };
}
