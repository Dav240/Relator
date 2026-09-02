import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRef, useState } from "react";

import { AppMenubar } from "../global/Menubar";
import { ActorPanel } from "./actor-panel/ActorPanel";
import { ACTOR_PANEL_TOGGLE_LEFT_REM } from "./actor-panel/sizing";
import { SlippyMap } from "./diagram/SlippyMap";
import type {
  EdgeLayout,
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

function createEdgeLayout(sourcePosition: Position, targetPosition?: Position): EdgeLayout {
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

function Workspace({ onNew }: { onNew: () => void }) {
  const nextActorNumber = useRef(1);
  const nextGroupingNumber = useRef(1);
  const [isActorPanelOpen, setIsActorPanelOpen] = useState(true);
  const [actors, setActors] = useState<WorkspaceActor[]>([]);
  const [groupings, setGroupings] = useState<WorkspaceGrouping[]>([]);

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
      currentActors.filter((actor) => actor.id !== actorId),
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
        colour: "",
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

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="relative z-10 flex min-h-8 items-center border-b border-border bg-background px-2">
        <AppMenubar onNew={onNew} />
      </header>
      <section className="relative flex min-h-0 flex-1 bg-muted">
        <button
          aria-label={isActorPanelOpen ? "Close actor panel" : "Open actor panel"}
          className="absolute top-2 z-20 flex size-8 items-center justify-center rounded-sm border border-border bg-background text-foreground shadow-sm hover:bg-muted"
          onClick={() => setIsActorPanelOpen((currentValue) => !currentValue)}
          style={{
            left: isActorPanelOpen ? `${ACTOR_PANEL_TOGGLE_LEFT_REM}rem` : "0.5rem",
          }}
          type="button"
        >
          {isActorPanelOpen ? (
            <ChevronLeftIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          )}
        </button>

        {isActorPanelOpen ? (
          <ActorPanel
            actorLimit={ACTOR_LIMIT}
            actors={actors}
            groupings={groupings}
            onAddActor={addActor}
            onAddActorToGrouping={moveActorToGrouping}
            onAddActorToNewGrouping={addActorToNewGrouping}
            onAddRelationship={addRelationship}
            onDeleteActor={deleteActor}
            onDeleteGrouping={deleteGrouping}
            onDeleteRelationship={deleteRelationship}
            onRenameActor={renameActor}
            onRenameGrouping={renameGrouping}
            onRemoveActorFromGrouping={removeActorFromGrouping}
            onUpdateGroupingShape={updateGroupingShape}
            onRenameRelationship={(actorId, relationshipId, name) =>
              updateRelationship(actorId, relationshipId, { name })
            }
            onRelationshipTargetChange={(actorId, relationshipId, targetActorId) =>
              updateRelationship(actorId, relationshipId, { targetActorId })
            }
            onRelationshipTypeChange={(actorId, relationshipId, type) =>
              updateRelationship(actorId, relationshipId, { type })
            }
          />
        ) : null}

        <SlippyMap
          actors={actors}
          groupings={groupings}
          onMoveActor={moveActor}
          onUpdateRelationshipEdgeLayout={updateRelationshipEdgeLayout}
        />
      </section>
    </main>
  );
}

export default Workspace;
