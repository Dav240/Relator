import type { FormEvent, ReactNode } from "react";

type FileWindowProps = {
  actionLabel: string;
  children?: ReactNode;
  error: string | null;
  formClassName?: string;
  isActionDisabled?: boolean;
  isBusy?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title: string;
};

function FileWindow({
  actionLabel,
  children,
  error,
  formClassName = "",
  isActionDisabled,
  isBusy,
  isOpen,
  onClose,
  onSubmit,
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
