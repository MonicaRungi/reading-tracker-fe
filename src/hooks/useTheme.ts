import { useCallback, useEffect, useState } from "react"

export type ThemePreference = "light" | "dark" | "auto"

const STORAGE_KEY = "rt.theme"

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement
  const isDark =
    preference === "dark" ||
    (preference === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  root.classList.toggle("dark", isDark)
}

function readStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto"
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference)

  useEffect(() => {
    applyTheme(preference)

    if (preference !== "auto") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = () => applyTheme("auto")
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [preference])

  const setTheme = useCallback((next: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, next)
    setPreference(next)
  }, [])

  return { theme: preference, setTheme }
}
