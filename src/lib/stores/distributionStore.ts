// src/lib/stores/distributionStore.ts
import { derived, get } from "svelte/store"
import { selectedComponentIds } from "./alignmentStore.ts"
import { componentsStore, updateComponent } from "./designStore.ts"
import type { SurveyComponent } from "$lib/types/types.ts"

export type Distribution = "horizontal" | "vertical"

// Derived store to determine if distribution is possible (need 3+ components)
export const canDistribute = derived(selectedComponentIds, ($ids) => $ids.length >= 3)

// Function to distribute selected components
export function distributeSelectedComponents(distribution: Distribution): void {
    const currentSelectedIds = get(selectedComponentIds)
    if (!get(canDistribute)) return

    const allComponents = get(componentsStore)
    const selectedComps = allComponents.filter((c) => currentSelectedIds.includes(c.id))

    if (selectedComps.length < 3) return

    if (distribution === "horizontal") {
        distributeHorizontally(selectedComps)
    } else {
        distributeVertically(selectedComps)
    }
}

// Helper function to distribute components horizontally
function distributeHorizontally(components: SurveyComponent[]): void {
    // Sort components by x position
    const sortedComps = [...components].sort((a, b) => a.x - b.x)

    // Find leftmost and rightmost components
    const leftmost = sortedComps[0]
    const rightmost = sortedComps[sortedComps.length - 1]

    // Calculate total available space
    const totalSpace = rightmost.x + rightmost.width - leftmost.x

    // Calculate space between each component
    const spaceBetween = totalSpace / (sortedComps.length - 1)

    // Skip first component (leftmost) as it stays in place
    for (let i = 1; i < sortedComps.length - 1; i++) {
        const comp = sortedComps[i]
        const newX = leftmost.x + spaceBetween * i - comp.width / 2

        updateComponent(comp.id, { x: Math.round(newX) })
    }
}

// Helper function to distribute components vertically
function distributeVertically(components: SurveyComponent[]): void {
    // Sort components by y position
    const sortedComps = [...components].sort((a, b) => a.y - b.y)

    // Find topmost and bottommost components
    const topmost = sortedComps[0]
    const bottommost = sortedComps[sortedComps.length - 1]

    // Calculate total available space
    const totalSpace = bottommost.y + bottommost.height - topmost.y

    // Calculate space between each component
    const spaceBetween = totalSpace / (sortedComps.length - 1)

    // Skip first component (topmost) as it stays in place
    for (let i = 1; i < sortedComps.length - 1; i++) {
        const comp = sortedComps[i]
        const newY = topmost.y + spaceBetween * i - comp.height / 2

        updateComponent(comp.id, { y: Math.round(newY) })
    }
}
