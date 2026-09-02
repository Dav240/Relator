import { useId, useState } from "react";

import { getNodeSize } from "./Node";
import type {
  EdgeLayout,
  GroupingShape,
  Position,
  WorkspaceActor,
  WorkspaceRelationship,
} from "../types";

type DragState =
  | {
      type: "label";
      originOffset: Position;
      pointerOrigin: Position;
    } | {
      type: "source" | "target";
    };

function getDisplayName(actor: WorkspaceActor) {
  return actor.name.trim() || actor.defaultName;
}

const STAR_POINTS = [
  { x: 0.5, y: 0.04 },
  { x: 0.61, y: 0.35 },
  { x: 0.94, y: 0.35 },
  { x: 0.67, y: 0.55 },
  { x: 0.78, y: 0.88 },
  { x: 0.5, y: 0.68 },
  { x: 0.22, y: 0.88 },
  { x: 0.33, y: 0.55 },
  { x: 0.06, y: 0.35 },
  { x: 0.39, y: 0.35 },
];

const HEXAGON_POINTS = [
  { x: 0.25, y: 0.06 },
  { x: 0.75, y: 0.06 },
  { x: 1, y: 0.5 },
  { x: 0.75, y: 0.94 },
  { x: 0.25, y: 0.94 },
  { x: 0, y: 0.5 },
];

function getNodeCenter(actor: WorkspaceActor, shape: GroupingShape) {
  const size = getNodeSize(getDisplayName(actor), shape);

  return {
    height: size.height,
    width: size.width,
    x: actor.position.x + size.width / 2,
    y: actor.position.y + size.height / 2,
  };
}

function getEllipseBoundaryPoint(
  center: Position,
  width: number,
  height: number,
  angle: number,
) {
  const radiusX = width / 2;
  const radiusY = height / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const scale =
    (radiusX * radiusY) /
    Math.sqrt(radiusY ** 2 * cos ** 2 + radiusX ** 2 * sin ** 2);

  return {
    x: center.x + cos * scale,
    y: center.y + sin * scale,
  };
}

function getRectangleBoundaryPoint(
  center: Position,
  width: number,
  height: number,
  angle: number,
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const scale = Math.min(
    Math.abs(cos) < 0.0001 ? Number.POSITIVE_INFINITY : width / 2 / Math.abs(cos),
    Math.abs(sin) < 0.0001 ? Number.POSITIVE_INFINITY : height / 2 / Math.abs(sin),
  );

  return {
    x: center.x + cos * scale,
    y: center.y + sin * scale,
  };
}

function getPolygonBoundaryPoint(
  center: Position,
  width: number,
  height: number,
  angle: number,
  points: Position[],
) {
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const absolutePoints = points.map((point) => ({
    x: center.x - width / 2 + point.x * width,
    y: center.y - height / 2 + point.y * height,
  }));
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < absolutePoints.length; index += 1) {
    const start = absolutePoints[index];
    const end = absolutePoints[(index + 1) % absolutePoints.length];
    const segment = {
      x: end.x - start.x,
      y: end.y - start.y,
    };
    const denominator = direction.x * segment.y - direction.y * segment.x;

    if (Math.abs(denominator) < 0.0001) {
      continue;
    }

    const relativeStart = {
      x: start.x - center.x,
      y: start.y - center.y,
    };
    const distance =
      (relativeStart.x * segment.y - relativeStart.y * segment.x) / denominator;
    const segmentPosition =
      (relativeStart.x * direction.y - relativeStart.y * direction.x) /
      denominator;

    if (distance >= 0 && segmentPosition >= 0 && segmentPosition <= 1) {
      nearestDistance = Math.min(nearestDistance, distance);
    }
  }

  if (!Number.isFinite(nearestDistance)) {
    return getEllipseBoundaryPoint(center, width, height, angle);
  }

  return {
    x: center.x + direction.x * nearestDistance,
    y: center.y + direction.y * nearestDistance,
  };
}

function getBoundaryPoint({
  angle,
  center,
  shape,
}: {
  angle: number;
  center: Position & { height: number; width: number };
  shape: GroupingShape;
}) {
  if (shape === "square" || shape === "rectangle") {
    return getRectangleBoundaryPoint(center, center.width, center.height, angle);
  }

  if (shape === "star") {
    return getPolygonBoundaryPoint(
      center,
      center.width,
      center.height,
      angle,
      STAR_POINTS,
    );
  }

  if (shape === "hexagon") {
    return getPolygonBoundaryPoint(
      center,
      center.width,
      center.height,
      angle,
      HEXAGON_POINTS,
    );
  }

  return getEllipseBoundaryPoint(center, center.width, center.height, angle);
}

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

function getReadableAngle(start: Position, end: Position) {
  const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;

  if (angle > 90 || angle < -90) {
    return angle + 180;
  }

  return angle;
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
