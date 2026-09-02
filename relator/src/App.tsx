import { useState } from "react";

import Home from "./features/homepage/Home";
import Workspace from "./features/workspace/Workspace";

type AppView = "home" | "workspace";

function App() {
  const [view, setView] = useState<AppView>("home");
  const [workspaceKey, setWorkspaceKey] = useState(0);

  function createNewWorkspace() {
    setWorkspaceKey((currentKey) => currentKey + 1);
    setView("workspace");
  }

  if (view === "workspace") {
    return <Workspace key={workspaceKey} onNew={createNewWorkspace} />;
  }

  return <Home onNew={createNewWorkspace} />;
}

export default App;
