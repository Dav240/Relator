import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import type { FormEvent } from "react";

import { FilePathFields } from "../global/FilePathFields";
import { FileWindow } from "../global/FileWindow";
import { useFilePathFields } from "../global/useFilePathFields";

type SaveWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (path: string) => Promise<void>;
};

function SaveWindow({ isOpen, onClose, onSave }: SaveWindowProps) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    choosePath,
    error,
    fileName,
    filePath,
    getResolvedPath,
    setError,
    updateFileName,
    updateFilePath,
  } = useFilePathFields({
    defaultExtension: "relator",
    dialogFilterName: "Relator diagrams",
    extensions: ["relator"],
    getDefaultDirectory: () => invoke<string>("diagrams_folder_path"),
    isOpen,
  });

  if (!isOpen) {
    return null;
  }

  async function submitSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const savePath = getResolvedPath();

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
      error={error}
      isActionDisabled={!fileName.trim() || !filePath.trim()}
      isBusy={isSaving}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitSave}
      title="Save as"
    >
      <FilePathFields
        autoFocusName
        fileName={fileName}
        filePath={filePath}
        onChoosePath={choosePath}
        onFileNameChange={updateFileName}
        onFilePathChange={updateFilePath}
      />
    </FileWindow>
  );
}

export { SaveWindow };
