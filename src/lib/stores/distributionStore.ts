import { get, writable } from "svelte/store"
import { selectedComponentIds } from "$lib/stores/alignmentStore.ts"
import { componentsStore } from "$lib/stores/surveyStore.ts"
import { updateComponent } from "$lib/stores/surveyStore.ts"

// Create a store to track if distribution is possible
export const canDistribute = writable(false)

// Function to check if distribution is possible
export function updateCanDistribute(): void {
    const currentSelectedIds = get(selectedComponentIds)
    canDistribute.set(currentSelectedIds && currentSelectedIds.length > 2)
}

// Function to distribute selected components evenly
export function distributeSelectedComponents(direction: "horizontal" | "vertical"): void {
    const currentSelectedIds = get(selectedComponentIds)
    if (!currentSelectedIds || currentSelectedIds.length <= 2) return

    const allComponents = get(componentsStore)
    if (!allComponents) return

    const selectedComps = allComponents.filter((c) => currentSelectedIds.includes(c.id))

    if (direction === "vertical") {
        // Sort components by their vertical position
        const sortedByY = [...selectedComps].sort((a, b) => a.y - b.y)

        // Calculate total height and gaps
        const totalHeight = sortedByY.reduce((sum, comp) => sum + comp.height, 0)
        const firstY = sortedByY[0].y
        const lastY = sortedByY[sortedByY.length - 1].y + sortedByY[sortedByY.length - 1].height
        const availableSpace = lastY - firstY - totalHeight
        const gap = availableSpace / (sortedByY.length - 1)

        // Apply even spacing
        let currentY = firstY
        sortedByY.forEach((comp, index) => {
            if (index === 0) {
                // Keep the first component in place
                currentY += comp.height
            } else if (index === sortedByY.length - 1) {
                // Keep the last component in place
            } else {
                // Position middle components with even spacing
                updateComponent(comp.id, { y: currentY + gap })
                currentY += gap + comp.height
            }
        })
    } else {
        // Sort components by their horizontal position
        const sortedByX = [...selectedComps].sort((a, b) => a.x - b.x)

        // Calculate total width and gaps
        const totalWidth = sortedByX.reduce((sum, comp) => sum + comp.width, 0)
        const firstX = sortedByX[0].x
        const lastX = sortedByX[sortedByX.length - 1].x + sortedByX[sortedByX.length - 1].width
        const availableSpace = lastX - firstX - totalWidth
        const gap = availableSpace / (sortedByX.length - 1)

        // Apply even spacing
        let currentX = firstX
        sortedByX.forEach((comp, index) => {
            if (index === 0) {
                // Keep the first component in place
                currentX += comp.width
            } else if (index === sortedByX.length - 1) {
                // Keep the last component in place
            } else {
                // Position middle components with even spacing
                updateComponent(comp.id, { x: currentX + gap })
                currentX += gap + comp.width
            }
        })
    }
}

// Function to auto-space selected components
export function autoSpaceSelectedComponents(): void {
    const currentSelectedIds = get(selectedComponentIds)
    if (!currentSelectedIds || currentSelectedIds.length <= 1) return

    const allComponents = get(componentsStore)
    if (!allComponents) return

    const selectedComps = allComponents.filter((c) => currentSelectedIds.includes(c.id))

    // Sort components by their vertical position
    const sortedByY = [...selectedComps].sort((a, b) => a.y - b.y)

    // Calculate total height and gaps
    const totalHeight = sortedByY.reduce((sum, comp) => sum + comp.height, 0)
    const firstY = sortedByY[0].y
    const lastY = sortedByY[sortedByY.length - 1].y + sortedByY[sortedByY.length - 1].height
    const availableSpace = lastY - firstY - totalHeight
    const gap = availableSpace / (sortedByY.length - 1)

    // Apply even spacing
    let currentY = firstY
    sortedByY.forEach((comp, index) => {
        if (index === 0) {
            // Keep the first component in place
            currentY += comp.height
        } else {
            // Position subsequent components with even spacing
            updateComponent(comp.id, { y: currentY + gap })
            currentY += gap + comp.height
        }
    })

    // Now do the same for horizontal spacing
    const sortedByX = [...selectedComps].sort((a, b) => a.x - b.x)
    const totalWidth = sortedByX.reduce((sum, comp) => sum + comp.width, 0)
    const firstX = sortedByX[0].x
    const lastX = sortedByX[sortedByX.length - 1].x + sortedByX[sortedByX.length - 1].width
    const availableHSpace = lastX - firstX - totalWidth
    const hGap = availableHSpace / (sortedByX.length - 1)

    // Apply even horizontal spacing
    let currentX = firstX
    sortedByX.forEach((comp, index) => {
        if (index === 0) {
            // Keep the first component in place
            currentX += comp.width
        } else {
            // Position subsequent components with even spacing
            updateComponent(comp.id, { x: currentX + hGap })
            currentX += hGap + comp.width
        }
    })
}
