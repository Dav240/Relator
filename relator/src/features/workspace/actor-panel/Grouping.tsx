import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Textarea } from "../../../ui/textarea";
import type { GroupingShape } from "../types";

type ContextMenuPosition = {
  x: number;
  y: number;
};

function Grouping({
  children,
  defaultName,
  name,
  onDelete,
  onRename,
  onShapeChange,
  shape,
}: {
  children: ReactNode;
  defaultName: string;
  name: string;
  onDelete: () => void;
  onRename: (name: string) => void;
  onShapeChange: (shape: GroupingShape) => void;
  shape: GroupingShape;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [contextMenuPosition, setContextMenuPosition] =
    useState<ContextMenuPosition | null>(null);
  const displayName = name.trim() || defaultName;

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
    window.addEventListener("actor-context-menu-open", closeContextMenu);
    window.addEventListener("keydown", closeContextMenuOnEscape);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("contextmenu", closeContextMenu);
      window.removeEventListener("actor-context-menu-open", closeContextMenu);
      window.removeEventListener("keydown", closeContextMenuOnEscape);
    };
  }, [contextMenuPosition]);

  function openContextMenu(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (contextMenuPosition) {
      setContextMenuPosition(null);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("actor-context-menu-open", {
        detail: { actorId: "" },
      }),
    );

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
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${displayName}`}
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-sm leading-none"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          type="button"
        >
          <span className={isOpen ? "rotate-90" : ""}>{">"}</span>
        </button>

        <div className="grid min-w-0 flex-1 gap-3">
          <Textarea
            aria-label="Grouping name"
            className="min-h-8 resize-none rounded-sm"
            onBlur={() => {
              if (!name.trim()) {
                onRename(defaultName);
              }
            }}
            onChange={(event) => onRename(event.currentTarget.value)}
            placeholder="Name"
            value={name}
          />

          <div className="grid min-w-0 grid-cols-2 gap-3">
            <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-xs font-medium">
              <span>Shape</span>
              <select
                className="h-8 min-w-0 rounded-sm border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                onChange={(event) =>
                  onShapeChange(event.currentTarget.value as GroupingShape)
                }
                value={shape}
              >
                <option value="circle">Circle</option>
                <option value="oval">Oval</option>
                <option value="square">Square</option>
                <option value="rectangle">Rectangle</option>
                <option value="star">Star</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </label>

            <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-xs font-medium">
              <span>Colour</span>
              <select
                className="h-8 min-w-0 rounded-sm border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue=""
              >
                <option value="" />
              </select>
            </label>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-border p-3">
          <div className="flex flex-col gap-3">{children}</div>
        </div>
      ) : null}

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

export { Grouping };
