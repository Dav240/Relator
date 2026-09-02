import { useState } from "react";

import { Circle, Hexagon, Oval, Rectangle, Square, Star } from "./shapes";
import type { GroupingShape, Position } from "../types";

type DragState = {
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
};

function getNodeBaseSize(label: string) {
  return Math.min(160, Math.max(64, 52 + label.length * 6));
}

function getNodeSize(label: string, shape: GroupingShape = "circle") {
  const baseSize = getNodeBaseSize(label);

  if (shape === "oval") {
    return {
      height: baseSize * 0.64,
      width: baseSize * 1.6,
    };
  }

  if (shape === "rectangle") {
    return {
      height: baseSize * 0.8,
      width: baseSize * 1.6,
    };
  }

  return {
    height: baseSize,
    width: baseSize,
  };
}

function renderShape(shape: GroupingShape, label: string) {
  const size = getNodeSize(label, shape);
  const props = { ...size, label };

  if (shape === "oval") {
    return <Oval {...props} />;
  }

  if (shape === "square") {
    return <Square {...props} />;
  }

  if (shape === "rectangle") {
    return <Rectangle {...props} />;
  }

  if (shape === "star") {
    return <Star {...props} />;
  }

  if (shape === "hexagon") {
    return <Hexagon {...props} />;
  }

  return <Circle {...props} />;
}

function Node({
  label,
  onMove,
  position,
  shape = "circle",
}: {
  label: string;
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
      {renderShape(shape, label)}
    </div>
  );
}

export { getNodeSize, Node };
