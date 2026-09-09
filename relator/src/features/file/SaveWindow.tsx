import { invoke } from "@tauri-apps/api/core";
import { save as chooseSavePath } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  ensureRelatorExtension,
  ensureRelatorFileName,
  getDirectoryPath,
  getFileName,
  joinPath,
} from "../file/path";

type SaveWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (path: string) => Promise<void>;
};

function SaveWindow({ isOpen, onClose, onSave }: SaveWindowProps) {
  const [directoryPath, setDirectoryPath] = useState("");
  const [diagramsFolder, setDiagramsFolder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    async function loadDefaultPath() {
      try {
        const defaultPath = await invoke<string>("diagrams_folder_path");

        if (isMounted) {
          setDiagramsFolder(defaultPath);
          setDirectoryPath(defaultPath);
          setFileName("");
          setFilePath(defaultPath);
          setError(null);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      }
    }

    loadDefaultPath();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function updateFileName(nextFileName: string) {
    const directory = directoryPath || diagramsFolder;
    const relatorFileName = ensureRelatorFileName(nextFileName);

    setFileName(nextFileName);
    setFilePath(relatorFileName ? joinPath(directory, relatorFileName) : directory);
  }

  function updateFilePath(nextFilePath: string) {
    const nextDirectoryPath = getDirectoryPath(nextFilePath) || diagramsFolder;

    setDirectoryPath(nextDirectoryPath);
    setFilePath(nextFilePath);
    setFileName(getFileName(nextFilePath));
  }

  async function choosePath() {
    try {
      const selectedPath = await chooseSavePath({
        defaultPath: filePath || diagramsFolder,
        filters: [{ name: "Relator diagrams", extensions: ["relator"] }],
      });

      if (!selectedPath) {
        return;
      }

      updateFilePath(ensureRelatorExtension(selectedPath));
    } catch (pathError) {
      setError(pathError instanceof Error ? pathError.message : String(pathError));
    }
  }

  async function submitSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const relatorFileName = ensureRelatorFileName(fileName);
    const saveDirectory = directoryPath || diagramsFolder;
    const savePath = filePath.trim().toLowerCase().endsWith(".relator")
      ? ensureRelatorExtension(filePath.trim())
      : joinPath(saveDirectory, relatorFileName);

    if (!fileName.trim() || !savePath.trim()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(savePath);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--modal-backdrop)]">
      <form
        className="w-[32rem] max-w-[calc(100vw-2rem)] rounded-sm border border-border bg-background p-4 text-sm text-foreground shadow-lg"
        onSubmit={submitSave}
      >
        <div className="mb-4 text-base font-medium">Save as</div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium">File Name</span>
          <input
            autoFocus
            className="h-9 w-full rounded-sm border border-input bg-background px-2 outline-none focus:border-ring"
            onChange={(event) => updateFileName(event.target.value)}
            value={fileName}
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium">File Path</span>
          <div className="flex gap-2">
            <input
              className="h-9 min-w-0 flex-1 rounded-sm border border-input bg-background px-2 outline-none focus:border-ring"
              onChange={(event) => updateFilePath(event.target.value)}
              value={filePath}
            />
            <button
              className="h-9 w-10 rounded-sm border border-border bg-background hover:bg-muted"
              onClick={choosePath}
              type="button"
            >
              ...
            </button>
          </div>
        </label>

        {error ? <div className="mb-3 text-xs text-destructive">{error}</div> : null}

        <div className="flex justify-end gap-2">
          <button
            className="h-8 rounded-sm border border-border px-3 hover:bg-muted"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-8 rounded-sm border border-border bg-foreground px-3 text-background disabled:opacity-50"
            disabled={!fileName.trim() || !filePath.trim() || isSaving}
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export { SaveWindow };
