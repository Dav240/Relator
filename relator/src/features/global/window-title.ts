import { invoke } from "@tauri-apps/api/core";

import { getFileName } from "../file/path";

const DEFAULT_WINDOW_TITLE = "Relator";

function getDiagramWindowTitle(path: string) {
  const diagramName = getFileName(path).trim();

  return diagramName ? `${diagramName} - Relator` : DEFAULT_WINDOW_TITLE;
}

async function setDefaultWindowTitle() {
  await setWindowTitle(DEFAULT_WINDOW_TITLE);
}

async function setDiagramWindowTitle(path: string) {
  await setWindowTitle(getDiagramWindowTitle(path));
}

async function setWindowTitle(title: string) {
  document.title = title;
  await invoke("set_window_title", { title });
}

export {
  DEFAULT_WINDOW_TITLE,
  setDefaultWindowTitle,
  setDiagramWindowTitle,
  setWindowTitle,
};
