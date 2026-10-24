import { useState } from 'react';
import { z } from 'zod';
import { PATTERNS, QUIZ } from '../data';
import { downloadBlob, zipStore } from '../lib/zip-utils';
import { useLearningStore } from '../stores';

export const BackupSchema = z.object({
  version: z.string().default('1.0.0'),
  exportTimestamp: z.string().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  bookmarks: z.array(z.string()),
  progress: z.record(z.unknown()).optional(),
  quizProgress: z.record(z.unknown()).optional(),
  perspective: z.enum(['canonical', 'modern', 'enterprise', 'pragmatic']).optional(),
  studioMode: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
});

export type BackupData = z.infer<typeof BackupSchema>;

export function useBackupExport() {
  const [backupOpen, setBackupOpen] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);

  const theme = useLearningStore((s) => s.theme);
  const bookmarks = useLearningStore((s) => s.bookmarks);
  const progress = useLearningStore((s) => s.progress);
  const perspective = useLearningStore((s) => s.perspective);
  const studioMode = useLearningStore((s) => s.studioMode);

  const onExport = () => {
    const exportData: BackupData = {
      version: '1.0.0',
      exportTimestamp: new Date().toISOString(),
      theme,
      bookmarks,
      progress,
      perspective,
      studioMode,
      settings: { theme, activeCategoryFilter: 'All' },
      quizProgress: progress,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'gof-masterclass-backup.json');
  };

  const onRestore = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        const result = BackupSchema.safeParse(raw);

        if (!result.success) {
          const issueMsg = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
          throw new Error(`Invalid backup schema: ${issueMsg}`);
        }

        const data = result.data;
        const restoredProgress = (data.progress || data.quizProgress || {}) as typeof progress;

        useLearningStore.setState({
          bookmarks: data.bookmarks,
          progress: restoredProgress,
          ...(data.theme ? { theme: data.theme } : {}),
          ...(data.perspective ? { perspective: data.perspective } : {}),
          ...(typeof data.studioMode === 'boolean' ? { studioMode: data.studioMode } : {}),
        });

        if (data.theme && typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', data.theme === 'dark');
        }

        setBackupOpen(false);
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Could not read or validate this backup file.');
      }
    };
    reader.readAsText(file);
  };

  const exportProject = () => {
    setZipBusy(true);
    const files: [string, string][] = [
      [
        'README.md',
        '# GoF Design Patterns Masterclass\n\nA local-first learning workspace for all 23 GoF patterns.',
      ],
      ['src/pattern-catalog.json', JSON.stringify(PATTERNS, null, 2)],
      ['src/quiz-bank.json', JSON.stringify(QUIZ, null, 2)],
      ['state-backup.json', JSON.stringify({ theme, bookmarks, progress, perspective, studioMode }, null, 2)],
    ];
    try {
      downloadBlob(zipStore(files), 'gof-pattern-masterclass.zip');
    } finally {
      window.setTimeout(() => setZipBusy(false), 600);
    }
  };

  const downloadWorkspaceSource = () => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.BASE_URL}workspace-source.zip`;
    link.download = 'pattern-masterclass-workspace-source.zip';
    link.click();
  };

  return {
    backupOpen,
    setBackupOpen,
    zipBusy,
    onExport,
    onRestore,
    exportProject,
    downloadWorkspaceSource,
  };
}
