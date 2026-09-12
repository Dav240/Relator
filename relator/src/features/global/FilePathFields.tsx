import type { ReactNode } from "react";

type FilePathFieldsProps = {
  autoFocusName?: boolean;
  className?: string;
  fileName: string;
  filePath: string;
  nameAfter?: ReactNode;
  onChoosePath: () => void;
  onFileNameChange: (fileName: string) => void;
  onFilePathChange: (filePath: string) => void;
  pathLabel?: string;
};

function FilePathFields({
  autoFocusName,
  className = "mb-3 grid gap-3",
  fileName,
  filePath,
  nameAfter,
  onChoosePath,
  onFileNameChange,
  onFilePathChange,
  pathLabel = "File Path",
}: FilePathFieldsProps) {
  return (
    <div className={className}>
      <div
        className={
          nameAfter
            ? "grid gap-3 sm:grid-cols-[minmax(0,4fr)_minmax(8rem,1fr)]"
            : ""
        }
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium">File Name</span>
          <input
            autoFocus={autoFocusName}
            className="h-9 w-full rounded-sm border border-input bg-background px-2 outline-none focus:border-ring"
            onChange={(event) => onFileNameChange(event.target.value)}
            value={fileName}
          />
        </label>
        {nameAfter}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium">{pathLabel}</span>
        <div className="flex gap-2">
          <input
            className="h-9 min-w-0 flex-1 rounded-sm border border-input bg-background px-2 outline-none focus:border-ring"
            onChange={(event) => onFilePathChange(event.target.value)}
            value={filePath}
          />
          <button
            className="h-9 w-10 rounded-sm border border-border bg-background hover:bg-muted"
            onClick={onChoosePath}
            type="button"
          >
            ...
          </button>
        </div>
      </label>
    </div>
  );
}

export { FilePathFields };
