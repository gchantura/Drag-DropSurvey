// src/lib/stores/designStore.ts
import { v4 as uuid } from "uuid"
import { writable, get } from "svelte/store"
import type { ComponentType, SurveyComponent } from "$lib/types/types.ts"
import { addHistoryEntry } from "./historyStore.ts"

export const componentsStore = writable<SurveyComponent[]>([])

// Auto-save functionality
const AUTO_SAVE_DELAY = 2000 // 2 seconds
let autoSaveTimeout: number | undefined
const STORAGE_KEY = "kcevaDesignerData"

// Subscribe to changes and trigger auto-save
componentsStore.subscribe((components) => {
    if (typeof window !== "undefined") {
        clearTimeout(autoSaveTimeout)
        autoSaveTimeout = window.setTimeout(() => {
            saveToLocalStorage(components)
        }, AUTO_SAVE_DELAY)
    }
})

function saveToLocalStorage(components: SurveyComponent[]) {
    if (typeof window !== "undefined" && window.localStorage) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(components))
        } catch (e) {
            console.error("Failed to auto-save:", e)
        }
    }
}

export function loadSurvey() {
    return loadFromLocalStorage()
}

export function loadFromLocalStorage() {
    if (typeof window !== "undefined" && window.localStorage) {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            if (data) {
                const parsed = JSON.parse(data)
                if (Array.isArray(parsed)) {
                    componentsStore.set(parsed)
                    return true
                }
            }
        } catch (e) {
            console.error("Failed to load saved data:", e)
        }
    }
    return false
}

export function addComponent(type: ComponentType) {
    const currentComponents = get(componentsStore)

    const newComponent: SurveyComponent = {
        id: uuid(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
        x: 50,
        y: 50,
        width: type === "section" || type === "title" || type === "introduction" ? 400 : 200,
        height: type === "textarea" || type === "matrix" || type === "section" ? 150 : 100,
        fontSize: 16,
        fontFamily: "Arial",
        color: "#000000",
        bgColor: "#FFFFFF",
        required: false,
        options: type === "checkbox" || type === "radio" || type === "dropdown" ? ["Option 1", "Option 2"] : [],
        description: type === "section" || type === "introduction" ? "Description..." : "",
        src: type === "fileAttachment" ? "" : undefined,
        maxRating: type === "rating" ? 5 : undefined,
        acceptedFileTypes: type === "fileUpload" ? ".pdf,.doc,.docx,.jpg,.png" : undefined,
        maxFileSize: type === "fileUpload" ? 5 : undefined,
        columns: type === "matrix" ? ["Column 1", "Column 2"] : [],
        rows: type === "matrix" ? ["Row 1", "Row 2"] : [],
        startX: 0,
        startY: 0,
        locked: false,
    }

    const newComponents = [...currentComponents, newComponent]
    componentsStore.set(newComponents)

    // Add to history
    addHistoryEntry({
        type: "add",
        components: newComponents,
        componentId: newComponent.id,
    })

    return newComponent.id
}

export function updateComponent(id: string, updates: Partial<SurveyComponent>) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    // Apply updates
    updatedComponents[componentIndex] = {
        ...oldComponent,
        ...updates,
        // Preserve startX and startY if not explicitly updated
        startX: updates.startX !== undefined ? updates.startX : oldComponent.startX,
        startY: updates.startY !== undefined ? updates.startY : oldComponent.startY,
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function deleteComponent(id: string) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const deletedComponent = currentComponents[componentIndex]
    const updatedComponents = currentComponents.filter((c) => c.id !== id)

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "delete",
        components: updatedComponents,
        componentId: id,
        oldValue: deletedComponent,
    })
}

export function duplicateComponent(id: string, positionUpdates: Partial<SurveyComponent> = {}): string {
    const components = get(componentsStore)
    const component = components.find((comp) => comp.id === id)
    if (!component) return ""

    const newId = uuid()
    const newComponent = {
        ...component,
        options: [...(component.options ?? [])],
        columns: [...(component.columns ?? [])],
        rows: [...(component.rows ?? [])],
        id: newId,
        x: (component.x ?? 0) + 20,
        y: (component.y ?? 0) + 20,
        ...positionUpdates,
        startX: 0,
        startY: 0,
    }

    const newComponents = [...components, newComponent]
    componentsStore.set(newComponents)

    // Add to history
    addHistoryEntry({
        type: "add",
        components: newComponents,
        componentId: newId,
    })

    return newId
}

