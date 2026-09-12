function ensureFileExtension(path: string, extension: string) {
  const normalisedExtension = extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`;

  return path.toLowerCase().endsWith(normalisedExtension)
    ? path
    : `${path}${normalisedExtension}`;
}

function ensureFileNameExtension(fileName: string, extension: string) {
  const trimmedName = fileName.trim();

  if (!trimmedName) {
    return "";
  }

  return ensureFileExtension(trimmedName, extension);
}

function ensureRelatorExtension(path: string) {
  return ensureFileExtension(path, "relator");
}

function ensureRelatorFileName(fileName: string) {
  return ensureFileNameExtension(fileName, "relator");
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

function getFileName(path: string, extension?: string) {
  const lastBackslash = path.lastIndexOf("\\");
  const lastSlash = path.lastIndexOf("/");
  const separatorIndex = Math.max(lastBackslash, lastSlash);
  const basename = path.slice(separatorIndex + 1);

  if (!extension) {
    return basename.replace(/\.[^.]+$/i, "");
  }

  const normalisedExtension = extension.startsWith(".")
    ? extension.slice(1)
    : extension;

  return basename.replace(new RegExp(`\\.${normalisedExtension}$`, "i"), "");
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
  ensureFileExtension,
  ensureFileNameExtension,
  ensureRelatorExtension,
  ensureRelatorFileName,
  getDirectoryPath,
  getFileName,
  joinPath,
};
