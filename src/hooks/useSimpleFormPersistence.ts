
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
        setFormData((prev: T) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (e) {
      localStorage.removeItem(storageKey);
    }
    loaded.current = true;
    // eslint-disable-next-line
  }, [enabled, storageKey]);

  // Save draft
  useEffect(() => {
    if (!enabled) return;
    if (!loaded.current) return; // Don't save on first mount before loading
    // Only save if at least one useful field is filled in
    const values = Object.entries(formData || {}).filter(
      ([k]) => !excludeKeys.includes(k)
    );
    if (!values.length) return;
    const hasData = values.some(([_, val]) =>
      val !== "" && val !== false && val !== undefined
    );
    if (hasData) {
      localStorage.setItem(
        storageKey,
        JSON.stringify(
          Object.fromEntries(
            values.filter(([k]) => !excludeKeys.includes(k))
          )
        )
      );
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [formData, enabled, storageKey, excludeKeys]);

  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  return { clearDraft };
}
