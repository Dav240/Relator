import { useState } from "react";

import Home from "./features/homepage/Home";
import Workspace from "./features/workspace/Workspace";

type AppView = "home" | "workspace";

function App() {
  const [view, setView] = useState<AppView>("home");

  function openWorkspace() {
    setView("workspace");
  }

  if (view === "workspace") {
    return <Workspace onNew={openWorkspace} />;
  }

  return <Home onNew={openWorkspace} />;
}

export default App;
