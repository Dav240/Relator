import { getNodeSize } from "../Node";

import type {
  GroupingShape,
  Position,
  WorkspaceActor,
} from "../../types";

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

function getDisplayName(actor: WorkspaceActor) {
  return actor.name.trim() || actor.defaultName;
}

function getNodeCenter(actor: WorkspaceActor, shape: GroupingShape) {
  const size = getNodeSize(getDisplayName(actor), shape);

  return {
    height: size.height,
    width: size.width,
    x: actor.position.x + size.width / 2,
    y: actor.position.y + size.height / 2,
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

function getReadableAngle(start: Position, end: Position) {
  const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;

  if (angle > 90 || angle < -90) {
    return angle + 180;
  }

  return angle;
}

export {
    getNodeCenter,
    getBoundaryPoint, 
    getReadableAngle,
};