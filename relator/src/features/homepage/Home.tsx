import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { deleteDiagram } from "../file/delete";
import { DiagramTable, type DiagramFile } from "./DiagramTable";
import { EmptyState } from "./Empty";
import { AppMenubar } from "../global/Menubar";

function Home({
  isDarkMode,
  onDarkModeChange,
  onNew,
  onOpen,
}: {
  isDarkMode: boolean;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onNew: () => void;
  onOpen: (path?: string) => void;
}) {
  const [diagrams, setDiagrams] = useState<DiagramFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDiagrams() {
      try {
        const files = await invoke<DiagramFile[]>("ensure_diagrams_folder");

        if (isMounted) {
          setDiagrams(files);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDiagrams();

    return () => {
      isMounted = false;
    };
  }, []);

  async function deleteSavedDiagram(path: string) {
    try {
      await deleteDiagram(path);
      setDiagrams((currentDiagrams) =>
        currentDiagrams.filter((diagram) => diagram.path !== path),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : String(deleteError),
      );
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
        />
      </header>

      <section className="flex min-h-0 flex-1 bg-muted p-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading diagrams...</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : diagrams.length === 0 ? (
          <EmptyState />
        ) : (
          <DiagramTable
            diagrams={diagrams}
            onDelete={deleteSavedDiagram}
            onOpen={onOpen}
          />
        )}
      </section>
    </main>
  );
}

export default Home;
