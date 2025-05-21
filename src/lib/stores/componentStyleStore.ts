import { writable, get } from "svelte/store"
import type { ComponentStyleMap, ComponentStyle, InputComponentStyle } from "$lib/types/types"

// Default base style for all components
const defaultComponentStyle: ComponentStyle = {
  backgroundColor: "transparent",
  backgroundOpacity: 1,
  backgroundGradient: false,
  backgroundGradientStart: "#ffffff",
  backgroundGradientEnd: "#f0f0f0",
  backgroundGradientDirection: "to bottom",
  borderRadius: "0.375rem",
  borderWidth: "1px",
  borderColor: "#d1d5db",
  borderStyle: "solid",
  boxShadow: "none",
  fontFamily: "Arial, sans-serif",
  fontSize: "16px",
  fontWeight: "normal",
  color: "#111827",
  textAlign: "left",
  padding: "0.5rem",
  margin: "0",
  opacity: 1,
  transform: "none",
  transition: "all 150ms ease-in-out",
}

// Default styles for specific component types
const defaultInputStyle: InputComponentStyle = {
  ...defaultComponentStyle,
  placeholderColor: "#9ca3af",
  focusBorderColor: "#3b82f6",
  errorColor: "#ef4444",
  labelFontSize: "14px",
  labelFontWeight: "500",
}

// Initial component styles map
const initialComponentStyles: ComponentStyleMap = {
  default: { ...defaultComponentStyle },
  input: { ...defaultInputStyle },
  textarea: { ...defaultInputStyle },
  checkbox: { ...defaultComponentStyle },
  radio: { ...defaultComponentStyle },
  dropdown: { ...defaultInputStyle },
  fileUpload: { ...defaultComponentStyle },
  fileAttachment: { ...defaultComponentStyle },
  text: { ...defaultComponentStyle },
  title: {
    ...defaultComponentStyle,
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    ...defaultComponentStyle,
    fontSize: "20px",
    fontWeight: "600",
    borderColor: "#3b82f6",
    borderWidth: "0 0 2px 0",
    padding: "0.25rem 0 0.5rem 0",
  },
  introduction: { ...defaultComponentStyle },
  matrix: { ...defaultComponentStyle },
  rating: { ...defaultComponentStyle },
}

// Create component style store
function createComponentStyleStore() {
  const { subscribe, set, update } = writable<ComponentStyleMap>(initialComponentStyles)

  function loadStyles() {
    if (typeof window !== "undefined") {
      const savedStyles = localStorage.getItem("kceva-component-styles")
      if (savedStyles) {
        try {
          const parsedStyles = JSON.parse(savedStyles)
          set({ ...initialComponentStyles, ...parsedStyles })
        } catch (e) {
          console.error("Failed to parse saved component styles:", e)
        }
      }
    }
  }

  function saveStyles() {
    if (typeof window !== "undefined") {
      const currentStyles = get({ subscribe })
      localStorage.setItem("kceva-component-styles", JSON.stringify(currentStyles))
    }
  }

  function updateComponentStyle<K extends keyof ComponentStyleMap>(
    componentType: K,
    styleUpdates: Partial<ComponentStyleMap[K]>,
  ) {
    update((styles) => {
      styles[componentType] = { ...styles[componentType], ...styleUpdates }
      return styles
    })
    saveStyles()
  }

  function resetStyles() {
    set(initialComponentStyles)
    saveStyles()
  }

  // Custom themes for component styles
  function saveCustomComponentTheme(name: string) {
    if (typeof window !== "undefined") {
      const currentStyles = get({ subscribe })
      const customThemes = loadCustomComponentThemes()

      // Check if theme with this name already exists
      const existingIndex = customThemes.findIndex((t) => t.name === name)

      if (existingIndex >= 0) {
        // Update existing theme
        customThemes[existingIndex] = { name, styles: currentStyles }
      } else {
        // Add new theme
        customThemes.push({ name, styles: currentStyles })
      }

      localStorage.setItem("kceva-custom-component-themes", JSON.stringify(customThemes))
      return true
    }
    return false
  }

  function loadCustomComponentThemes() {
    if (typeof window !== "undefined") {
      try {
        const themes = localStorage.getItem("kceva-custom-component-themes")
        return themes ? JSON.parse(themes) : []
      } catch (e) {
        console.error("Failed to load custom component themes:", e)
        return []
      }
    }
    return []
  }

  function applyCustomComponentTheme(name: string) {
    const customThemes = loadCustomComponentThemes()
    const theme = customThemes.find((t) => t.name === name)

    if (theme) {
      set({ ...initialComponentStyles, ...theme.styles })
      saveStyles()
      return true
    }
    return false
  }

  function deleteCustomComponentTheme(name: string) {
    if (typeof window !== "undefined") {
      const customThemes = loadCustomComponentThemes()
      const filteredThemes = customThemes.filter((t) => t.name !== name)
      localStorage.setItem("kceva-custom-component-themes", JSON.stringify(filteredThemes))
      return true
    }
    return false
  }

  // Initialize by loading saved styles
  if (typeof window !== "undefined") {
    loadStyles()
  }

  return {
    subscribe,
    updateComponentStyle,
    resetStyles,
    saveCustomTheme: saveCustomComponentTheme,
    loadCustomThemes: loadCustomComponentThemes,
    applyCustomTheme: applyCustomComponentTheme,
    deleteCustomTheme: deleteCustomComponentTheme,
  }
}

export const componentStyleStore = createComponentStyleStore()
