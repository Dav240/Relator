import { useState } from "react";

import { loadDiagramFromPath, loadDiagramFromPicker } from "./features/file/load";
import type { LoadedRelatorDiagram } from "./features/file/load";
import Home from "./features/homepage/Home";
import Workspace from "./features/workspace/Workspace";

type AppView = "home" | "workspace";

function App() {
  const [view, setView] = useState<AppView>("home");
  const [initialDiagram, setInitialDiagram] = useState<LoadedRelatorDiagram | null>(
    null,
  );
  const [workspaceKey, setWorkspaceKey] = useState(0);

  function createNewWorkspace() {
    setInitialDiagram(null);
    setWorkspaceKey((currentKey) => currentKey + 1);
    setView("workspace");
  }

  async function openDiagram(path?: string) {
    try {
      const diagram = path
        ? await loadDiagramFromPath(path)
        : await loadDiagramFromPicker();

      if (!diagram) {
        return;
      }

      setInitialDiagram(diagram);
      setWorkspaceKey((currentKey) => currentKey + 1);
      setView("workspace");
    } catch (error) {
      console.error("Failed to load diagram", error);
    }
  }

  if (view === "workspace") {
    return (
      <Workspace
        key={workspaceKey}
        initialDiagram={initialDiagram}
        onNew={createNewWorkspace}
        onOpen={openDiagram}
      />
    );
  }

  return <Home onNew={createNewWorkspace} onOpen={openDiagram} />;
}

export default App;
