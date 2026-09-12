import type { GroupingShape, Position } from "../../types";

type ShapeBoundary = "ellipse" | "polygon" | "rectangle";

type ShapeDefinition = {
  boundary: ShapeBoundary;
  className?: string;
  heightScale: number;
  polygonPoints?: Position[];
  widthScale: number;
};

const STAR_POINTS: Position[] = [
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

const HEXAGON_POINTS: Position[] = [
  { x: 0.25, y: 0.06 },
  { x: 0.75, y: 0.06 },
  { x: 1, y: 0.5 },
  { x: 0.75, y: 0.94 },
  { x: 0.25, y: 0.94 },
  { x: 0, y: 0.5 },
];

const SHAPE_DEFINITIONS: Record<GroupingShape, ShapeDefinition> = {
  circle: {
    boundary: "ellipse",
    className: "rounded-full",
    heightScale: 1,
    widthScale: 1,
  },
  hexagon: {
    boundary: "polygon",
    heightScale: 1,
    polygonPoints: HEXAGON_POINTS,
    widthScale: 1,
  },
  oval: {
    boundary: "ellipse",
    className: "rounded-full",
    heightScale: 0.64,
    widthScale: 1.6,
  },
  rectangle: {
    boundary: "rectangle",
    heightScale: 0.8,
    widthScale: 1.6,
  },
  square: {
    boundary: "rectangle",
    heightScale: 1,
    widthScale: 1,
  },
  star: {
    boundary: "polygon",
    heightScale: 1,
    polygonPoints: STAR_POINTS,
    widthScale: 1,
  },
};

function getNodeBaseSize(label: string) {
  return Math.min(160, Math.max(64, 52 + label.length * 6));
}

function getNodeSize(label: string, shape: GroupingShape = "circle") {
  const baseSize = getNodeBaseSize(label);
  const shapeDefinition = SHAPE_DEFINITIONS[shape];

  return {
    height: baseSize * shapeDefinition.heightScale,
    width: baseSize * shapeDefinition.widthScale,
  };
}

function getPolygonClipPath(points: Position[]) {
  return `polygon(${points
    .map((point) => `${point.x * 100}% ${point.y * 100}%`)
    .join(", ")})`;
}

function getShapeDefinition(shape: GroupingShape) {
  return SHAPE_DEFINITIONS[shape];
}

export { getNodeSize, getPolygonClipPath, getShapeDefinition };
export type { ShapeBoundary, ShapeDefinition };
