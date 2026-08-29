import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { AppMenubar } from "../global/Menubar";
import { ActorPanel } from "./actor-panel/ActorPanel";

function Workspace({ onNew }: { onNew: () => void }) {
  const [isActorPanelOpen, setIsActorPanelOpen] = useState(true);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="relative z-10 flex min-h-8 items-center border-b border-border bg-background px-2">
        <AppMenubar onNew={onNew} />
      </header>
      <section className="relative flex min-h-0 flex-1 bg-muted">
        <button
          aria-label={isActorPanelOpen ? "Close actor panel" : "Open actor panel"}
          className={`absolute top-2 z-20 flex size-8 items-center justify-center rounded-sm border border-border bg-background text-foreground shadow-sm hover:bg-muted ${
            isActorPanelOpen ? "left-[21.5rem]" : "left-2"
          }`}
          onClick={() => setIsActorPanelOpen((currentValue) => !currentValue)}
          type="button"
        >
          {isActorPanelOpen ? (
            <ChevronLeftIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          )}
        </button>

        {isActorPanelOpen ? <ActorPanel /> : null}
      </section>
    </main>
  );
}

export default Workspace;
