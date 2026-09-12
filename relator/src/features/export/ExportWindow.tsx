import { invoke } from "@tauri-apps/api/core";
import { downloadDir, pictureDir } from "@tauri-apps/api/path";
import { save as chooseSavePath } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { FileWindow } from "../global/FileWindow";
import {
  ensureFileExtension,
  ensureFileNameExtension,
  getDirectoryPath,
  getFileName,
  joinPath,
} from "../file/path";
import { createExportPreview, exportDiagram } from "./export";
import type { ExportFormat, ExportMode, ExportPreview } from "./export";

type ExportWindowProps = {
  isOpen: boolean;
  mode: ExportMode;
  onClose: () => void;
};

const EXPORT_FORMATS_BY_MODE: Record<ExportMode, ExportFormat[]> = {
  image: ["png", "jpeg", "svg", "webp"],
  pdf: ["pdf"],
};

const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  jpeg: ".jpeg",
  png: ".png",
  svg: ".svg",
  webp: ".webp",
  pdf: ".pdf",
};

function getDefaultFormat(mode: ExportMode) {
  return EXPORT_FORMATS_BY_MODE[mode][0];
}

async function getDefaultExportPath(mode: ExportMode) {
  try {
    return mode === "image" ? await pictureDir() : await downloadDir();
  } catch {
    return invoke<string>("diagrams_folder_path");
  }
}

function getMatchingFormat(path: string, formats: ExportFormat[]) {
  const lowerPath = path.toLowerCase();

  return formats.find((format) => lowerPath.endsWith(`.${format}`));
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / 1024 / 1024;

  if (megabytes < 0.01) {
    return "<0.01 MB";
  }

  return `${megabytes >= 10 ? megabytes.toFixed(1) : megabytes.toFixed(2)} MB`;
}

