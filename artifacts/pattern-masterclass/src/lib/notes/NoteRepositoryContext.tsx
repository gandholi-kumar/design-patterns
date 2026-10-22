import { createContext, useContext, ReactNode, useMemo } from "react";
import type { NoteRepository } from "./NoteRepository";
import { LocalStorageNoteRepository } from "./LocalStorageNoteRepository";
import { ApiNoteRepository } from "./ApiNoteRepository";
import { useSession } from "../auth-client";
import { ENABLE_FULL_FEATURES } from "../../config/features";

const NoteRepositoryContext = createContext<NoteRepository | null>(null);

interface NoteRepositoryProviderProps {
  children: ReactNode;
  repository?: NoteRepository;
}

/**
 * Provides the active NoteRepository to the component tree.
 * Automatically chooses ApiNoteRepository for authenticated members when ENABLE_FULL_FEATURES is true,
 * or LocalStorageNoteRepository for offline guest users.
 */
export function NoteRepositoryProvider({
  children,
  repository,
}: NoteRepositoryProviderProps) {
  const { data: session } = useSession();

  const instance = useMemo(() => {
    if (repository) return repository;
    if (ENABLE_FULL_FEATURES && session?.user) {
      return new ApiNoteRepository();
    }
    return new LocalStorageNoteRepository();
  }, [repository, session?.user]);

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
