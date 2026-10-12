import { createContext, useContext, ReactNode, useMemo } from "react";
import type { NoteRepository } from "./NoteRepository";
import { LocalStorageNoteRepository } from "./LocalStorageNoteRepository";

const NoteRepositoryContext = createContext<NoteRepository | null>(null);

interface NoteRepositoryProviderProps {
  children: ReactNode;
  repository?: NoteRepository;
}

/**
 * Provides the active NoteRepository to the component tree.
 * Defaults to LocalStorageNoteRepository for offline local persistence.
 * Can be swapped to ApiNoteRepository or a MockNoteRepository for testing.
 */
export function NoteRepositoryProvider({
  children,
  repository,
}: NoteRepositoryProviderProps) {
  const instance = useMemo(
    () => repository ?? new LocalStorageNoteRepository(),
    [repository]
  );

  return (
    <NoteRepositoryContext.Provider value={instance}>
      {children}
    </NoteRepositoryContext.Provider>
  );
}

/**
 * Custom hook to consume the current NoteRepository instance.
 * Throws a helpful diagnostic error if called outside NoteRepositoryProvider.
 */
export function useNoteRepository(): NoteRepository {
  const repo = useContext(NoteRepositoryContext);
  if (!repo) {
    throw new Error(
      "useNoteRepository must be used within a <NoteRepositoryProvider>."
    );
  }
  return repo;
}
