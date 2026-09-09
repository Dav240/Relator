import { useRef, useState } from "react";

import type { LoadedRelatorDiagram } from "../file/load";
import { DEFAULT_GROUPING_COLOUR } from "./appearance";
import type {
  EdgeLayout,
  GroupingColour,
  GroupingShape,
  Position,
  RelationshipType,
  WorkspaceActor,
  WorkspaceGrouping,
} from "./types";

const ACTOR_LIMIT = 100;

function createActorPosition(actorCount: number): Position {
  return {
    x: 160 + (actorCount % 4) * 180,
    y: 160 + Math.floor(actorCount / 4) * 150,
  };
}

function createEdgeLayout(
  sourcePosition: Position,
  targetPosition?: Position,
): EdgeLayout {
  if (!targetPosition) {
    return {
      labelOffset: { x: 0, y: -18 },
      sourceAngle: 0,
      targetAngle: Math.PI,
    };
  }

  const sourceAngle = Math.atan2(
    targetPosition.y - sourcePosition.y,
    targetPosition.x - sourcePosition.x,
  );

  return {
    labelOffset: { x: 0, y: -18 },
    sourceAngle,
    targetAngle: sourceAngle + Math.PI,
  };
}

function getNextDefaultNumber(
  items: Array<{ defaultName: string }>,
  prefix: string,
  fallback: number,
) {
  const highestNumber = items.reduce((highest, item) => {
    const match = item.defaultName.match(new RegExp(`^${prefix} (\\d+)$`));

    if (!match) {
      return highest;
    }

    return Math.max(highest, Number(match[1]));
  }, 0);

  return Math.max(fallback, highestNumber + 1);
}

