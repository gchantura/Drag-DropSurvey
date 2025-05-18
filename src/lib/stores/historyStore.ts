// src/lib/stores/historyStore.ts
import { writable, get } from "svelte/store"
import type { SurveyComponent } from "$lib/types/survey.ts"
import { componentsStore } from "./designStore.ts"
import { primarySelectedComponentId } from "./alignmentStore.ts"

// Define history entry types
export type HistoryEntry = {
    type: "add" | "update" | "delete" | "clear" | "import"
    components: SurveyComponent[]
    componentId?: string
    oldValue?: SurveyComponent | SurveyComponent[]
    newValue?: SurveyComponent
}

// Create history stores
export const historyStore = writable<HistoryEntry[]>([])
export const redoStore = writable<HistoryEntry[]>([])
export const canUndo = writable<boolean>(false)
export const canRedo = writable<boolean>(false)

// Initialize history
export function initHistory() {
    historyStore.set([])
    redoStore.set([])
    updateHistoryState()
}

// Add entry to history
export function addHistoryEntry(entry: HistoryEntry) {
    historyStore.update((history) => {
        const newHistory = [...history, entry]
        // Limit history size to prevent memory issues
        if (newHistory.length > 50) {
            newHistory.shift()
        }
        return newHistory
    })

    // Clear redo stack when a new action is performed
    redoStore.set([])

    updateHistoryState()
}

// Undo last action
export function undo() {
    const history = get(historyStore)
    if (history.length === 0) return

    const lastEntry = history[history.length - 1]

    // Add to redo stack
    redoStore.update((redoHistory) => [...redoHistory, lastEntry])

    // Remove from history
    historyStore.update((history) => history.slice(0, -1))

    // Apply the undo operation
    applyUndo(lastEntry)

    updateHistoryState()
}

// Redo last undone action
export function redo() {
    const redoHistory = get(redoStore)
    if (redoHistory.length === 0) return

    const lastRedoEntry = redoHistory[redoHistory.length - 1]

    // Add back to history
    historyStore.update((history) => [...history, lastRedoEntry])

    // Remove from redo stack
    redoStore.update((redoHistory) => redoHistory.slice(0, -1))

    // Apply the redo operation
    applyRedo(lastRedoEntry)

    updateHistoryState()
}

// Apply undo operation based on entry type
function applyUndo(entry: HistoryEntry) {
    switch (entry.type) {
        case "add":
            if (entry.componentId) {
                // Remove the added component
                componentsStore.update((components) => components.filter((c) => c.id !== entry.componentId))

                // Deselect if it was selected
                if (get(primarySelectedComponentId) === entry.componentId) {
                    primarySelectedComponentId.set(null)
                }
            }
            break

        case "update":
            if (entry.componentId && entry.oldValue && !Array.isArray(entry.oldValue)) {
                // Restore the previous state
                componentsStore.update((components) =>
                    components.map((c) => (c.id === entry.componentId ? (entry.oldValue as SurveyComponent) : c)),
                )
            }
            break

        case "delete":
            if (entry.componentId && entry.oldValue && !Array.isArray(entry.oldValue)) {
                // Restore the deleted component
                componentsStore.update((components) => [...components, entry.oldValue as SurveyComponent])
            }
            break

        case "clear":
            if (entry.oldValue && Array.isArray(entry.oldValue)) {
                // Restore all components
                componentsStore.set(entry.oldValue as SurveyComponent[])
            }
            break

        case "import":
            // For import, we'd need to have saved the previous state
            if (entry.oldValue && Array.isArray(entry.oldValue)) {
                componentsStore.set(entry.oldValue as SurveyComponent[])
            } else {
                // If no previous state, just clear
                componentsStore.set([])
            }
            break
    }
}

// Apply redo operation based on entry type
function applyRedo(entry: HistoryEntry) {
    switch (entry.type) {
        case "add":
            if (entry.components) {
                // Re-add the component
                componentsStore.set(entry.components)

                // Select the component
                if (entry.componentId) {
                    primarySelectedComponentId.set(entry.componentId)
                }
            }
            break

        case "update":
            if (entry.components) {
                // Apply the update again
                componentsStore.set(entry.components)
            }
            break

        case "delete":
            if (entry.components) {
                // Delete the component again
                componentsStore.set(entry.components)

                // Deselect if it was selected
                if (entry.componentId && get(primarySelectedComponentId) === entry.componentId) {
                    primarySelectedComponentId.set(null)
                }
            }
            break

        case "clear":
            // Clear all components again
            componentsStore.set([])
            primarySelectedComponentId.set(null)
            break

        case "import":
            if (entry.components) {
                // Re-import the components
                componentsStore.set(entry.components)
            }
            break
    }
}

// Update the can undo/redo state
function updateHistoryState() {
    canUndo.set(get(historyStore).length > 0)
    canRedo.set(get(redoStore).length > 0)
}
