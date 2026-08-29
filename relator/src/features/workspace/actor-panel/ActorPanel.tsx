import { useState } from "react";

import { Actor } from "./Actor";

type ActorRecord = {
  id: number;
};

const ACTOR_LIMIT = 100;

function ActorPanel() {
  const [actors, setActors] = useState<ActorRecord[]>([]);
  const canAddActor = actors.length < ACTOR_LIMIT;

  function addActor() {
    if (!canAddActor) {
      return;
    }

    setActors((currentActors) => [
      ...currentActors,
      {
        id: Date.now(),
      },
    ]);
  }

  function deleteActor(actorId: number) {
    setActors((currentActors) =>
      currentActors.filter((actor) => actor.id !== actorId),
    );
  }

  return (
    <aside className="flex w-[21rem] shrink-0 flex-col border-r border-border bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {actors.map((actor, index) => (
            <Actor
              key={actor.id}
              label={`Actor ${index + 1}`}
              onDelete={() => deleteActor(actor.id)}
            />
          ))}

          <button
            aria-label="Create actor"
            className="mx-auto flex size-10 items-center justify-center rounded-md border border-border bg-background text-xl leading-none hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canAddActor}
            onClick={addActor}
            type="button"
          >
            +
          </button>
        </div>
      </div>
    </aside>
  );
}

export { ActorPanel };
