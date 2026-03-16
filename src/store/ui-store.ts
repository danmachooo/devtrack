import { create } from "zustand";

export type ThemeMode = "light" | "dark";

type UiState = {
  isSidebarOpen: boolean;
  themeMode: ThemeMode;
  hasInitializedTheme: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleThemeMode: () => void;
  initializeTheme: () => void;
};

const themeStorageKey = "devtrack.theme";

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  themeMode: "light",
  hasInitializedTheme: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setThemeMode: (themeMode) => set({ themeMode }),
  toggleThemeMode: () =>
    set((state) => ({
      themeMode: state.themeMode === "dark" ? "light" : "dark",
    })),
  initializeTheme: () => {
    if (typeof window === "undefined") {
      set({ hasInitializedTheme: true });
      return;
    }

    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const themeMode =
      storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : systemPrefersDark
          ? "dark"
          : "light";

    set({
      themeMode,
      hasInitializedTheme: true,
    });
  },
}));

export { themeStorageKey };
