import { useState, useEffect, useRef, useCallback } from "react";
import { useNoteRepository } from "../lib/notes/NoteRepositoryContext";
import type { PatternNote, NoteBlock } from "../lib/notes/notes-schema";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface UsePatternNotesReturn {
  note: PatternNote | null;
  blocks: NoteBlock[];
  isLoading: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  handleBlocksChange: (newBlocks: NoteBlock[]) => void;
  saveImmediately: () => Promise<void>;
  uploadMedia: (file: File | Blob) => Promise<{ id: string; url?: string }>;
  retrySave: () => Promise<void>;
}

const DEBOUNCE_DELAY_MS = 2000;
const SAVED_FADE_DELAY_MS = 4000;

export function usePatternNotes(patternId: string): UsePatternNotesReturn {
  const repository = useNoteRepository();

  const [note, setNote] = useState<PatternNote | null>(null);
  const [blocks, setBlocks] = useState<NoteBlock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestBlocksRef = useRef<NoteBlock[]>([]);
  const isDirtyRef = useRef<boolean>(false);

  // Sync ref with state
  useEffect(() => {
    latestBlocksRef.current = blocks;
  }, [blocks]);

  // Load note for patternId
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setSaveStatus("idle");
    setErrorMessage(null);
    isDirtyRef.current = false;

    repository
      .get(patternId)
      .then((existingNote) => {
        if (isCancelled) return;
        if (existingNote) {
          setNote(existingNote);
          setBlocks(existingNote.blocks);
          latestBlocksRef.current = existingNote.blocks;
          setLastSavedAt(new Date(existingNote.lastModified));
        } else {
          setNote(null);
          setBlocks([]);
          latestBlocksRef.current = [];
          setLastSavedAt(null);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error(`Failed to load note for ${patternId}:`, err);
        setErrorMessage(err instanceof Error ? err.message : "Failed to load note");
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
      // Auto-flush pending changes on pattern switch or unmount
      if (isDirtyRef.current && latestBlocksRef.current.length > 0) {
        const payload: PatternNote = {
          patternId,
          blocks: latestBlocksRef.current,
          lastModified: new Date().toISOString(),
          version: 1,
        };
        repository.upsert(payload).catch((err) => {
          console.error(`Failed to flush note for ${patternId} on cleanup:`, err);
        });
      }
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [patternId, repository]);

  const performSave = useCallback(
    async (blocksToSave: NoteBlock[]) => {
      setSaveStatus("saving");
      setErrorMessage(null);

      const notePayload: PatternNote = {
        patternId,
        blocks: blocksToSave,
        lastModified: new Date().toISOString(),
        version: 1,
      };

      try {
        await repository.upsert(notePayload);
        setNote(notePayload);
        const now = new Date();
        setLastSavedAt(now);
        setSaveStatus("saved");
        isDirtyRef.current = false;

        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = setTimeout(() => {
          setSaveStatus((current) => (current === "saved" ? "idle" : current));
        }, SAVED_FADE_DELAY_MS);
      } catch (err) {
        console.error(`Failed to save note for ${patternId}:`, err);
        setSaveStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to save changes"
        );
      }
    },
    [patternId, repository]
  );

  const handleBlocksChange = useCallback(
    (newBlocks: NoteBlock[]) => {
      setBlocks(newBlocks);
      latestBlocksRef.current = newBlocks;
      isDirtyRef.current = true;
      setSaveStatus("unsaved");

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(() => {
        performSave(newBlocks);
      }, DEBOUNCE_DELAY_MS);
    },
    [performSave]
  );

  const saveImmediately = useCallback(async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    await performSave(latestBlocksRef.current);
  }, [performSave]);

  const retrySave = useCallback(async () => {
    await performSave(latestBlocksRef.current);
  }, [performSave]);

  const uploadMedia = useCallback(
    async (file: File | Blob) => {
      return repository.saveMedia(patternId, file);
    },
    [patternId, repository]
  );

  return {
    note,
    blocks,
    isLoading,
    saveStatus,
    lastSavedAt,
    errorMessage,
    handleBlocksChange,
    saveImmediately,
    uploadMedia,
    retrySave,
  };
}
