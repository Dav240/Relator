function ensureRelatorExtension(path: string) {
  return path.toLowerCase().endsWith(".relator") ? path : `${path}.relator`;
}

function ensureRelatorFileName(fileName: string) {
  const trimmedName = fileName.trim();

  if (!trimmedName) {
    return "";
  }

  return ensureRelatorExtension(trimmedName);
}

function getDirectoryPath(path: string) {
  const lastBackslash = path.lastIndexOf("\\");
  const lastSlash = path.lastIndexOf("/");
  const separatorIndex = Math.max(lastBackslash, lastSlash);

  if (separatorIndex < 0) {
    return "";
  }

  return path.slice(0, separatorIndex);
}

function getFileName(path: string) {
  const lastBackslash = path.lastIndexOf("\\");
  const lastSlash = path.lastIndexOf("/");
  const separatorIndex = Math.max(lastBackslash, lastSlash);
  const basename = path.slice(separatorIndex + 1);

  return basename.replace(/\.relator$/i, "");
}

function joinPath(directory: string, fileName: string) {
  if (!fileName) {
    return directory;
  }

  const separator = directory.includes("\\") ? "\\" : "/";

  if (directory.endsWith("\\") || directory.endsWith("/")) {
    return `${directory}${fileName}`;
  }

  return `${directory}${separator}${fileName}`;
}

export {
  ensureRelatorExtension,
  ensureRelatorFileName,
  getDirectoryPath,
  getFileName,
  joinPath,
};
