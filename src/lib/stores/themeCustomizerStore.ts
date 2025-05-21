import { writable, get } from "svelte/store"

// Define the theme interface with expanded properties
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
  infoColor: string
  borderColor: string

  // New global colors
  canvasBackgroundColor: string
  darkModeBackgroundColor: string
  darkModeTextColor: string

  // Gradient colors
  primaryGradientStart: string
  primaryGradientEnd: string
  primaryGradientDirection: string
  backgroundGradientStart: string
  backgroundGradientEnd: string
  backgroundGradientDirection: string

  // Opacity settings
  primaryOpacity: number
  backgroundOpacity: number

  // Typography
  fontFamily: string
  fontSize: string
  headingFontFamily: string
  headingFontSize: string
  lineHeight: string
  fontWeight: string
  letterSpacing: string

  // Borders
  borderRadius: string
  borderWidth: string

  // Spacing
  inputPadding: string
  buttonPadding: string
  componentSpacing: string
  containerPadding: string

  // Shadows
  boxShadow: string
  hoverBoxShadow: string

  // Transitions
  transitionDuration: string
  transitionTimingFunction: string
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
  infoColor: "#3b82f6", // Blue
  borderColor: "#d1d5db", // Light gray

  // New global colors
  canvasBackgroundColor: "#ffffff", // White
  darkModeBackgroundColor: "#1f2937", // Dark gray
  darkModeTextColor: "#f3f4f6", // Light gray

  // Gradient colors
  primaryGradientStart: "#3b82f6", // Blue
  primaryGradientEnd: "#2563eb", // Darker blue
  primaryGradientDirection: "to right",
  backgroundGradientStart: "#ffffff", // White
  backgroundGradientEnd: "#f9fafb", // Light gray
  backgroundGradientDirection: "to bottom",

  // Opacity settings
  primaryOpacity: 1,
  backgroundOpacity: 1,

  // Typography
  fontFamily: "Arial, sans-serif",
  fontSize: "16px",
  headingFontFamily: "Arial, sans-serif",
  headingFontSize: "24px",
  lineHeight: "1.5",
  fontWeight: "normal",
  letterSpacing: "normal",

  // Borders
  borderRadius: "0.375rem", // 6px
  borderWidth: "1px",

  // Spacing
  inputPadding: "0.5rem 0.75rem",
  buttonPadding: "0.5rem 1rem",
  componentSpacing: "1rem",
  containerPadding: "1.5rem",

  // Shadows
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  hoverBoxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",

  // Transitions
  transitionDuration: "150ms",
  transitionTimingFunction: "ease-in-out",
}

// Create the theme store
const createThemeStore = () => {
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

  // Apply a custom theme
  function applyCustomTheme(customTheme: ThemeSettings) {
    set({ ...defaultTheme, ...customTheme })
    saveTheme()
  }

  // Initialize by loading saved theme
  if (typeof window !== "undefined") {
    loadTheme()
  }

  return {
    subscribe,
    updateSetting: updateThemeSetting,
    reset: resetTheme,
    applyTheme: (themeName: keyof typeof predefinedThemes) => {
      if (predefinedThemes[themeName]) {
        set(predefinedThemes[themeName])
        saveTheme()
      }
    },
    applyCustomTheme,
    load: loadTheme,
  }
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
    canvasBackgroundColor: "#1f2937", // Dark gray
    darkModeBackgroundColor: "#111827", // Darker gray
    darkModeTextColor: "#f9fafb", // Lighter gray
    primaryGradientStart: "#3b82f6", // Blue
    primaryGradientEnd: "#1d4ed8", // Darker blue
    backgroundGradientStart: "#1f2937", // Dark gray
    backgroundGradientEnd: "#111827", // Darker gray
  },
  modern: {
    ...defaultTheme,
    primaryColor: "#8b5cf6", // Purple
    secondaryColor: "#6b7280", // Gray
    accentColor: "#ec4899", // Pink
    borderRadius: "0.5rem", // 8px
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    fontFamily: "Inter, sans-serif",
    headingFontFamily: "Inter, sans-serif",
    canvasBackgroundColor: "#f9fafb", // Light gray
    darkModeBackgroundColor: "#1e1e2e", // Dark blue-gray
    darkModeTextColor: "#e2e8f0", // Light blue-gray
    primaryGradientStart: "#8b5cf6", // Purple
    primaryGradientEnd: "#6d28d9", // Darker purple
  },
  minimal: {
    ...defaultTheme,
    primaryColor: "#000000", // Black
    secondaryColor: "#6b7280", // Gray
    accentColor: "#ffffff", // White
    borderRadius: "0.125rem", // 2px
    boxShadow: "none",
    borderWidth: "1px",
    canvasBackgroundColor: "#ffffff", // White
    darkModeBackgroundColor: "#121212", // Very dark gray
    darkModeTextColor: "#e5e5e5", // Light gray
    primaryGradientStart: "#000000", // Black
    primaryGradientEnd: "#000000", // Black
  },
  playful: {
    ...defaultTheme,
    primaryColor: "#8b5cf6", // Purple
    secondaryColor: "#10b981", // Green
    accentColor: "#f97316", // Orange
    borderRadius: "1rem", // 16px
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    fontFamily: "Comic Sans MS, cursive",
    headingFontFamily: "Comic Sans MS, cursive",
    canvasBackgroundColor: "#f0f9ff", // Light blue
    darkModeBackgroundColor: "#1e293b", // Dark slate
    darkModeTextColor: "#f8fafc", // Light slate
    primaryGradientStart: "#8b5cf6", // Purple
    primaryGradientEnd: "#ec4899", // Pink
    primaryGradientDirection: "to right",
  },
}

// Custom theme management
export function saveCustomTheme(name: string, settings: ThemeSettings) {
  if (typeof window !== "undefined") {
    const customThemes = loadCustomThemes()

    // Check if theme with this name already exists
    const existingIndex = customThemes.findIndex((t) => t.name === name)

    if (existingIndex >= 0) {
      // Update existing theme
      customThemes[existingIndex] = { name, settings }
    } else {
      // Add new theme
      customThemes.push({ name, settings })
    }

    localStorage.setItem("kceva-custom-themes", JSON.stringify(customThemes))
  }
}

export function loadCustomThemes() {
  if (typeof window !== "undefined") {
    try {
      const themes = localStorage.getItem("kceva-custom-themes")
      return themes ? JSON.parse(themes) : []
    } catch (e) {
      console.error("Failed to load custom themes:", e)
      return []
    }
  }
  return []
}

export function deleteCustomTheme(name: string) {
  if (typeof window !== "undefined") {
    const customThemes = loadCustomThemes()
    const filteredThemes = customThemes.filter((t) => t.name !== name)
    localStorage.setItem("kceva-custom-themes", JSON.stringify(filteredThemes))
  }
}

// Export the theme store
export const themeStore = createThemeStore()
