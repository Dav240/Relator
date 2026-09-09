import { useMemo } from "react";

import { Actor } from "./Actor";
import { Grouping } from "./Grouping";
import {
  ACTOR_PANEL_ORIGINAL_WIDTH_REM,
  ACTOR_PANEL_SCALE,
  ACTOR_PANEL_WIDTH_REM,
} from "./sizing";
import { useContextMenu } from "../context-menu";
import type {
  GroupingColour,
  GroupingShape,
  RelationshipType,
  WorkspaceActor,
  WorkspaceGrouping,
} from "../types";

function ActorPanel({
  actorLimit,
  actors,
  groupings,
  onAddActor,
  onAddActorToGrouping,
  onAddActorToNewGrouping,
  onAddRelationship,
  onDeleteActor,
  onDeleteGrouping,
  onDeleteRelationship,
  onRenameActor,
  onRenameGrouping,
  onRenameRelationship,
  onRelationshipTargetChange,
  onRelationshipTypeChange,
  onRemoveActorFromGrouping,
  onUpdateGroupingColour,
  onUpdateGroupingShape,
}: {
  actorLimit: number;
  actors: WorkspaceActor[];
  groupings: WorkspaceGrouping[];
  onAddActor: () => void;
  onAddActorToGrouping: (actorId: string, groupingId: string) => void;
  onAddActorToNewGrouping: (actorId: string) => void;
  onAddRelationship: (actorId: string) => void;
  onDeleteActor: (actorId: string) => void;
  onDeleteGrouping: (groupingId: string) => void;
  onDeleteRelationship: (actorId: string, relationshipId: string) => void;
  onRenameActor: (actorId: string, name: string) => void;
  onRenameGrouping: (groupingId: string, name: string) => void;
  onRenameRelationship: (
    actorId: string,
    relationshipId: string,
    name: string,
  ) => void;
  onRelationshipTargetChange: (
    actorId: string,
    relationshipId: string,
    targetActorId: string,
  ) => void;
  onRelationshipTypeChange: (
    actorId: string,
    relationshipId: string,
    type: RelationshipType,
  ) => void;
  onRemoveActorFromGrouping: (actorId: string) => void;
  onUpdateGroupingColour: (groupingId: string, colour: GroupingColour) => void;
  onUpdateGroupingShape: (groupingId: string, shape: GroupingShape) => void;
}) {
  const canAddActor = actors.length < actorLimit;
  const actorsByGroupingId = useMemo(() => {
    const nextActorsByGroupingId = new Map<string, WorkspaceActor[]>();

    for (const actor of actors) {
      const groupingId = actor.groupingId ?? "";
      const groupedActors = nextActorsByGroupingId.get(groupingId) ?? [];

      groupedActors.push(actor);
      nextActorsByGroupingId.set(groupingId, groupedActors);
    }

    return nextActorsByGroupingId;
  }, [actors]);
  const ungroupedActors = actorsByGroupingId.get("") ?? [];
  const { closeContextMenu, contextMenuPosition, openContextMenu } =
    useContextMenu({ ownerId: "actor-panel" });

  function renderActor(actor: WorkspaceActor) {
    return (
      <Actor
        actorId={actor.id}
        actors={actors}
        defaultName={actor.defaultName}
        groupings={groupings}
        groupingId={actor.groupingId}
        key={actor.id}
        name={actor.name}
        onAddRelationship={() => onAddRelationship(actor.id)}
        onAddToGrouping={(groupingId) =>
          onAddActorToGrouping(actor.id, groupingId)
        }
        onAddToNewGrouping={() => onAddActorToNewGrouping(actor.id)}
        onDelete={() => onDeleteActor(actor.id)}
        onDeleteRelationship={(relationshipId) =>
          onDeleteRelationship(actor.id, relationshipId)
        }
        onRename={(name) => onRenameActor(actor.id, name)}
        onRenameRelationship={(relationshipId, name) =>
          onRenameRelationship(actor.id, relationshipId, name)
        }
        onRelationshipTargetChange={(relationshipId, targetActorId) =>
          onRelationshipTargetChange(actor.id, relationshipId, targetActorId)
        }
        onRelationshipTypeChange={(relationshipId, type) =>
          onRelationshipTypeChange(actor.id, relationshipId, type)
        }
        onRemoveFromGrouping={() => onRemoveActorFromGrouping(actor.id)}
        relationships={actor.relationships}
      />
    );
  }

  return (
    <aside
      className="flex shrink-0 flex-col border-r border-border bg-background"
      onContextMenu={openContextMenu}
      style={{ width: `${ACTOR_PANEL_WIDTH_REM}rem` }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className="flex flex-col gap-4 p-4"
          style={{
            width: `${ACTOR_PANEL_ORIGINAL_WIDTH_REM}rem`,
            zoom: ACTOR_PANEL_SCALE,
          }}
        >
          {groupings.map((grouping) => (
            <Grouping
              colour={grouping.colour}
              defaultName={grouping.defaultName}
              key={grouping.id}
              name={grouping.name}
              onColourChange={(colour) =>
                onUpdateGroupingColour(grouping.id, colour)
              }
              onDelete={() => onDeleteGrouping(grouping.id)}
              onRename={(name) => onRenameGrouping(grouping.id, name)}
              onShapeChange={(shape) => onUpdateGroupingShape(grouping.id, shape)}
              shape={grouping.shape}
            >
              {(actorsByGroupingId.get(grouping.id) ?? []).map((actor) =>
                renderActor(actor),
              )}
            </Grouping>
          ))}

          {ungroupedActors.map((actor) => renderActor(actor))}

        </div>
      </div>

      {contextMenuPosition ? (
        <div
          className="fixed z-50 min-w-32 rounded-sm border border-border bg-popover p-1 text-popover-foreground shadow-md"
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
            closeContextMenu();
          }}
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zoom: ACTOR_PANEL_SCALE,
          }}
        >
          <button
            className="flex w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canAddActor}
            onClick={() => {
              onAddActor();
              closeContextMenu();
            }}
            type="button"
          >
            Add Actor
          </button>
        </div>
      ) : null}
    </aside>
  );
}

export { ActorPanel };
