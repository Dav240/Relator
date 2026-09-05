use std::{
    fs,
    path::{Path, PathBuf},
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

fn resolve_diagram_path(path: &str) -> Result<PathBuf, String> {
    if path.trim().is_empty() {
        return Err("Path cannot be empty".to_owned());
    }

    let path = PathBuf::from(path);

    if path.is_absolute() {
        Ok(path)
    } else {
        std::env::current_dir()
            .map_err(|error| error.to_string())
            .map(|current_dir| current_dir.join(path))
    }
}

fn ensure_relator_extension(mut path: PathBuf) -> PathBuf {
    if path.extension().and_then(|extension| extension.to_str()) != Some("relator") {
        path.set_extension("relator");
    }

    path
}

fn diagrams_path() -> Result<PathBuf, String> {
    std::env::current_dir()
        .map_err(|error| error.to_string())
        .map(|current_dir| current_dir.join("diagrams"))
}

#[tauri::command]
fn ensure_diagrams_folder() -> Result<Vec<DiagramFile>, String> {
    let diagrams_path = diagrams_path()?;

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

#[tauri::command]
fn diagrams_folder_path() -> Result<String, String> {
    let diagrams_path = diagrams_path()?;

    fs::create_dir_all(&diagrams_path).map_err(|error| error.to_string())?;

    Ok(diagrams_path.to_string_lossy().to_string())
}

#[tauri::command]
fn save_diagram(path: String, contents: String) -> Result<String, String> {
    let path = ensure_relator_extension(resolve_diagram_path(&path)?);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    fs::write(&path, contents).map_err(|error| error.to_string())?;

    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn load_diagram(path: String) -> Result<String, String> {
    let path = ensure_relator_extension(resolve_diagram_path(&path)?);

    fs::read_to_string(path).map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            diagrams_folder_path,
            ensure_diagrams_folder,
            load_diagram,
            save_diagram,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
