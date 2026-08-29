import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { DiagramTable, type DiagramFile } from "./DiagramTable";
import { EmptyState } from "./Empty";
import { AppMenubar } from "../global/Menubar";

function Home({ onNew }: { onNew: () => void }) {
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

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="relative z-10 flex min-h-8 items-center border-b border-border bg-background px-2">
        <AppMenubar onNew={onNew} />
      </header>

      <section className="flex min-h-0 flex-1 bg-muted p-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading diagrams...</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : diagrams.length === 0 ? (
          <EmptyState />
        ) : (
          <DiagramTable diagrams={diagrams} />
        )}
      </section>
    </main>
  );
}

export default Home;
