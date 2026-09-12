import { useState } from "react";
import type { FormEvent } from "react";

import { FilePathFields } from "../global/FilePathFields";
import { FileWindow } from "../global/FileWindow";
import { useFilePathFields } from "../global/useFilePathFields";
import { ExportPreview } from "./ExportPreview";
import {
  EXPORT_FORMAT_LABELS,
  EXPORT_FORMATS_BY_MODE,
  getDefaultExportFormat,
  getDefaultExportPath,
} from "./export-options";
import { exportDiagram } from "./export";
import type { ExportFormat, ExportMode } from "./export";
import { useExportPreview } from "./useExportPreview";

type ExportWindowProps = {
  isOpen: boolean;
  mode: ExportMode;
  onClose: () => void;
};

function ExportWindow({ isOpen, mode, onClose }: ExportWindowProps) {
  const [isExporting, setIsExporting] = useState(false);
  const {
    choosePath,
    error,
    extension: exportFormat,
    fileName,
    filePath,
    getResolvedPath,
    setError,
    updateExtension,
    updateFileName,
    updateFilePath,
  } = useFilePathFields<ExportFormat>({
    defaultExtension: getDefaultExportFormat(mode),
    dialogFilterName: mode === "image" ? "Image Export" : "PDF Export",
    extensions: EXPORT_FORMATS_BY_MODE[mode],
    getDefaultDirectory: () => getDefaultExportPath(mode),
    isOpen,
    resetKey: mode,
  });
  const { isPreviewLoading, preview, previewError } = useExportPreview({
    exportFormat,
    isOpen,
    mode,
  });

  async function submitExport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const exportPath = getResolvedPath();

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
      formClassName="w-[44rem]"
      isActionDisabled={!fileName.trim() || !filePath.trim()}
      isBusy={isExporting}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitExport}
      title={mode === "image" ? "Export as Image" : "Export as File"}
    >
      <FilePathFields
        autoFocusName
        fileName={fileName}
        filePath={filePath}
        nameAfter={
          <label className="block">
            <span className="mb-1 block text-xs font-medium">File Type</span>
            <select
              className="h-9 w-full rounded-sm border border-input bg-background px-2 text-sm outline-none focus:border-ring"
              onChange={(event) =>
                updateExtension(event.currentTarget.value as ExportFormat)
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
        }
        onChoosePath={choosePath}
        onFileNameChange={updateFileName}
        onFilePathChange={updateFilePath}
        pathLabel="Export Path"
      />
      <ExportPreview
        error={previewError}
        isLoading={isPreviewLoading}
        preview={preview}
      />
    </FileWindow>
  );
}

export { ExportWindow };
export type { ExportFormat, ExportMode };
