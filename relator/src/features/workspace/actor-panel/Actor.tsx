import { useEffect, useId, useState } from "react";

import { Textarea } from "../../../ui/textarea";

type ContextMenuPosition = {
  x: number;
  y: number;
};

function Actor({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => void;
}) {
  const nameId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] =
    useState<ContextMenuPosition | null>(null);

  useEffect(() => {
    if (!contextMenuPosition) {
      return;
    }

    function closeContextMenu() {
      setContextMenuPosition(null);
    }

    function closeContextMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    }

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("contextmenu", closeContextMenu);
    window.addEventListener("keydown", closeContextMenuOnEscape);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("contextmenu", closeContextMenu);
      window.removeEventListener("keydown", closeContextMenuOnEscape);
    };
  }, [contextMenuPosition]);

  function openContextMenu(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <section
      className="w-full border border-border bg-background"
      onContextMenu={openContextMenu}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-sm leading-none"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          type="button"
        >
          <span className={isOpen ? "rotate-90" : ""}>{">"}</span>
        </button>

        <div className="grid min-w-0 flex-1 gap-1.5">
          <Textarea
            className="min-h-8 resize-none rounded-sm"
            id={nameId}
            placeholder="Name"
          />
        </div>
      </div>

      {isOpen ? <div className="border-t border-border" /> : null}

      {contextMenuPosition ? (
        <div
          className="fixed z-50 min-w-28 rounded-sm border border-border bg-popover p-1 text-popover-foreground shadow-md"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button
            className="flex w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
            onClick={onDelete}
            type="button"
          >
            Delete
          </button>
        </div>
      ) : null}
    </section>
  );
}

export { Actor };
