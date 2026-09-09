import { invoke } from "@tauri-apps/api/core";

type ThemeMode = "dark" | "light";

type UserPreferences = {
  theme: ThemeMode;
};

const DEFAULT_THEME: ThemeMode = "light";

function normaliseTheme(theme: unknown): ThemeMode {
  return theme === "dark" ? "dark" : DEFAULT_THEME;
}

async function loadUserPreferences(): Promise<UserPreferences> {
  const preferences = await invoke<UserPreferences>("load_user_preferences");

  return {
    theme: normaliseTheme(preferences.theme),
  };
}

async function saveUserPreferences(preferences: UserPreferences) {
  await invoke("save_user_preferences", { preferences });
}

export {
  DEFAULT_THEME,
  loadUserPreferences,
  normaliseTheme,
  saveUserPreferences,
};
export type { ThemeMode, UserPreferences };
