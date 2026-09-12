import { save as chooseSavePath } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";

import {
  ensureFileExtension,
  ensureFileNameExtension,
  getDirectoryPath,
  getFileName,
  joinPath,
  replaceFileExtension,
} from "../file/path";

type UseFilePathFieldsOptions<TExtension extends string> = {
  defaultExtension: TExtension;
  dialogFilterName: string;
  extensions: TExtension[];
  getDefaultDirectory: () => Promise<string>;
  isOpen: boolean;
  resetKey?: string;
};

function getMatchingExtension<TExtension extends string>(
  path: string,
  extensions: TExtension[],
) {
  const lowerPath = path.toLowerCase();

  return extensions.find((extension) => lowerPath.endsWith(`.${extension}`));
}

function useFilePathFields<TExtension extends string>({
  defaultExtension,
  dialogFilterName,
  extensions,
  getDefaultDirectory,
  isOpen,
  resetKey = "",
}: UseFilePathFieldsOptions<TExtension>) {
  const [defaultDirectory, setDefaultDirectory] = useState("");
  const [directoryPath, setDirectoryPath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [extension, setExtensionState] =
    useState<TExtension>(defaultExtension);
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    async function loadDefaultPath() {
      try {
        const nextDefaultDirectory = await getDefaultDirectory();

        if (isMounted) {
          setDefaultDirectory(nextDefaultDirectory);
          setDirectoryPath(nextDefaultDirectory);
          setError(null);
          setExtensionState(defaultExtension);
          setFileName("");
          setFilePath(nextDefaultDirectory);
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
  }, [defaultExtension, isOpen, resetKey]);

  function updateFileName(
    nextFileName: string,
    nextExtension: TExtension = extension,
  ) {
    const directory = directoryPath || defaultDirectory;
    const fileNameWithExtension = ensureFileNameExtension(
      nextFileName,
      nextExtension,
    );

    setFileName(nextFileName);
    setFilePath(
      fileNameWithExtension ? joinPath(directory, fileNameWithExtension) : directory,
    );
  }

  function updateFilePath(nextFilePath: string) {
    const matchingExtension = getMatchingExtension(nextFilePath, extensions);
    const nextExtension = matchingExtension ?? extension;
    const nextDirectoryPath = getDirectoryPath(nextFilePath) || defaultDirectory;

    setDirectoryPath(nextDirectoryPath);
    setExtensionState(nextExtension);
    setFilePath(nextFilePath);
    setFileName(getFileName(nextFilePath, nextExtension));
  }

  function updateExtension(nextExtension: TExtension) {
    setExtensionState(nextExtension);

    if (fileName.trim()) {
      updateFileName(fileName, nextExtension);
      return;
    }

    if (filePath.trim() && filePath !== directoryPath && filePath !== defaultDirectory) {
      updateFilePath(replaceFileExtension(filePath, nextExtension));
    }
  }

  async function choosePath() {
    try {
      const selectedPath = await chooseSavePath({
        defaultPath: filePath || defaultDirectory,
        filters: [{ extensions: [...extensions], name: dialogFilterName }],
      });

      if (!selectedPath) {
        return;
      }

      const matchingExtension = getMatchingExtension(selectedPath, extensions);
      const nextExtension = matchingExtension ?? extension;

      updateFilePath(ensureFileExtension(selectedPath, nextExtension));
    } catch (pathError) {
      setError(pathError instanceof Error ? pathError.message : String(pathError));
    }
  }

  function getResolvedPath() {
    const trimmedPath = filePath.trim();
    const fileNameWithExtension = ensureFileNameExtension(fileName, extension);
    const directory = directoryPath || defaultDirectory;

    if (!fileName.trim() || !trimmedPath) {
      return "";
    }

    if (trimmedPath.toLowerCase().endsWith(`.${extension}`)) {
      return ensureFileExtension(trimmedPath, extension);
    }

    return joinPath(directory, fileNameWithExtension);
  }

  return {
    choosePath,
    directoryPath,
    error,
    extension,
    fileName,
    filePath,
    getResolvedPath,
    setError,
    updateExtension,
    updateFileName,
    updateFilePath,
  };
}

export { useFilePathFields };