function useWorkspaceDiagram(initialDiagram: LoadedRelatorDiagram | null) {
  const nextActorNumber = useRef(
    initialDiagram
      ? getNextDefaultNumber(
          initialDiagram.actors,
          "Actor",
          initialDiagram.nextActorNumber,
        )
      : 1,
  );
  const nextGroupingNumber = useRef(
    initialDiagram
      ? getNextDefaultNumber(
          initialDiagram.groupings,
          "Grouping",
          initialDiagram.nextGroupingNumber,
        )
      : 1,
  );
  const [actors, setActors] = useState<WorkspaceActor[]>(
    initialDiagram?.actors ?? [],
  );
  const [groupings, setGroupings] = useState<WorkspaceGrouping[]>(
    initialDiagram?.groupings ?? [],
  );

  function addActor() {
    if (actors.length >= ACTOR_LIMIT) {
      return;
    }

    const actorNumber = nextActorNumber.current;
    nextActorNumber.current += 1;
    const defaultName = `Actor ${actorNumber}`;

    setActors((currentActors) => [
      ...currentActors,
      {
        defaultName,
        id: crypto.randomUUID(),
        name: defaultName,
        position: createActorPosition(currentActors.length),
        relationships: [],
      },
    ]);
  }

  function deleteActor(actorId: string) {
    setActors((currentActors) =>
      currentActors
        .filter((actor) => actor.id !== actorId)
        .map((actor) => ({
          ...actor,
          relationships: actor.relationships.filter(
            (relationship) => relationship.targetActorId !== actorId,
          ),
        })),
    );
  }

  function addActorToNewGrouping(actorId: string) {
    const groupingNumber = nextGroupingNumber.current;
    nextGroupingNumber.current += 1;
    const defaultName = `Grouping ${groupingNumber}`;
    const groupingId = crypto.randomUUID();

    setGroupings((currentGroupings) => [
      ...currentGroupings,
      {
        colour: DEFAULT_GROUPING_COLOUR,
        defaultName,
        id: groupingId,
        name: defaultName,
        shape: "circle",
      },
    ]);
    setActors((currentActors) =>
      currentActors.map((actor) =>
        actor.id === actorId ? { ...actor, groupingId } : actor,
      ),
    );
  }

  function moveActorToGrouping(actorId: string, groupingId: string) {
    setActors((currentActors) =>
      currentActors.map((actor) =>
        actor.id === actorId ? { ...actor, groupingId } : actor,
      ),
    );
  }

  function removeActorFromGrouping(actorId: string) {
    setActors((currentActors) =>
      currentActors.map((actor) =>
        actor.id === actorId ? { ...actor, groupingId: undefined } : actor,
      ),
    );
  }

  function deleteGrouping(groupingId: string) {
    setGroupings((currentGroupings) =>
      currentGroupings.filter((grouping) => grouping.id !== groupingId),
    );
    setActors((currentActors) =>
      currentActors.map((actor) =>
        actor.groupingId === groupingId
          ? { ...actor, groupingId: undefined }
          : actor,
      ),
    );
  }

  function renameGrouping(groupingId: string, name: string) {
    setGroupings((currentGroupings) =>
      currentGroupings.map((grouping) =>
        grouping.id === groupingId ? { ...grouping, name } : grouping,
      ),
    );
  }

  function updateGroupingShape(groupingId: string, shape: GroupingShape) {
    setGroupings((currentGroupings) =>
      currentGroupings.map((grouping) =>
        grouping.id === groupingId ? { ...grouping, shape } : grouping,
      ),
    );
  }

  function updateGroupingColour(groupingId: string, colour: GroupingColour) {
    setGroupings((currentGroupings) =>
      currentGroupings.map((grouping) =>
        grouping.id === groupingId ? { ...grouping, colour } : grouping,
      ),
    );
  }

  function renameActor(actorId: string, name: string) {
    setActors((currentActors) =>
      currentActors.map((actor) =>
        actor.id === actorId ? { ...actor, name } : actor,
      ),
    );
  }

  function moveActor(actorId: string, position: Position) {
    setActors((currentActors) =>
      currentActors.map((actor) =>
        actor.id === actorId ? { ...actor, position } : actor,
      ),
    );
  }

  function addRelationship(actorId: string) {
    setActors((currentActors) =>
      currentActors.map((actor) => {
        if (actor.id !== actorId) {
          return actor;
        }

        const firstTargetActor = currentActors.find(
          (currentActor) => currentActor.id !== actorId,
        );

        return {
          ...actor,
          relationships: [
            ...actor.relationships,
            {
              edgeLayout: createEdgeLayout(actor.position, firstTargetActor?.position),
              id: crypto.randomUUID(),
              name: "",
              targetActorId: firstTargetActor?.id ?? "",
              type: "directed",
            },
          ],
        };
      }),
    );
  }

  function deleteRelationship(actorId: string, relationshipId: string) {
    setActors((currentActors) =>
      currentActors.map((actor) =>
        actor.id === actorId
          ? {
              ...actor,
              relationships: actor.relationships.filter(
                (relationship) => relationship.id !== relationshipId,
              ),
            }
          : actor,
      ),
    );
  }

  function updateRelationship(
    actorId: string,
    relationshipId: string,
    updates: Partial<{
      edgeLayout: EdgeLayout;
      name: string;
      targetActorId: string;
      type: RelationshipType;
    }>,
  ) {
    setActors((currentActors) =>
      currentActors.map((actor) =>
        actor.id === actorId
          ? {
              ...actor,
              relationships: actor.relationships.map((relationship) =>
                relationship.id === relationshipId
                  ? { ...relationship, ...updates }
                  : relationship,
              ),
            }
          : actor,
      ),
    );
  }

  function updateRelationshipEdgeLayout(
    actorId: string,
    relationshipId: string,
    edgeLayout: EdgeLayout,
  ) {
    updateRelationship(actorId, relationshipId, { edgeLayout });
  }

  function getDiagramData() {
    return {
      actors,
      groupings,
      nextActorNumber: nextActorNumber.current,
      nextGroupingNumber: nextGroupingNumber.current,
    };
  }

  return {
    actors,
    addActor,
    addActorToNewGrouping,
    addRelationship,
    deleteActor,
    deleteGrouping,
    deleteRelationship,
    getDiagramData,
    groupings,
    moveActor,
    moveActorToGrouping,
    removeActorFromGrouping,
    renameActor,
    renameGrouping,
    updateGroupingColour,
    updateGroupingShape,
    updateRelationship,
    updateRelationshipEdgeLayout,
  };
}

export {
  ACTOR_LIMIT,
  createActorPosition,
  createEdgeLayout,
  getNextDefaultNumber,
  useWorkspaceDiagram,
};