function ExportWindow({ isOpen, mode, onClose }: ExportWindowProps) {
  const [directoryPath, setDirectoryPath] = useState("");
  const [exportFolder, setExportFolder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(
    getDefaultFormat(mode),
  );
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;
    const defaultFormat = getDefaultFormat(mode);

    setError(null);
    setExportFormat(defaultFormat);
    setPreview(null);
    setPreviewError(null);

    async function loadDefaultPath() {
      try {
        const defaultPath = await getDefaultExportPath(mode);

        if (isMounted) {
          setExportFolder(defaultPath);
          setDirectoryPath(defaultPath);
          setFileName("");
          setFilePath(defaultPath);
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
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    async function loadPreview() {
      setIsPreviewLoading(true);
      setPreview(null);
      setPreviewError(null);

      try {
        const nextPreview = await createExportPreview(exportFormat);

        if (isMounted) {
          setPreview(nextPreview);
        }
      } catch (loadError) {
        if (isMounted) {
          setPreviewError(
            loadError instanceof Error ? loadError.message : String(loadError),
          );
        }
      } finally {
        if (isMounted) {
          setIsPreviewLoading(false);
        }
      }
    }

    if (EXPORT_FORMATS_BY_MODE[mode].includes(exportFormat)) {
      loadPreview();
    }

    return () => {
      isMounted = false;
    };
  }, [exportFormat, isOpen, mode]);

  function updateFileName(nextFileName: string, nextFormat = exportFormat) {
    const directory = directoryPath || exportFolder;
    const exportFileName = ensureFileNameExtension(nextFileName, nextFormat);

    setFileName(nextFileName);
    setFilePath(exportFileName ? joinPath(directory, exportFileName) : directory);
  }

  function updateFilePath(nextFilePath: string) {
    const formats = EXPORT_FORMATS_BY_MODE[mode];
    const matchingFormat = getMatchingFormat(nextFilePath, formats);
    const nextFormat = matchingFormat ?? exportFormat;
    const nextDirectoryPath = getDirectoryPath(nextFilePath) || exportFolder;

    setDirectoryPath(nextDirectoryPath);
    setExportFormat(nextFormat);
    setFilePath(nextFilePath);
    setFileName(getFileName(nextFilePath, nextFormat));
  }

  function updateExportFormat(nextFormat: ExportFormat) {
    setExportFormat(nextFormat);
    updateFileName(fileName, nextFormat);
  }

  async function choosePath() {
    try {
      const selectedPath = await chooseSavePath({
        defaultPath: filePath || exportFolder,
        filters: [
          {
            extensions: EXPORT_FORMATS_BY_MODE[mode],
            name: mode === "image" ? "Image Export" : "PDF Export",
          },
        ],
      });

      if (!selectedPath) {
        return;
      }

      const matchingFormat = getMatchingFormat(
        selectedPath,
        EXPORT_FORMATS_BY_MODE[mode],
      );
      const nextFormat = matchingFormat ?? exportFormat;

      setExportFormat(nextFormat);
      updateFilePath(ensureFileExtension(selectedPath, nextFormat));
    } catch (pathError) {
      setError(pathError instanceof Error ? pathError.message : String(pathError));
    }
  }

  async function submitExport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const exportFileName = ensureFileNameExtension(fileName, exportFormat);
    const exportDirectory = directoryPath || exportFolder;
    const exportPath = filePath
      .trim()
      .toLowerCase()
      .endsWith(`.${exportFormat}`)
      ? ensureFileExtension(filePath.trim(), exportFormat)
      : joinPath(exportDirectory, exportFileName);

    if (!fileName.trim() || !exportPath.trim()) {
      return;
    }

    setError(null);
    setIsExporting(true);

    try {
      await exportDiagram({ format: exportFormat, path: exportPath });
      onClose();
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : String(exportError),
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <FileWindow
      actionLabel="Export"
      error={error}
      fields={
        <div className="mb-3 grid gap-3 sm:grid-cols-[minmax(0,4fr)_minmax(8rem,1fr)]">
          <label className="block">
            <span className="mb-1 block text-xs font-medium">File Name</span>
            <input
              autoFocus
              className="h-9 w-full rounded-sm border border-input bg-background px-2 outline-none focus:border-ring"
              onChange={(event) => updateFileName(event.target.value)}
              value={fileName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">File Type</span>
            <select
              className="h-9 w-full rounded-sm border border-input bg-background px-2 text-sm outline-none focus:border-ring"
              onChange={(event) =>
                updateExportFormat(event.currentTarget.value as ExportFormat)
              }
              value={exportFormat}
            >
              {EXPORT_FORMATS_BY_MODE[mode].map((format) => (
                <option key={format} value={format}>
                  {EXPORT_FORMAT_LABELS[format]}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium">Export Path</span>
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

          <div className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium">Preview</span>
            <div className="flex h-48 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted/40 p-2">
              {isPreviewLoading ? (
                <div className="text-xs text-muted-foreground">Generating preview...</div>
              ) : previewError ? (
                <div className="text-xs text-destructive">{previewError}</div>
              ) : preview ? (
                preview.format === "pdf" ? (
                  <div
                    className="flex max-h-full max-w-full items-center justify-center rounded-sm border border-border bg-white p-1 shadow-sm"
                    style={{
                      aspectRatio: `${preview.width} / ${preview.height}`,
                    }}
                  >
                    <img
                      alt="PDF export preview"
                      className="max-h-full max-w-full object-contain"
                      src={preview.previewUrl}
                    />
                  </div>
                ) : (
                  <img
                    alt="Image export preview"
                    className="max-h-full max-w-full object-contain"
                    src={preview.previewUrl}
                  />
                )
              ) : null}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {preview
                ? `${preview.width}x${preview.height}, ${formatFileSize(
                    preview.bytes.length,
                  )}`
                : "No preview yet"}
            </div>
          </div>
        </div>
      }
      fileName={fileName}
      filePath={filePath}
      formClassName="w-[44rem]"
      isActionDisabled={!fileName.trim() || !filePath.trim()}
      isBusy={isExporting}
      isOpen={isOpen}
      onChoosePath={choosePath}
      onClose={onClose}
      onFileNameChange={updateFileName}
      onFilePathChange={updateFilePath}
      onSubmit={submitExport}
      title={mode === "image" ? "Export as Image" : "Export as File"}
    />
  );
}

export { ExportWindow };
export type { ExportFormat, ExportMode };
