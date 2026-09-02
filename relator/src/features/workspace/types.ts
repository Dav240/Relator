type Position = {
  x: number;
  y: number;
};

type RelationshipType = "directed" | "undirected";
type GroupingShape = "circle" | "oval" | "square" | "rectangle" | "star" | "hexagon";

type EdgeLayout = {
  labelOffset: Position;
  sourceAngle: number;
  targetAngle: number;
};

type WorkspaceGrouping = {
  colour: string;
  defaultName: string;
  id: string;
  name: string;
  shape: GroupingShape;
};

type WorkspaceRelationship = {
  edgeLayout: EdgeLayout;
  id: string;
  name: string;
  targetActorId: string;
  type: RelationshipType;
};

type WorkspaceActor = {
  defaultName: string;
  groupingId?: string;
  id: string;
  name: string;
  position: Position;
  relationships: WorkspaceRelationship[];
};

export type {
  EdgeLayout,
  GroupingShape,
  Position,
  RelationshipType,
  WorkspaceActor,
  WorkspaceGrouping,
  WorkspaceRelationship,
};
