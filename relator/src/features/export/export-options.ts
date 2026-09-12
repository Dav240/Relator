import { invoke } from "@tauri-apps/api/core";
import { downloadDir, pictureDir } from "@tauri-apps/api/path";

import type { ExportFormat, ExportMode } from "./export";

const EXPORT_FORMATS_BY_MODE: Record<ExportMode, ExportFormat[]> = {
  image: ["png", "jpeg", "svg", "webp"],
  pdf: ["pdf"],
};

const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  jpeg: ".jpeg",
  pdf: ".pdf",
  png: ".png",
  svg: ".svg",
  webp: ".webp",
};

function getDefaultExportFormat(mode: ExportMode) {
  return EXPORT_FORMATS_BY_MODE[mode][0];
}

async function getDefaultExportPath(mode: ExportMode) {
  try {
    return mode === "image" ? await pictureDir() : await downloadDir();
  } catch {
    return invoke<string>("diagrams_folder_path");
  }
}

export {
  EXPORT_FORMAT_LABELS,
  EXPORT_FORMATS_BY_MODE,
  getDefaultExportFormat,
  getDefaultExportPath,
};
