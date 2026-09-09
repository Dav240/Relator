import { useCallback, useEffect, useId, useState } from "react";
import type { MouseEvent } from "react";

type ContextMenuPosition = {
  x: number;
  y: number;
};

type WorkspaceContextMenuDetail = {
  ownerId: string;
};

type UseContextMenuOptions = {
  onClose?: () => void;
  ownerId?: string;
};

const WORKSPACE_CONTEXT_MENU_EVENT = "workspace-context-menu-open";

function useContextMenu(options: UseContextMenuOptions = {}) {
  const generatedOwnerId = useId();
  const ownerId = options.ownerId ?? generatedOwnerId;
  const onClose = options.onClose;
  const [contextMenuPosition, setContextMenuPosition] =
    useState<ContextMenuPosition | null>(null);

  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
    onClose?.();
  }, [onClose]);

  const openContextMenu = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (contextMenuPosition) {
        closeContextMenu();
        return;
      }

      window.dispatchEvent(
        new CustomEvent<WorkspaceContextMenuDetail>(WORKSPACE_CONTEXT_MENU_EVENT, {
          detail: { ownerId },
        }),
      );

      setContextMenuPosition({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [closeContextMenu, contextMenuPosition, ownerId],
  );

  useEffect(() => {
    if (!contextMenuPosition) {
      return;
    }

    function closeContextMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    }

    function closeContextMenuFromOtherMenu(event: Event) {
      const detail = (event as CustomEvent<WorkspaceContextMenuDetail>).detail;

      if (detail?.ownerId !== ownerId) {
        closeContextMenu();
      }
    }

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("contextmenu", closeContextMenu);
    window.addEventListener(
      WORKSPACE_CONTEXT_MENU_EVENT,
      closeContextMenuFromOtherMenu,
    );
    window.addEventListener("keydown", closeContextMenuOnEscape);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("contextmenu", closeContextMenu);
      window.removeEventListener(
        WORKSPACE_CONTEXT_MENU_EVENT,
        closeContextMenuFromOtherMenu,
      );
      window.removeEventListener("keydown", closeContextMenuOnEscape);
    };
  }, [closeContextMenu, contextMenuPosition, ownerId]);

  return {
    closeContextMenu,
    contextMenuPosition,
    openContextMenu,
  };
}

export { useContextMenu };
export type { ContextMenuPosition };
