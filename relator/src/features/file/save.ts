import { invoke } from "@tauri-apps/api/core";

import type { WorkspaceActor, WorkspaceGrouping } from "../workspace/types";

const DEFAULT_SAVE_PATH = "./diagrams/Untitled.relator";
const RELATOR_FILE_VERSION = 1;

type RelatorDiagramData = {
  actors: WorkspaceActor[];
  groupings: WorkspaceGrouping[];
  nextActorNumber: number;
  nextGroupingNumber: number;
};

type RelatorDiagramFile = {
  app: "relator";
  diagram: RelatorDiagramData;
  savedAt: string;
  version: typeof RELATOR_FILE_VERSION;
};

async function saveDiagram({
  actors,
  groupings,
  nextActorNumber,
  nextGroupingNumber,
  path = DEFAULT_SAVE_PATH,
}: RelatorDiagramData & { path?: string }) {
  const file: RelatorDiagramFile = {
    app: "relator",
    diagram: {
      actors,
      groupings,
      nextActorNumber,
      nextGroupingNumber,
    },
    savedAt: new Date().toISOString(),
    version: RELATOR_FILE_VERSION,
  };

  return invoke<string>("save_diagram", {
    contents: JSON.stringify(file, null, 2),
    path,
  });
}

export { DEFAULT_SAVE_PATH, RELATOR_FILE_VERSION, saveDiagram };
export type { RelatorDiagramData, RelatorDiagramFile };
