import { useEffect, useRef, useState } from "react";

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
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const latestDragPositionRef = useRef(position);
  const visiblePosition = dragPosition ?? position;

  useEffect(() => {
    if (!dragState) {
      latestDragPositionRef.current = position;
    }
  }, [dragState, position]);

  function startDragging(event: React.PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    latestDragPositionRef.current = position;

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
    const nextPosition = {
      x: dragState.originX + event.clientX - dragState.pointerX,
      y: dragState.originY + event.clientY - dragState.pointerY,
    };

    latestDragPositionRef.current = nextPosition;
    setDragPosition(nextPosition);
  }

  function stopDragging(event: React.PointerEvent<HTMLDivElement>) {
    event.stopPropagation();

    if (dragState) {
      onMove(latestDragPositionRef.current);
    }

    setDragPosition(null);
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
        transform: `translate(${visiblePosition.x}px, ${visiblePosition.y}px)`,
      }}
    >
      <Shape colour={colour} label={label} shape={shape} />
    </div>
  );
}

export { Node };
