import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { DEFAULT_GROUPING_COLOUR } from "../workspace/appearance";
import type { RelatorDiagramData, RelatorDiagramFile } from "./save";
import { DEFAULT_SAVE_PATH } from "./save";

const DEFAULT_LOAD_PATH = DEFAULT_SAVE_PATH;

type LoadedRelatorDiagram = RelatorDiagramData & {
  originalFilePath: string;
};

function normaliseDiagramData(file: RelatorDiagramFile): RelatorDiagramData {
  return {
    actors: file.diagram.actors ?? [],
    groupings: (file.diagram.groupings ?? []).map((grouping) => ({
      ...grouping,
      colour: grouping.colour || DEFAULT_GROUPING_COLOUR,
      shape: grouping.shape || "circle",
    })),
    nextActorNumber: file.diagram.nextActorNumber ?? 1,
    nextGroupingNumber: file.diagram.nextGroupingNumber ?? 1,
  };
}

async function loadDiagram(path = DEFAULT_LOAD_PATH) {
  const contents = await invoke<string>("load_diagram", { path });
  const file = JSON.parse(contents) as RelatorDiagramFile;

  return normaliseDiagramData(file);
}

async function loadDiagramFromPath(path: string): Promise<LoadedRelatorDiagram> {
  const diagram = await loadDiagram(path);

  return {
    ...diagram,
    originalFilePath: path,
  };
}

async function loadDiagramFromPicker() {
  const diagramsPath = await invoke<string>("diagrams_folder_path");
  const selectedPath = await open({
    defaultPath: diagramsPath,
    directory: false,
    filters: [{ name: "Relator diagrams", extensions: ["relator"] }],
    multiple: false,
  });

  if (!selectedPath || Array.isArray(selectedPath)) {
    return null;
  }

  return loadDiagramFromPath(selectedPath);
}

export { DEFAULT_LOAD_PATH, loadDiagram, loadDiagramFromPath, loadDiagramFromPicker };
export type { LoadedRelatorDiagram };
