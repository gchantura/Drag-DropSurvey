// src/lib/stores/uiStore.ts
import { writable } from "svelte/store"

// Store for managing UI state like dialogs
export const showShortcutsDialog = writable(false)
