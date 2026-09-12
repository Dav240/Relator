import { useEffect, useState } from "react";

import { createExportPreview } from "./export";
import { EXPORT_FORMATS_BY_MODE } from "./export-options";
import type { ExportFormat, ExportMode, ExportPreview } from "./export";

function useExportPreview({
  exportFormat,
  isOpen,
  mode,
}: {
  exportFormat: ExportFormat;
  isOpen: boolean;
  mode: ExportMode;
}) {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

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

  return {
    isPreviewLoading,
    preview,
    previewError,
  };
}

export { useExportPreview };