export function addOption(id: string) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (!Array.isArray(component.options)) return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    updatedComponents[componentIndex] = {
        ...component,
        options: [...component.options, `Option ${component.options.length + 1}`],
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function updateOption(id: string, index: number, value: string) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (!Array.isArray(component.options) || index < 0 || index >= component.options.length) return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    const newOptions = [...component.options]
    newOptions[index] = value

    updatedComponents[componentIndex] = {
        ...component,
        options: newOptions,
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function removeOption(id: string, index: number) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (!Array.isArray(component.options) || index < 0 || index >= component.options.length) return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    const newOptions = [...component.options]
    newOptions.splice(index, 1)

    updatedComponents[componentIndex] = {
        ...component,
        options: newOptions,
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

// Matrix-specific functions
export function addRow(id: string) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (component.type !== "matrix" || !Array.isArray(component.rows)) return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    updatedComponents[componentIndex] = {
        ...component,
        rows: [...component.rows, `Row ${component.rows.length + 1}`],
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function updateRow(id: string, index: number, value: string) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (component.type !== "matrix" || !Array.isArray(component.rows) || index < 0 || index >= component.rows.length)
        return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    const newRows = [...component.rows]
    newRows[index] = value

    updatedComponents[componentIndex] = {
        ...component,
        rows: newRows,
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function removeRow(id: string, index: number) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (component.type !== "matrix" || !Array.isArray(component.rows) || index < 0 || index >= component.rows.length)
        return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    const newRows = [...component.rows]
    newRows.splice(index, 1)

    updatedComponents[componentIndex] = {
        ...component,
        rows: newRows,
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function addColumn(id: string) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (component.type !== "matrix" || !Array.isArray(component.columns)) return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    updatedComponents[componentIndex] = {
        ...component,
        columns: [...component.columns, `Column ${component.columns.length + 1}`],
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function updateColumn(id: string, index: number, value: string) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (
        component.type !== "matrix" ||
        !Array.isArray(component.columns) ||
        index < 0 ||
        index >= component.columns.length
    )
        return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    const newColumns = [...component.columns]
    newColumns[index] = value

    updatedComponents[componentIndex] = {
        ...component,
        columns: newColumns,
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function removeColumn(id: string, index: number) {
    const currentComponents = get(componentsStore)
    const componentIndex = currentComponents.findIndex((c) => c.id === id)

    if (componentIndex === -1) return

    const component = currentComponents[componentIndex]
    if (
        component.type !== "matrix" ||
        !Array.isArray(component.columns) ||
        index < 0 ||
        index >= component.columns.length
    )
        return

    const updatedComponents = [...currentComponents]
    const oldComponent = { ...updatedComponents[componentIndex] }

    const newColumns = [...component.columns]
    newColumns.splice(index, 1)

    updatedComponents[componentIndex] = {
        ...component,
        columns: newColumns,
    }

    componentsStore.set(updatedComponents)

    // Add to history
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        componentId: id,
        oldValue: oldComponent,
        newValue: updatedComponents[componentIndex],
    })
}

export function exportDesign() {
    try {
        const components = get(componentsStore)
        const designData = JSON.stringify(components, null, 2)
        const blob = new Blob([designData], { type: "application/json;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `kceva-design-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        return true
    } catch (e) {
        console.error("Failed to export design:", e)
        return false
    }
}

export function importDesign(jsonData: string): boolean {
    try {
        const components = JSON.parse(jsonData)
        if (Array.isArray(components)) {
            componentsStore.set(components)

            // Add to history
            addHistoryEntry({
                type: "import",
                components: components,
            })

            return true
        } else {
            console.error("Import failed: Invalid JSON format (expected an array).")
            return false
        }
    } catch (e) {
        console.error("Failed to import design data:", e)
        return false
    }
}

export function clearDesign() {
    const currentComponents = get(componentsStore)

    componentsStore.set([])

    // Add to history
    addHistoryEntry({
        type: "clear",
        components: [],
        oldValue: currentComponents,
    })
}
