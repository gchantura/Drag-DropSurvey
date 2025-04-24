import { derived, get } from 'svelte/store';
import { componentsStore, updateComponent } from '$lib/stores/surveyStore.ts';
import { selectedComponentIds } from './alignmentStore.ts'; // Import selection state

export type Distribution = 'horizontal' | 'vertical';

// --- Derived State ---
export const canDistribute = derived(
    selectedComponentIds,
    ($ids) => $ids.length > 2 // Distribution requires at least 3 components
);

// --- Distribution Action ---
export function distributeSelectedComponents(direction: Distribution): void {
    const currentSelectedIds = get(selectedComponentIds);
    const allComponents = get(componentsStore);

    if (currentSelectedIds.length <= 2) return; // Already checked by derived store, but good safety check

    // Create copies for sorting/calculation
    const selectedComps = allComponents
        .filter(c => currentSelectedIds.includes(c.id))
        .map(c => ({ ...c }));

    if (selectedComps.length <= 2) return; // Double check after filtering

    if (direction === 'horizontal') {
        selectedComps.sort((a, b) => a.x - b.x);
        const first = selectedComps[0];
        const last = selectedComps[selectedComps.length - 1];
        const totalRange = (last.x + last.width) - first.x;
        const totalWidth = selectedComps.reduce((sum, comp) => sum + comp.width, 0);
        const totalSpacing = Math.max(0, totalRange - totalWidth);
        // Ensure gap is calculated correctly even with only 2 components (though we check for >2)
        const gap = selectedComps.length > 1 ? totalSpacing / (selectedComps.length - 1) : 0;

        let currentX = first.x;
        selectedComps.forEach((comp, index) => {
            // Update the component in the main store
            // Skip the first component as it's the reference point
            if (index > 0) {
                currentX += selectedComps[index - 1].width + gap;
                updateComponent(comp.id, { x: Math.round(currentX) });
            }
        });
    } else { // Vertical distribution
        selectedComps.sort((a, b) => a.y - b.y);
        const first = selectedComps[0];
        const last = selectedComps[selectedComps.length - 1];
        const totalRange = (last.y + last.height) - first.y;
        const totalHeight = selectedComps.reduce((sum, comp) => sum + comp.height, 0);
        const totalSpacing = Math.max(0, totalRange - totalHeight);
        const gap = selectedComps.length > 1 ? totalSpacing / (selectedComps.length - 1) : 0;

        let currentY = first.y;
        selectedComps.forEach((comp, index) => {
            // Skip the first component
            if (index > 0) {
                currentY += selectedComps[index - 1].height + gap;
                updateComponent(comp.id, { y: Math.round(currentY) });
            }
        });
    }
}

// Optional: Export combined object if preferred
export const distributionActions = {
    distributeSelectedComponents
};