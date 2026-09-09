import { Textarea } from "../../../ui/textarea";
import { useContextMenu } from "../context-menu";
import type { RelationshipType, WorkspaceActor } from "../types";

function Relationship({
  actors,
  currentActorId,
  name,
  onDelete,
  onNameChange,
  onTargetChange,
  onTypeChange,
  sourceName,
  targetActorId,
  type,
}: {
  actors: WorkspaceActor[];
  currentActorId: string;
  name: string;
  onDelete: () => void;
  onNameChange: (name: string) => void;
  onTargetChange: (actorId: string) => void;
  onTypeChange: (type: RelationshipType) => void;
  sourceName: string;
  targetActorId: string;
  type: RelationshipType;
}) {
  const { contextMenuPosition, openContextMenu } = useContextMenu();
  const targetActors = actors.filter((actor) => actor.id !== currentActorId);

  return (
    <section
      className="w-full border border-border bg-background"
      onContextMenu={openContextMenu}
    >
      <div className="grid gap-3 p-3">
        <div className="grid gap-2">
          <div className="min-w-0 truncate text-xs font-medium text-muted-foreground">
            Source: <span className="text-foreground">{sourceName}</span>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3">
            <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-xs font-medium">
              <span>Target</span>
              <select
                className="h-8 min-w-0 rounded-sm border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                onChange={(event) => onTargetChange(event.currentTarget.value)}
                value={targetActorId}
              >
                <option disabled value="">
                  Default
                </option>
                {targetActors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name.trim() || actor.defaultName}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-xs font-medium">
              <span>Type</span>
              <select
                className="h-8 min-w-0 rounded-sm border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                onChange={(event) =>
                  onTypeChange(event.currentTarget.value as RelationshipType)
                }
                value={type}
              >
                <option value="directed">Directed</option>
                <option value="undirected">Undirected</option>
              </select>
            </label>
          </div>
        </div>

        <Textarea
          aria-label="Relationship name"
          className="min-h-8 resize-none rounded-sm"
          onChange={(event) => onNameChange(event.currentTarget.value)}
          placeholder="Name"
          value={name}
        />
      </div>

      {contextMenuPosition ? (
        <div
          className="fixed z-50 min-w-28 rounded-sm border border-border bg-popover p-1 text-popover-foreground shadow-md"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
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

export { Relationship };
