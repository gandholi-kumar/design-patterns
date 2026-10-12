import { useEffect, useMemo, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import type { NoteBlock } from "../../lib/notes/notes-schema";

interface NotesEditorProps {
  initialBlocks: NoteBlock[];
  patternName: string;
  theme?: "light" | "dark";
  onBlocksChange: (blocks: NoteBlock[]) => void;
  onUploadMedia: (file: File) => Promise<{ id: string; url?: string }>;
}

export function NotesEditor({
  initialBlocks,
  patternName,
  theme = "dark",
  onBlocksChange,
  onUploadMedia,
}: NotesEditorProps) {
  const [isReady, setIsReady] = useState(false);

  // Convert NoteBlock[] to BlockNote PartialBlock[] if available
  const parsedInitialContent = useMemo<PartialBlock[] | undefined>(() => {
    if (!initialBlocks || initialBlocks.length === 0) {
      return [
        {
          type: "heading",
          props: { level: 2 },
          content: `${patternName} Notes`,
        },
        {
          type: "paragraph",
          content: "Record your mental models, gotchas, and production insights...",
        },
      ];
    }
    return initialBlocks as unknown as PartialBlock[];
  }, [initialBlocks, patternName]);

  const editor = useCreateBlockNote({
    initialContent: parsedInitialContent,
    uploadFile: async (file: File) => {
      try {
        const { url } = await onUploadMedia(file);
        return url || "";
      } catch (err) {
        console.error("Failed to upload image in editor:", err);
        return "";
      }
    },
  });

  useEffect(() => {
    if (editor) {
      setIsReady(true);
    }
  }, [editor]);

  // Handle document changes
  const handleChange = () => {
    if (!editor) return;
    const documentBlocks = editor.document as unknown as NoteBlock[];
    onBlocksChange(documentBlocks);
  };

  if (!editor || !isReady) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-muted-foreground animate-pulse">
        Initializing notes editor...
      </div>
    );
  }

  return (
    <div
      className="notes-editor-wrapper h-full w-full overflow-y-auto"
      data-testid="blocknote-editor"
    >
      <BlockNoteView
        editor={editor}
        theme={theme}
        onChange={handleChange}
        data-theming-css-variables-demo
      />
    </div>
  );
}
