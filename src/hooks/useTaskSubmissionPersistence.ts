
import { useEffect, useRef } from "react";

const getStorageKey = (taskId: string | null) =>
  taskId ? `taskSubmissionDraft_${taskId}` : null;

export function useTaskSubmissionPersistence(
  taskId: string | null,
  evidence: string,
  setEvidence: (e: string) => void,
  evidenceFile: File | null,
  setEvidenceFile: (f: File | null) => void,
  filePreview: string | null,
  setFilePreview: (p: string | null) => void,
  enabled: boolean = true
) {
  // Prevent saving blank files
  const loaded = useRef(false);

  // Restore draft on mount (or when task changes)
  useEffect(() => {
    if (!enabled || !taskId) return;
    const key = getStorageKey(taskId);
    const draft = key ? localStorage.getItem(key) : null;
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setEvidence(parsed.evidence || "");
        // Reload file preview via DataURL if previously saved (for now we can just restore the preview, user will need to re-select file due to file object limitations)
        setFilePreview(parsed.filePreview || null);
        setEvidenceFile(null); // Files can't persist through reloads, user needs to re-select.
      } catch (e) {
        // Ignore corrupted drafts
        key && localStorage.removeItem(key);
      }
    }
    loaded.current = true;
  }, [enabled, taskId, setEvidence, setEvidenceFile, setFilePreview]);

  // Auto-save draft on changes
  useEffect(() => {
    if (!enabled || !taskId) return;
    if (!loaded.current) return;
    const key = getStorageKey(taskId);
    if (!key) return;
    // Only save if there is some data
    if (evidence || evidenceFile || filePreview) {
      // Don't try to persist the File object, just the preview and name
      localStorage.setItem(
        key,
        JSON.stringify({
          evidence,
          filePreview,
          // evidenceFileName: evidenceFile?.name, // could be displayed as UI
        })
      );
    } else {
      localStorage.removeItem(key);
    }
  }, [evidence, evidenceFile, filePreview, enabled, taskId]);

  const clearDraft = () => {
    const key = getStorageKey(taskId);
    if (key) localStorage.removeItem(key);
  };

  return { clearDraft };
}
