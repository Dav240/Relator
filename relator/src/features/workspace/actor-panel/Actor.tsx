import { useState } from "react";

import { Textarea } from "../../../ui/textarea";
import { useContextMenu } from "../context-menu";
import type {
  RelationshipType,
  WorkspaceActor,
  WorkspaceGrouping,
  WorkspaceRelationship,
} from "../types";
import { Relationship } from "./Relationship";

function Actor({
  actorId,
  actors,
  defaultName,
  groupingId,
  groupings,
  name,
  onAddRelationship,
  onAddToGrouping,
  onAddToNewGrouping,
  onDelete,
  onDeleteRelationship,
  onRename,
  onRenameRelationship,
  onRelationshipTargetChange,
  onRelationshipTypeChange,
  onRemoveFromGrouping,
  relationships,
}: {
  actorId: string;
  actors: WorkspaceActor[];
  defaultName: string;
  groupingId?: string;
  groupings: WorkspaceGrouping[];
  name: string;
  onAddRelationship: () => void;
  onAddToGrouping: (groupingId: string) => void;
  onAddToNewGrouping: () => void;
  onDelete: () => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onRename: (name: string) => void;
  onRenameRelationship: (relationshipId: string, name: string) => void;
  onRelationshipTargetChange: (
    relationshipId: string,
    targetActorId: string,
  ) => void;
  onRelationshipTypeChange: (
    relationshipId: string,
    type: RelationshipType,
  ) => void;
  onRemoveFromGrouping: () => void;
  relationships: WorkspaceRelationship[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGroupingSubmenuOpen, setIsGroupingSubmenuOpen] = useState(false);
  const { closeContextMenu, contextMenuPosition, openContextMenu } =
    useContextMenu({
      onClose: () => setIsGroupingSubmenuOpen(false),
      ownerId: `actor-${actorId}`,
    });
  const displayName = name.trim() || defaultName;
  const hasRelationships = relationships.length > 0;

  return (
    <section
      className="w-full border border-border bg-background"
      onContextMenu={openContextMenu}
    >
      <div className="flex items-start gap-3 p-4">
        {hasRelationships ? (
          <button
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${displayName}`}
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-sm leading-none"
            onClick={() => setIsOpen((currentValue) => !currentValue)}
            type="button"
          >
            <span className={isOpen ? "rotate-90" : ""}>{">"}</span>
          </button>
        ) : null}

        <Textarea
          aria-label="Name"
          className="min-h-8 flex-1 resize-none rounded-sm"
          onBlur={() => {
            if (!name.trim()) {
              onRename(defaultName);
            }
          }}
          onChange={(event) => onRename(event.currentTarget.value)}
          placeholder="Name"
          value={name}
        />
      </div>

      {isOpen && hasRelationships ? (
        <div className="border-t border-border p-3">
          <div className="flex flex-col gap-3">
            {relationships.map((relationship) => (
              <Relationship
                actors={actors}
                currentActorId={actorId}
                key={relationship.id}
                name={relationship.name}
                onDelete={() => onDeleteRelationship(relationship.id)}
                onNameChange={(relationshipName) =>
                  onRenameRelationship(relationship.id, relationshipName)
                }
                onTargetChange={(targetActorId) =>
                  onRelationshipTargetChange(relationship.id, targetActorId)
                }
                onTypeChange={(relationshipType) =>
                  onRelationshipTypeChange(relationship.id, relationshipType)
                }
                targetActorId={relationship.targetActorId}
                type={relationship.type}
                sourceName={displayName}
              />
            ))}

          </div>
        </div>
      ) : null}

      {contextMenuPosition ? (
        <div
          className="fixed z-50 min-w-28 rounded-sm border border-border bg-popover p-1 text-popover-foreground shadow-md"
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
            closeContextMenu();
          }}
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button
            className="flex w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
            onClick={() => {
              onAddRelationship();
              setIsOpen(true);
              closeContextMenu();
            }}
            type="button"
          >
            Add Relationship
          </button>
          <button
            className="flex w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
            onClick={() => {
              onAddToNewGrouping();
              closeContextMenu();
            }}
            type="button"
          >
            Add to New Grouping
          </button>
          <div
            className="relative"
            onMouseEnter={() => setIsGroupingSubmenuOpen(true)}
            onMouseLeave={() => setIsGroupingSubmenuOpen(false)}
          >
            <button
              className="flex w-full items-center justify-between gap-4 rounded-sm px-2 py-1 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              disabled={groupings.length === 0}
              onClick={() =>
                setIsGroupingSubmenuOpen((currentValue) => !currentValue)
              }
              type="button"
            >
              <span>Add to Grouping</span>
              <span>{">"}</span>
            </button>

            {isGroupingSubmenuOpen && groupings.length > 0 ? (
              <div className="absolute left-full top-0 z-50 min-w-36 rounded-sm border border-border bg-popover p-1 text-popover-foreground shadow-md">
                {groupings.map((grouping) => (
                  <button
                    className="flex w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
                    key={grouping.id}
                    onClick={() => {
                      onAddToGrouping(grouping.id);
                      closeContextMenu();
                    }}
                    type="button"
                  >
                    {grouping.name.trim() || grouping.defaultName}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {groupingId ? (
            <button
              className="flex w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
              onClick={() => {
                onRemoveFromGrouping();
                closeContextMenu();
              }}
              type="button"
            >
              Remove from Grouping
            </button>
          ) : null}
          <button
            className="flex w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
            onClick={onDelete}
            type="button"
          >
            Delete
          </button>
        </div>
      ) : null}
    </section>
  );
}

export { Actor };
