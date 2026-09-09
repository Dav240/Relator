use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct DiagramFile {
    created_at: Option<u64>,
    modified_at: Option<u64>,
    name: String,
    path: String,
}

#[derive(Deserialize, Serialize)]
struct UserPreferences {
    theme: ThemePreference,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
enum ThemePreference {
    Dark,
    Light,
}

impl Default for UserPreferences {
    fn default() -> Self {
        Self {
            theme: ThemePreference::Light,
        }
    }
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
        let relative_path = path
            .strip_prefix("./diagrams")
            .or_else(|_| path.strip_prefix("diagrams"))
            .unwrap_or(path.as_path());

        diagrams_path().map(|diagrams_path| diagrams_path.join(relative_path))
    }
}

fn ensure_relator_extension(mut path: PathBuf) -> PathBuf {
    if path.extension().and_then(|extension| extension.to_str()) != Some("relator") {
        path.set_extension("relator");
    }

    path
}

fn diagrams_path() -> Result<PathBuf, String> {
    std::env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .map(|local_app_data| local_app_data.join("Relator").join("diagrams"))
        .ok_or_else(|| "LOCALAPPDATA is not available".to_owned())
}

fn relator_path() -> Result<PathBuf, String> {
    std::env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .map(|local_app_data| local_app_data.join("Relator"))
        .ok_or_else(|| "LOCALAPPDATA is not available".to_owned())
}

fn preferences_path() -> Result<PathBuf, String> {
    relator_path().map(|relator_path| relator_path.join("settings.json"))
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
            path: path.to_string_lossy().to_string(),
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

#[tauri::command]
fn delete_diagram(path: String) -> Result<(), String> {
    let path = ensure_relator_extension(resolve_diagram_path(&path)?);

    fs::remove_file(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn load_user_preferences() -> Result<UserPreferences, String> {
    let path = preferences_path()?;

    if !path.exists() {
        return Ok(UserPreferences::default());
    }

    let contents = fs::read_to_string(path).map_err(|error| error.to_string())?;

    Ok(serde_json::from_str(&contents).unwrap_or_default())
}

#[tauri::command]
fn save_user_preferences(preferences: UserPreferences) -> Result<(), String> {
    let relator_path = relator_path()?;
    let path = preferences_path()?;
    let contents = serde_json::to_string_pretty(&preferences)
        .map_err(|error| error.to_string())?;

    fs::create_dir_all(relator_path).map_err(|error| error.to_string())?;
    fs::write(path, contents).map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            delete_diagram,
            diagrams_folder_path,
            ensure_diagrams_folder,
            load_user_preferences,
            load_diagram,
            save_user_preferences,
            save_diagram,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
