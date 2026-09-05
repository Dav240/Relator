import { useState } from "react";

import { loadDiagramFromPicker } from "./features/file/load";
import type { RelatorDiagramData } from "./features/file/save";
import Home from "./features/homepage/Home";
import Workspace from "./features/workspace/Workspace";

type AppView = "home" | "workspace";

function App() {
  const [view, setView] = useState<AppView>("home");
  const [initialDiagram, setInitialDiagram] = useState<RelatorDiagramData | null>(null);
  const [workspaceKey, setWorkspaceKey] = useState(0);

  function createNewWorkspace() {
    setInitialDiagram(null);
    setWorkspaceKey((currentKey) => currentKey + 1);
    setView("workspace");
  }

  async function openDiagram() {
    try {
      const diagram = await loadDiagramFromPicker();

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
