import { writable, get } from "svelte/store"

// Define the theme interface
export interface ThemeSettings {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  errorColor: string
  successColor: string
  warningColor: string

  // Typography
  fontFamily: string
  fontSize: string
  headingFontFamily: string

  // Borders
  borderRadius: string
  borderWidth: string
  borderColor: string

  // Spacing
  inputPadding: string
  buttonPadding: string
  componentSpacing: string

  // Shadows
  boxShadow: string

  // Transitions
  transitionDuration: string
}

// Default theme settings
const defaultTheme: ThemeSettings = {
  // Colors
  primaryColor: "#3b82f6", // Blue
  secondaryColor: "#6b7280", // Gray
  accentColor: "#f97316", // Orange
  textColor: "#111827", // Dark gray
  backgroundColor: "#ffffff", // White
  errorColor: "#ef4444", // Red
  successColor: "#22c55e", // Green
  warningColor: "#f59e0b", // Amber

  // Typography
  fontFamily: "Arial, sans-serif",
  fontSize: "16px",
  headingFontFamily: "Arial, sans-serif",

  // Borders
  borderRadius: "0.375rem", // 6px
  borderWidth: "1px",
  borderColor: "#d1d5db", // Light gray

  // Spacing
  inputPadding: "0.5rem 0.75rem",
  buttonPadding: "0.5rem 1rem",
  componentSpacing: "1rem",

  // Shadows
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",

  // Transitions
  transitionDuration: "150ms",
}

// Create the theme store
const { subscribe, set, update } = writable<ThemeSettings>(defaultTheme)

// Load theme from localStorage if available
function loadTheme() {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("kceva-theme")
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme)
        set({ ...defaultTheme, ...parsedTheme })
      } catch (e) {
        console.error("Failed to parse saved theme:", e)
      }
    }
  }
}

// Save theme to localStorage
function saveTheme() {
  if (typeof window !== "undefined") {
    const currentTheme = get({ subscribe })
    localStorage.setItem("kceva-theme", JSON.stringify(currentTheme))
  }
}

// Update a single theme property
function updateThemeSetting<K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) {
  update((theme) => {
    const updatedTheme = { ...theme, [key]: value }
    return updatedTheme
  })
  saveTheme()
}

// Reset theme to defaults
function resetTheme() {
  set(defaultTheme)
  saveTheme()
}

// Export predefined themes
export const predefinedThemes = {
  default: defaultTheme,
  dark: {
    ...defaultTheme,
    primaryColor: "#3b82f6", // Blue
    secondaryColor: "#9ca3af", // Gray
    accentColor: "#f97316", // Orange
    textColor: "#f3f4f6", // Light gray
    backgroundColor: "#1f2937", // Dark gray
    borderColor: "#4b5563", // Medium gray
  },
  modern: {
    ...defaultTheme,
    primaryColor: "#8b5cf6", // Purple
    secondaryColor: "#6b7280", // Gray
    accentColor: "#ec4899", // Pink
    borderRadius: "0.5rem", // 8px
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    fontFamily: "Inter, sans-serif",
  },
  minimal: {
    ...defaultTheme,
    primaryColor: "#000000", // Black
    secondaryColor: "#6b7280", // Gray
    accentColor: "#ffffff", // White
    borderRadius: "0.125rem", // 2px
    boxShadow: "none",
    borderWidth: "1px",
  },
  playful: {
    ...defaultTheme,
    primaryColor: "#8b5cf6", // Purple
    secondaryColor: "#10b981", // Green
    accentColor: "#f97316", // Orange
    borderRadius: "1rem", // 16px
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    fontFamily: "Comic Sans MS, cursive",
  },
}

// Apply a predefined theme
function applyPredefinedTheme(themeName: keyof typeof predefinedThemes) {
  if (predefinedThemes[themeName]) {
    set(predefinedThemes[themeName])
    saveTheme()
  }
}

// Initialize by loading saved theme
if (typeof window !== "undefined") {
  loadTheme()
}

// Export the store and its methods
export const themeStore = {
  subscribe,
  updateSetting: updateThemeSetting,
  reset: resetTheme,
  applyTheme: applyPredefinedTheme,
  load: loadTheme,
}
