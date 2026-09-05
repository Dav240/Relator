import { invoke } from "@tauri-apps/api/core";

async function deleteDiagram(path: string) {
  await invoke("delete_diagram", { path });
}

export { deleteDiagram };
