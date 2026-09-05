import { useId, useState } from "react";

import type {
  EdgeLayout,
  GroupingShape,
  Position,
  WorkspaceActor,
  WorkspaceRelationship,
} from "../../types";

import { 
  getNodeCenter,
  getBoundaryPoint,
  getReadableAngle,
} from "./edge-geometry"

type DragState =
  | {
      type: "label";
      originOffset: Position;
      pointerOrigin: Position;
    } | {
      type: "source" | "target";
    };

function getMapPoint(event: React.PointerEvent<SVGElement>) {
  const svg = event.currentTarget.ownerSVGElement;
  const bounds = svg?.getBoundingClientRect();

  if (!bounds) {
    return { x: 0, y: 0 };
  }

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}

function Edge({
  onLayoutChange,
  relationship,
  sourceShape,
  sourceActor,
  targetActor,
  targetShape,
}: {
  onLayoutChange: (edgeLayout: EdgeLayout) => void;
  relationship: WorkspaceRelationship;
  sourceShape: GroupingShape;
  sourceActor: WorkspaceActor;
  targetActor: WorkspaceActor;
  targetShape: GroupingShape;
}) {
  const markerId = useId().replace(/:/g, "");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const sourceCenter = getNodeCenter(sourceActor, sourceShape);
  const targetCenter = getNodeCenter(targetActor, targetShape);
  const sourcePoint = getBoundaryPoint({
    angle: relationship.edgeLayout.sourceAngle,
    center: sourceCenter,
    shape: sourceShape,
  });
  const targetPoint = getBoundaryPoint({
    angle: relationship.edgeLayout.targetAngle,
    center: targetCenter,
    shape: targetShape,
  });

  const labelPosition = {
    x:
      (sourcePoint.x + targetPoint.x) / 2 +
      relationship.edgeLayout.labelOffset.x,
    y:
      (sourcePoint.y + targetPoint.y) / 2 +
      relationship.edgeLayout.labelOffset.y,
  };

  const label = relationship.name.trim();
  const labelAngle = getReadableAngle(sourcePoint, targetPoint);

  function updateEdgeLayout(edgeLayout: Partial<EdgeLayout>) {
    onLayoutChange({
      ...relationship.edgeLayout,
      ...edgeLayout,
    });
  }

  function startEndpointDrag(
    event: React.PointerEvent<SVGCircleElement>,
    type: "source" | "target",
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({ type });
  }

    function dragEndpoint(event: React.PointerEvent<SVGCircleElement>) {
    if (!dragState || dragState.type === "label") {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const point = getMapPoint(event);
    const center = dragState.type === "source" ? sourceCenter : targetCenter;
    const angle = Math.atan2(point.y - center.y, point.x - center.x);

    updateEdgeLayout(
      dragState.type === "source"
        ? { sourceAngle: angle }
        : { targetAngle: angle },
    );
  }

  function startLabelDrag(event: React.PointerEvent<SVGTextElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      originOffset: relationship.edgeLayout.labelOffset,
      pointerOrigin: getMapPoint(event),
      type: "label",
    });
  }

  function dragLabel(event: React.PointerEvent<SVGTextElement>) {
    if (!dragState || dragState.type !== "label") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const point = getMapPoint(event);

    updateEdgeLayout({
      labelOffset: {
        x: dragState.originOffset.x + point.x - dragState.pointerOrigin.x,
        y: dragState.originOffset.y + point.y - dragState.pointerOrigin.y,
      },
    });
  }

  function stopDragging(event: React.PointerEvent<SVGElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragState(null);
  }

  return (
    <g className="pointer-events-auto touch-none select-none">
      <defs>
        <marker
          id={markerId}
          markerHeight="10"
          markerUnits="strokeWidth"
          markerWidth="10"
          orient="auto"
          refX="10"
          refY="5"
          viewBox="0 0 10 10"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" />
        </marker>
      </defs>

      <line
        markerEnd={
          relationship.type === "directed" ? `url(#${markerId})` : undefined
        }
        stroke="#111827"
        strokeWidth="2"
        x1={sourcePoint.x}
        x2={targetPoint.x}
        y1={sourcePoint.y}
        y2={targetPoint.y}
      />

      {label ? (
        <text
          className="cursor-grab fill-black text-xs font-medium active:cursor-grabbing"
          dominantBaseline="central"
          onPointerCancel={stopDragging}
          onPointerDown={startLabelDrag}
          onPointerMove={dragLabel}
          onPointerUp={stopDragging}
          paintOrder="stroke"
          stroke="white"
          strokeLinejoin="round"
          strokeWidth="4"
          style={{
            transform: `rotate(${labelAngle}deg)`,
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
          textAnchor="middle"
          x={labelPosition.x}
          y={labelPosition.y}
        >
          {label}
        </text>
      ) : null}

      <circle
        className="cursor-grab fill-white stroke-slate-700 active:cursor-grabbing"
        cx={sourcePoint.x}
        cy={sourcePoint.y}
        onPointerCancel={stopDragging}
        onPointerDown={(event) => startEndpointDrag(event, "source")}
        onPointerMove={dragEndpoint}
        onPointerUp={stopDragging}
        r="5"
        strokeWidth="1.5"
      />
      <circle
        className="cursor-grab fill-white stroke-slate-700 active:cursor-grabbing"
        cx={targetPoint.x}
        cy={targetPoint.y}
        onPointerCancel={stopDragging}
        onPointerDown={(event) => startEndpointDrag(event, "target")}
        onPointerMove={dragEndpoint}
        onPointerUp={stopDragging}
        r="5"
        strokeWidth="1.5"
      />
    </g>
  );
}

export { Edge };
