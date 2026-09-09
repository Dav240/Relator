import { useEffect, useMemo, useRef, useState } from "react";

import { Edge } from "./edges/Edge";
import { Node } from "./Node";
import type {
  EdgeLayout,
  GroupingColour,
  GroupingShape,
  Position,
  WorkspaceActor,
  WorkspaceGrouping,
} from "../types";

type PanState = {
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
};

type MapBounds = {
  height: number;
  width: number;
};

function getMapBounds(actorCount: number): MapBounds {
  const growth = Math.ceil(Math.sqrt(Math.max(actorCount, 1))) * 320;

  return {
    height: 1200 + growth,
    width: 1200 + growth,
  };
}

function clampPan(
  nextPan: Position,
  viewportBounds: MapBounds,
  mapBounds: MapBounds,
) {
  return {
    x: Math.min(0, Math.max(viewportBounds.width - mapBounds.width, nextPan.x)),
    y: Math.min(0, Math.max(viewportBounds.height - mapBounds.height, nextPan.y)),
  };
}

function SlippyMap({
  actors,
  groupings,
  onMoveActor,
  onUpdateRelationshipEdgeLayout,
}: {
  actors: WorkspaceActor[];
  groupings: WorkspaceGrouping[];
  onMoveActor: (actorId: string, position: Position) => void;
  onUpdateRelationshipEdgeLayout: (
    actorId: string,
    relationshipId: string,
    edgeLayout: EdgeLayout,
  ) => void;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const mapBounds = getMapBounds(actors.length);
  const [viewportBounds, setViewportBounds] = useState<MapBounds>({
    height: 0,
    width: 0,
  });
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [panState, setPanState] = useState<PanState | null>(null);
  const actorsById = useMemo(
    () => new Map(actors.map((actor) => [actor.id, actor])),
    [actors],
  );
  const groupingsById = useMemo(
    () => new Map(groupings.map((grouping) => [grouping.id, grouping])),
    [groupings],
  );

  function getActorShape(actor: WorkspaceActor): GroupingShape {
    return actor.groupingId
      ? groupingsById.get(actor.groupingId)?.shape ?? "circle"
      : "circle";
  }

  function getActorColour(actor: WorkspaceActor): GroupingColour {
    return actor.groupingId
      ? groupingsById.get(actor.groupingId)?.colour ?? "light-blue"
      : "light-blue";
  }

  useEffect(() => {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setViewportBounds({
        height: entry.contentRect.height,
        width: entry.contentRect.width,
      });
    });

    observer.observe(viewportElement);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPan((currentPan) => clampPan(currentPan, viewportBounds, mapBounds));
  }, [mapBounds.height, mapBounds.width, viewportBounds.height, viewportBounds.width]);

  function startPanning(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);

    setPanState({
      originX: pan.x,
      originY: pan.y,
      pointerX: event.clientX,
      pointerY: event.clientY,
    });
  }

  function panMap(event: React.PointerEvent<HTMLDivElement>) {
    if (!panState) {
      return;
    }

    setPan(
      clampPan(
        {
          x: panState.originX + event.clientX - panState.pointerX,
          y: panState.originY + event.clientY - panState.pointerY,
        },
        viewportBounds,
        mapBounds,
      ),
    );
  }

  function stopPanning() {
    setPanState(null);
  }

  return (
    <div
      ref={viewportRef}
      className="relative min-w-0 flex-1 cursor-grab overflow-hidden bg-[var(--map-background)] active:cursor-grabbing"
      onPointerCancel={stopPanning}
      onPointerDown={startPanning}
      onPointerMove={panMap}
      onPointerUp={stopPanning}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--map-dot) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          height: mapBounds.height,
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          width: mapBounds.width,
        }}
      >
        <svg
          className="pointer-events-none absolute left-0 top-0 z-30"
          height={mapBounds.height}
          width={mapBounds.width}
        >
          {actors.flatMap((actor) =>
            actor.relationships.map((relationship) => {
              const targetActor = actorsById.get(relationship.targetActorId);

              if (!targetActor) {
                return null;
              }

              return (
                <Edge
                  key={relationship.id}
                  onLayoutChange={(edgeLayout) =>
                    onUpdateRelationshipEdgeLayout(
                      actor.id,
                      relationship.id,
                      edgeLayout,
                    )
                  }
                  relationship={relationship}
                  sourceShape={getActorShape(actor)}
                  sourceActor={actor}
                  targetActor={targetActor}
                  targetShape={getActorShape(targetActor)}
                />
              );
            }),
          )}
        </svg>

        {actors.map((actor) => (
          <Node
            colour={getActorColour(actor)}
            key={actor.id}
            label={actor.name.trim() || actor.defaultName}
            onMove={(position) => onMoveActor(actor.id, position)}
            position={actor.position}
            shape={getActorShape(actor)}
          />
        ))}
      </div>
    </div>
  );
}

export { SlippyMap };
