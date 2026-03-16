"use client";

import { useEffect } from "react";

import { themeStorageKey, useUiStore } from "@/store/ui-store";

export function ThemeController() {
  const themeMode = useUiStore((state) => state.themeMode);
  const hasInitializedTheme = useUiStore((state) => state.hasInitializedTheme);
  const initializeTheme = useUiStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    if (!hasInitializedTheme) {
      return;
    }

    document.documentElement.classList.toggle("dark", themeMode === "dark");
    window.localStorage.setItem(themeStorageKey, themeMode);
  }, [hasInitializedTheme, themeMode]);

  return null;
}
