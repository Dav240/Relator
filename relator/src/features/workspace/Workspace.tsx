import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import type { LoadedRelatorDiagram } from "../file/load";
import { saveDiagram } from "../file/save";
import { AppMenubar } from "../global/Menubar";
import { SaveWindow } from "../global/SaveWindow";
import { ActorPanel } from "./actor-panel/ActorPanel";
import { ACTOR_PANEL_TOGGLE_LEFT_REM } from "./actor-panel/sizing";
import { SlippyMap } from "./diagram/SlippyMap";
import { ACTOR_LIMIT, useWorkspaceDiagram } from "./workspace-state";

function Workspace({
  initialDiagram,
  isDarkMode,
  onDarkModeChange,
  onNew,
  onOpen,
}: {
  initialDiagram: LoadedRelatorDiagram | null;
  isDarkMode: boolean;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onNew: () => void;
  onOpen: () => void;
}) {
  const {
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
  } = useWorkspaceDiagram(initialDiagram);
  const [isActorPanelOpen, setIsActorPanelOpen] = useState(true);
  const [isSaveWindowOpen, setIsSaveWindowOpen] = useState(false);
  const [originalFilePath, setOriginalFilePath] = useState(
    initialDiagram?.originalFilePath ?? "",
  );

  async function saveToPath(path: string) {
    const savedPath = await saveDiagram({
      ...getDiagramData(),
      path,
    });

    setOriginalFilePath(savedPath);
    setIsSaveWindowOpen(false);
  }

  async function saveCurrentDiagram() {
    if (!originalFilePath) {
      setIsSaveWindowOpen(true);
      return;
    }

    try {
      await saveToPath(originalFilePath);
    } catch (error) {
      console.error("Failed to save diagram", error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="relative z-10 flex min-h-8 items-center border-b border-border bg-background px-2">
        <AppMenubar
          isDarkMode={isDarkMode}
          onDarkModeChange={onDarkModeChange}
          onNew={onNew}
          onOpen={onOpen}
          onSave={saveCurrentDiagram}
          onSaveAs={() => setIsSaveWindowOpen(true)}
        />
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
            onUpdateGroupingColour={updateGroupingColour}
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
      <SaveWindow
        isOpen={isSaveWindowOpen}
        onClose={() => setIsSaveWindowOpen(false)}
        onSave={saveToPath}
      />
    </main>
  );
}

export default Workspace;
