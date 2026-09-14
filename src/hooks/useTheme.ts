import { useCallback, useEffect, useState } from "react"
import type { ThemePreference } from "@/api/profile"

const STORAGE_KEY = "rt.theme"

function syncThemeColorMeta() {
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta && accent) meta.setAttribute("content", accent)
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement
  const isDark =
    preference === "dark" ||
    (preference === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  root.classList.toggle("dark", isDark)
  syncThemeColorMeta()
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
