// src/lib/stores/themeStore.ts
import { writable } from "svelte/store"
import { browser } from "$app/environment"
import { themeStore, type ThemeSettings } from "./themeCustomizerStore.ts"
import { get } from "svelte/store"

function getInitialTheme(): "light" | "dark" {
    if (!browser) {
        return "light"
    }
    const storedTheme = localStorage.getItem("color-theme")
    if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const initialTheme = getInitialTheme()
export const theme = writable<"light" | "dark">(initialTheme)

// Subscribe to theme customizer changes to update CSS variables
if (browser) {
    themeStore.subscribe((settings: ThemeSettings) => {
        // Update CSS variables when theme settings change
        if (settings.darkModeBackgroundColor) {
            document.documentElement.style.setProperty("--color-dark-bg", settings.darkModeBackgroundColor)
        }
        if (settings.darkModeTextColor) {
            document.documentElement.style.setProperty("--color-dark-text", settings.darkModeTextColor)
        }
        if (settings.canvasBackgroundColor) {
            document.documentElement.style.setProperty("--color-light-bg", settings.canvasBackgroundColor)
        }
        if (settings.textColor) {
            document.documentElement.style.setProperty("--color-light-text", settings.textColor)
        }
    })
}

// Update the setTheme function to apply the custom theme colors
export function setTheme(newTheme: "light" | "dark") {
    if (browser) {
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark")

            // Apply custom dark mode colors
            const customTheme = get(themeStore)
            if (customTheme.darkModeBackgroundColor) {
                document.documentElement.style.setProperty("--color-dark-bg", customTheme.darkModeBackgroundColor)
            }
            if (customTheme.darkModeTextColor) {
                document.documentElement.style.setProperty("--color-dark-text", customTheme.darkModeTextColor)
            }
        } else {
            document.documentElement.classList.remove("dark")

            // Apply custom light mode colors
            const customTheme = get(themeStore)
            if (customTheme.canvasBackgroundColor) {
                document.documentElement.style.setProperty("--color-light-bg", customTheme.canvasBackgroundColor)
            }
            if (customTheme.textColor) {
                document.documentElement.style.setProperty("--color-light-text", customTheme.textColor)
            }
        }
        localStorage.setItem("color-theme", newTheme)
    }
    theme.set(newTheme)
}

// Update the toggleTheme function to call setTheme
export function toggleTheme() {
    theme.update((current) => {
        const newTheme = current === "dark" ? "light" : "dark"
        setTheme(newTheme)
        return newTheme
    })
}

// Initialize theme on load
if (browser) {
    setTheme(initialTheme)
}
