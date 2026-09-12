import type { FormEvent, ReactNode } from "react";

type FileWindowProps = {
  actionLabel: string;
  afterName?: ReactNode;
  autoFocusName?: boolean;
  children?: ReactNode;
  error: string | null;
  fields?: ReactNode;
  fileName: string;
  filePath: string;
  formClassName?: string;
  isActionDisabled?: boolean;
  isBusy?: boolean;
  isOpen: boolean;
  onChoosePath: () => void;
  onClose: () => void;
  onFileNameChange: (fileName: string) => void;
  onFilePathChange: (filePath: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pathLabel?: string;
  title: string;
};

function FileWindow({
  actionLabel,
  afterName,
  autoFocusName,
  children,
  error,
  fields,
  fileName,
  filePath,
  formClassName = "",
  isActionDisabled,
  isBusy,
  isOpen,
  onChoosePath,
  onClose,
  onFileNameChange,
  onFilePathChange,
  onSubmit,
  pathLabel = "File Path",
  title,
}: FileWindowProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--modal-backdrop)]">
      <form
        className={`w-[32rem] max-w-[calc(100vw-2rem)] rounded-sm border border-border bg-background p-4 text-sm text-foreground shadow-lg ${formClassName}`}
        onSubmit={onSubmit}
      >
        <div className="mb-4 text-base font-medium">{title}</div>

        {fields ?? (
          <>
            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-medium">File Name</span>
              <input
                autoFocus={autoFocusName}
                className="h-9 w-full rounded-sm border border-input bg-background px-2 outline-none focus:border-ring"
                onChange={(event) => onFileNameChange(event.target.value)}
                value={fileName}
              />
            </label>

            {afterName}

            <label className="mb-3 block">
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
          </>
        )}

        {children}

        {error ? <div className="mb-3 text-xs text-destructive">{error}</div> : null}

        <div className="flex justify-end gap-2">
          <button
            className="h-8 rounded-sm border border-border px-3 hover:bg-muted"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-8 rounded-sm border border-border bg-foreground px-3 text-background disabled:opacity-50"
            disabled={isActionDisabled || isBusy}
            type="submit"
          >
            {actionLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export { FileWindow };
