import type { ExportPreview as ExportPreviewData } from "./export";

type ExportPreviewProps = {
  error: string | null;
  isLoading: boolean;
  preview: ExportPreviewData | null;
};

function formatFileSize(bytes: number) {
  const megabytes = bytes / 1024 / 1024;

  if (megabytes < 0.01) {
    return "<0.01 MB";
  }

  return `${megabytes >= 10 ? megabytes.toFixed(1) : megabytes.toFixed(2)} MB`;
}

function ExportPreview({ error, isLoading, preview }: ExportPreviewProps) {
  return (
    <div className="block">
      <span className="mb-1 block text-xs font-medium">Preview</span>
      <div className="flex h-48 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted/40 p-2">
        {isLoading ? (
          <div className="text-xs text-muted-foreground">Generating preview...</div>
        ) : error ? (
          <div className="text-xs text-destructive">{error}</div>
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
  );
}

export { ExportPreview };
