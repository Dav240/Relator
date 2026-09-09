import { useEffect, useState } from "react";

import { loadDiagramFromPath, loadDiagramFromPicker } from "./features/file/load";
import type { LoadedRelatorDiagram } from "./features/file/load";
import Home from "./features/homepage/Home";
import {
  DEFAULT_THEME,
  loadUserPreferences,
  saveUserPreferences,
} from "./features/global/theme";
import type { ThemeMode } from "./features/global/theme";
import Workspace from "./features/workspace/Workspace";

type AppView = "home" | "workspace";

function App() {
  const [view, setView] = useState<AppView>("home");
  const [initialDiagram, setInitialDiagram] = useState<LoadedRelatorDiagram | null>(
    null,
  );
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [workspaceKey, setWorkspaceKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadThemePreference() {
      try {
        const preferences = await loadUserPreferences();

        if (isMounted) {
          setTheme(preferences.theme);
        }
      } catch (error) {
        console.error("Failed to load user preferences", error);
      }
    }

    loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function updateTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    saveUserPreferences({ theme: nextTheme }).catch((error) => {
      console.error("Failed to save user preferences", error);
    });
  }

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
        isDarkMode={theme === "dark"}
        onDarkModeChange={(isDarkMode) =>
          updateTheme(isDarkMode ? "dark" : "light")
        }
        onNew={createNewWorkspace}
        onOpen={openDiagram}
      />
    );
  }

  return (
    <Home
      isDarkMode={theme === "dark"}
      onDarkModeChange={(isDarkMode) =>
        updateTheme(isDarkMode ? "dark" : "light")
      }
      onNew={createNewWorkspace}
      onOpen={openDiagram}
    />
  );
}

export default App;
