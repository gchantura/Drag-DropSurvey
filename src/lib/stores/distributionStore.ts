// src/lib/stores/distributionStore.ts
import { derived, get } from "svelte/store"
import { componentsStore } from "$lib/stores/designStore.ts"
import { selectedComponentIds } from "$lib/stores/alignmentStore.ts"
import { updateComponent } from "$lib/stores/designStore.ts"
import type { Distribution } from "$lib/utils/alignment-utils.ts"
import { addHistoryEntry } from "$lib/stores/historyStore.ts"

// Derived store to determine if distribution is possible (need at least 3 components)
export const canDistribute = derived(selectedComponentIds, ($ids) => $ids.length >= 3)

/**
 * Distributes selected components evenly along the specified axis
 * @param distribution - The axis along which to distribute ('horizontal' or 'vertical')
 */
export function distributeSelectedComponents(distribution: Distribution): void {
    const currentSelectedIds = get(selectedComponentIds)
    if (!get(canDistribute)) return

    const allComponents = get(componentsStore)
    const selectedComps = allComponents.filter((c) => currentSelectedIds.includes(c.id))

    if (selectedComps.length < 3) return

    // Store original state for history
    const originalComponents = [...get(componentsStore)]

    if (distribution === "horizontal") {
        // Sort by x position
        const sortedComps = [...selectedComps].sort((a, b) => a.x - b.x)
        const first = sortedComps[0]
        const last = sortedComps[sortedComps.length - 1]

        // Calculate total available space
        const totalSpace = last.x + last.width - first.x
        const totalComponentWidth = sortedComps.reduce((sum, comp) => sum + comp.width, 0)
        const availableSpace = totalSpace - totalComponentWidth

        // Calculate even spacing
        const spacing = availableSpace / (sortedComps.length - 1)

        // Position components with even spacing
        let currentX = first.x
        sortedComps.forEach((comp, index) => {
            if (index === 0) return // Skip first component
            if (index === sortedComps.length - 1) return // Skip last component

            currentX = first.x + first.width + spacing * index
            for (let i = 1; i < index; i++) {
                currentX += sortedComps[i].width
            }

            updateComponent(comp.id, { x: Math.round(currentX) })
        })
    } else {
        // Sort by y position
        const sortedComps = [...selectedComps].sort((a, b) => a.y - b.y)
        const first = sortedComps[0]
        const last = sortedComps[sortedComps.length - 1]

        // Calculate total available space
        const totalSpace = last.y + last.height - first.y
        const totalComponentHeight = sortedComps.reduce((sum, comp) => sum + comp.height, 0)
        const availableSpace = totalSpace - totalComponentHeight

        // Calculate even spacing
        const spacing = availableSpace / (sortedComps.length - 1)

        // Position components with even spacing
        let currentY = first.y
        sortedComps.forEach((comp, index) => {
            if (index === 0) return // Skip first component
            if (index === sortedComps.length - 1) return // Skip last component

            currentY = first.y + first.height + spacing * index
            for (let i = 1; i < index; i++) {
                currentY += sortedComps[i].height
            }

            updateComponent(comp.id, { y: Math.round(currentY) })
        })
    }

    // Add to history
    const updatedComponents = get(componentsStore)
    addHistoryEntry({
        type: "update",
        components: updatedComponents,
        oldValue: originalComponents,
    })
}
