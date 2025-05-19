// src/lib/utils/alignment-utils.ts
import type { SurveyComponent } from "$lib/types/types.ts"
import { updateComponent } from "$lib/stores/designStore.ts"

export type Alignment = "left" | "center" | "right" | "top" | "middle" | "bottom"
export type Distribution = "horizontal" | "vertical"

export function alignComponents(
    components: SurveyComponent[],
    primaryComponent: SurveyComponent,
    alignment: Alignment,
): void {
    if (components.length <= 1) return

    let targetX: number | undefined, targetY: number | undefined

    switch (alignment) {
        case "left":
            targetX = primaryComponent.x
            break
        case "center":
            targetX = primaryComponent.x + primaryComponent.width / 2
            break
        case "right":
            targetX = primaryComponent.x + primaryComponent.width
            break
        case "top":
            targetY = primaryComponent.y
            break
        case "middle":
            targetY = primaryComponent.y + primaryComponent.height / 2
            break
        case "bottom":
            targetY = primaryComponent.y + primaryComponent.height
            break
    }

    components.forEach((comp) => {
        if (comp.id === primaryComponent.id) return

        let newX = comp.x,
            newY = comp.y

        if (targetX !== undefined) {
            if (alignment === "left") newX = targetX
            else if (alignment === "center") newX = targetX - comp.width / 2
            else if (alignment === "right") newX = targetX - comp.width
        }

        if (targetY !== undefined) {
            if (alignment === "top") newY = targetY
            else if (alignment === "middle") newY = targetY - comp.height / 2
            else if (alignment === "bottom") newY = targetY - comp.height
        }

        updateComponent(comp.id, { x: Math.round(newX), y: Math.round(newY) })
    })
}

/**
 * Distributes components evenly along the specified axis
 * This is a more accurate implementation than the one in the store
 */
export function distributeComponents(components: SurveyComponent[], distribution: Distribution): void {
    if (components.length < 3) return

    if (distribution === "horizontal") {
        // Sort by x position
        const sortedComps = [...components].sort((a, b) => a.x - b.x)
        const first = sortedComps[0]
        const last = sortedComps[sortedComps.length - 1]

        // Calculate total available space
        const totalWidth = last.x + last.width - first.x
        const totalComponentWidth = sortedComps.reduce((sum, comp) => sum + comp.width, 0)
        const availableSpace = totalWidth - totalComponentWidth

        // Calculate even spacing
        const spacing = availableSpace / (sortedComps.length - 1)

        // Position components with even spacing
        let currentX = first.x + first.width + spacing
        for (let i = 1; i < sortedComps.length - 1; i++) {
            updateComponent(sortedComps[i].id, { x: Math.round(currentX) })
            currentX += sortedComps[i].width + spacing
        }
    } else {
        // Sort by y position
        const sortedComps = [...components].sort((a, b) => a.y - b.y)
        const first = sortedComps[0]
        const last = sortedComps[sortedComps.length - 1]

        // Calculate total available space
        const totalHeight = last.y + last.height - first.y
        const totalComponentHeight = sortedComps.reduce((sum, comp) => sum + comp.height, 0)
        const availableSpace = totalHeight - totalComponentHeight

        // Calculate even spacing
        const spacing = availableSpace / (sortedComps.length - 1)

        // Position components with even spacing
        let currentY = first.y + first.height + spacing
        for (let i = 1; i < sortedComps.length - 1; i++) {
            updateComponent(sortedComps[i].id, { y: Math.round(currentY) })
            currentY += sortedComps[i].height + spacing
        }
    }
}
