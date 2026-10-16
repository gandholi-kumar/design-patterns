import { useEffect, useMemo, useState, useCallback } from "react";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
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

  // Convert NoteBlock[] to BlockNote PartialBlock[] if available, filtering broken/empty image blocks
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
    const blockList = Array.isArray(initialBlocks)
      ? (initialBlocks as Array<{ type?: string; props?: { url?: string } }>)
      : [];
    const sanitized = blockList.filter((block) => {
      if (block.type === "image" && (!block.props?.url || block.props.url.trim() === "")) {
        return false;
      }
      return true;
    });
    return sanitized as unknown as PartialBlock[];
  }, [initialBlocks, patternName]);

  const editor = useCreateBlockNote({
    initialContent: parsedInitialContent,
    uploadFile: async (file: File) => {
      try {
        const { url } = await onUploadMedia(file);
        if (!url) {
          throw new Error("No URL returned from upload");
        }
        return url;
      } catch (err) {
        console.error("Failed to upload image in editor:", err);
        throw err;
      }
    },
  });

  useEffect(() => {
    if (editor) {
      setIsReady(true);
    }
  }, [editor]);

  // Handle document changes
  const handleChange = useCallback(() => {
    if (!editor) return;
    try {
      const documentBlocks = editor.document as unknown as NoteBlock[];
      onBlocksChange(documentBlocks);
    } catch (err) {
      console.warn("Could not serialize document blocks:", err);
    }
  }, [editor, onBlocksChange]);

  // Curated, safe slash menu items for design pattern documentation
  const getSlashMenuItems = useCallback(
    async (query: string) => {
      if (!editor) return [];
      const queryLower = query.toLowerCase().trim();
      const defaultItems = getDefaultReactSlashMenuItems(editor);

      return defaultItems.filter((item) => {
        const titleLower = item.title.toLowerCase();
        // Exclude unneeded binary media blocks prone to media player or upload crashes
        if (titleLower === "audio" || titleLower === "video" || titleLower === "file") {
          return false;
        }

        if (!queryLower) return true;

        const matchesTitle = titleLower.includes(queryLower);
        const matchesAliases =
          item.aliases &&
          item.aliases.some((alias) => alias.toLowerCase().includes(queryLower));

        return Boolean(matchesTitle || matchesAliases);
      });
    },
    [editor]
  );

  if (!editor || !isReady) {
    return (
      <div className="flex items-center justify-center h-full min-h-[160px] text-xs text-muted-foreground animate-pulse">
        Initializing notes editor...
      </div>
    );
  }

  return (
    <div
      className="notes-editor-wrapper h-full w-full min-h-full flex flex-col overflow-y-auto cursor-text"
      data-testid="blocknote-editor"
      onClick={(e) => {
        // If clicking on the empty background below text, focus the editor
        if (e.target === e.currentTarget && editor) {
          editor.focus();
        }
      }}
    >
      <BlockNoteView
        editor={editor}
        theme={theme}
        onChange={handleChange}
        slashMenu={false}
        tableHandles={true}
        formattingToolbar={true}
        linkToolbar={true}
        sideMenu={true}
        data-theming-css-variables-demo
        className="flex-1 min-h-full flex flex-col"
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={getSlashMenuItems}
        />
      </BlockNoteView>
    </div>
  );
}
