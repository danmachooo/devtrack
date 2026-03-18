import { create } from "zustand";

export type ThemeMode = "light" | "dark";
export type ToastTone = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type UiState = {
  isSidebarOpen: boolean;
  themeMode: ThemeMode;
  hasInitializedTheme: boolean;
  toasts: ToastItem[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleThemeMode: () => void;
  initializeTheme: () => void;
  showToast: (toast: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
};

const themeStorageKey = "devtrack.theme";
let toastCounter = 0;

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  themeMode: "light",
  hasInitializedTheme: false,
  toasts: [],
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
  showToast: (toast) => {
    toastCounter += 1;
    const id = `toast-${toastCounter}`;

    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));

    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export { themeStorageKey };
