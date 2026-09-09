import { useState } from "react";

import { Shape } from "./shapes";
import type { GroupingColour, GroupingShape, Position } from "../types";

type DragState = {
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
};

function Node({
  label,
  colour,
  onMove,
  position,
  shape = "circle",
}: {
  label: string;
  colour?: GroupingColour;
  onMove: (position: Position) => void;
  position: Position;
  shape?: GroupingShape;
}) {
  const [dragState, setDragState] = useState<DragState | null>(null);

  function startDragging(event: React.PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    setDragState({
      originX: position.x,
      originY: position.y,
      pointerX: event.clientX,
      pointerY: event.clientY,
    });
  }

  function dragNode(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState) {
      return;
    }

    event.stopPropagation();
    onMove({
      x: dragState.originX + event.clientX - dragState.pointerX,
      y: dragState.originY + event.clientY - dragState.pointerY,
    });
  }

  function stopDragging(event: React.PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    setDragState(null);
  }

  return (
    <div
      className="absolute z-20 cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerCancel={stopDragging}
      onPointerDown={startDragging}
      onPointerMove={dragNode}
      onPointerUp={stopDragging}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <Shape colour={colour} label={label} shape={shape} />
    </div>
  );
}

export { Node };
