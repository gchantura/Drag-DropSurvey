import { writable, derived, get } from 'svelte/store';
import { componentsStore, updateComponent } from '$lib/stores/surveyStore.ts';
import type { SurveyComponent } from '$lib/types/survey.ts';

export type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type Distribution = 'horizontal' | 'vertical';

export const selectedComponentIds = writable<string[]>([]);

export const primarySelectedComponentId = writable<string | null>(null);

export const canAlignOrDistribute = derived(
    selectedComponentIds,
    ($ids) => $ids.length > 1
);

export function alignSelectedComponents(alignment: Alignment): void {
    const currentSelectedIds = get(selectedComponentIds);
    const primaryId = get(primarySelectedComponentId);
    const allComponents = get(componentsStore);

    if (currentSelectedIds.length <= 1) return;

    const selectedComps = allComponents.filter(c => currentSelectedIds.includes(c.id));
    if (selectedComps.length <= 1) return;

    let primary = selectedComps.find(c => c.id === primaryId);
    if (!primary) {
        primary = selectedComps[0];
    }

    let targetX: number | undefined, targetY: number | undefined;
    switch (alignment) {
        case 'left':
            targetX = primary.x;
            break;
        case 'center':
            targetX = primary.x + primary.width / 2;
            break;
        case 'right':
            targetX = primary.x + primary.width;
            break;
        case 'top':
            targetY = primary.y;
            break;
        case 'middle':
            targetY = primary.y + primary.height / 2;
            break;
        case 'bottom':
            targetY = primary.y + primary.height;
            break;
    }

    selectedComps.forEach((comp) => {
        if (comp.id === primary?.id) return;

        let newX = comp.x,
            newY = comp.y;

        if (targetX !== undefined) {
            if (alignment === 'left') newX = targetX;
            else if (alignment === 'center') newX = targetX - comp.width / 2;
            else if (alignment === 'right') newX = targetX - comp.width;
        }
        if (targetY !== undefined) {
            if (alignment === 'top') newY = targetY;
            else if (alignment === 'middle') newY = targetY - comp.height / 2;
            else if (alignment === 'bottom') newY = targetY - comp.height;
        }
        updateComponent(comp.id, { x: Math.round(newX), y: Math.round(newY) });
    });
}

export function distributeSelectedComponents(direction: Distribution): void {
    const currentSelectedIds = get(selectedComponentIds);
    const allComponents = get(componentsStore);

    if (currentSelectedIds.length <= 2) return;

    const selectedComps = allComponents
        .filter(c => currentSelectedIds.includes(c.id))
        .map(c => ({ ...c }));

    if (selectedComps.length <= 2) return;

    if (direction === 'horizontal') {
        selectedComps.sort((a, b) => a.x - b.x);
        const first = selectedComps[0];
        const last = selectedComps[selectedComps.length - 1];
        const totalRange = (last.x + last.width) - first.x;
        const totalWidth = selectedComps.reduce((sum, comp) => sum + comp.width, 0);
        const totalSpacing = Math.max(0, totalRange - totalWidth);
        const gap = selectedComps.length > 1 ? totalSpacing / (selectedComps.length - 1) : 0;

        let currentX = first.x;
        selectedComps.forEach((comp, index) => {
            if (index > 0) {
                currentX += selectedComps[index - 1].width + gap;
                updateComponent(comp.id, { x: Math.round(currentX) });
            }
        });
    } else {
        selectedComps.sort((a, b) => a.y - b.y);
        const first = selectedComps[0];
        const last = selectedComps[selectedComps.length - 1];
        const totalRange = (last.y + last.height) - first.y;
        const totalHeight = selectedComps.reduce((sum, comp) => sum + comp.height, 0);
        const totalSpacing = Math.max(0, totalRange - totalHeight);
        const gap = selectedComps.length > 1 ? totalSpacing / (selectedComps.length - 1) : 0;

        let currentY = first.y;
        selectedComps.forEach((comp, index) => {
            if (index > 0) {
                currentY += selectedComps[index - 1].height + gap;
                updateComponent(comp.id, { y: Math.round(currentY) });
            }
        });
    }
}

export function clearSelectionState() {
    selectedComponentIds.set([]);
    primarySelectedComponentId.set(null);
}

export function selectAllComponentsState() {
    const allIds = get(componentsStore).map(c => c.id);
    selectedComponentIds.set(allIds);
    primarySelectedComponentId.set(allIds.length > 0 ? allIds[0] : null);
}

export const alignmentActions = {
    alignSelectedComponents,
    distributeSelectedComponents,
    clearSelectionState,
    selectAllComponentsState
};