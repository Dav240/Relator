import { invoke } from "@tauri-apps/api/core";
import { save as chooseSavePath } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { FileWindow } from "../global/FileWindow";
import {
  ensureRelatorExtension,
  ensureRelatorFileName,
  getDirectoryPath,
  getFileName,
  joinPath,
} from "./path";

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
    <FileWindow
      actionLabel="Save"
      autoFocusName
      error={error}
      fileName={fileName}
      filePath={filePath}
      isActionDisabled={!fileName.trim() || !filePath.trim()}
      isBusy={isSaving}
      isOpen={isOpen}
      onChoosePath={choosePath}
      onClose={onClose}
      onFileNameChange={updateFileName}
      onFilePathChange={updateFilePath}
      onSubmit={submitSave}
      title="Save as"
    />
  );
}

export { SaveWindow };
