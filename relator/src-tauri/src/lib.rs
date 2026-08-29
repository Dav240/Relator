use std::{
    fs,
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

use serde::Serialize;

#[derive(Serialize)]
struct DiagramFile {
    created_at: Option<u64>,
    modified_at: Option<u64>,
    name: String,
}

fn timestamp_millis(time: SystemTime) -> Option<u64> {
    time.duration_since(UNIX_EPOCH)
        .ok()
        .and_then(|duration| duration.as_millis().try_into().ok())
}

fn file_stem(path: &Path) -> Option<String> {
    path.file_stem()
        .and_then(|stem| stem.to_str())
        .map(ToOwned::to_owned)
}

#[tauri::command]
fn ensure_diagrams_folder() -> Result<Vec<DiagramFile>, String> {
    let diagrams_path = std::env::current_dir()
        .map_err(|error| error.to_string())?
        .join("diagrams");

    fs::create_dir_all(&diagrams_path).map_err(|error| error.to_string())?;

    let mut diagrams = Vec::new();

    for entry in fs::read_dir(&diagrams_path).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();

        if path.extension().and_then(|extension| extension.to_str()) != Some("relator") {
            continue;
        }

        let metadata = entry.metadata().map_err(|error| error.to_string())?;
        let Some(name) = file_stem(&path) else {
            continue;
        };

        diagrams.push(DiagramFile {
            created_at: metadata.created().ok().and_then(timestamp_millis),
            modified_at: metadata.modified().ok().and_then(timestamp_millis),
            name,
        });
    }

    diagrams.sort_by(|left, right| right.modified_at.cmp(&left.modified_at));

    Ok(diagrams)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![ensure_diagrams_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
