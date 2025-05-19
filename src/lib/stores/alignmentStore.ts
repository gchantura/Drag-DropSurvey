// src/lib/stores/alignmentStore.ts
import { writable, derived, get } from "svelte/store";
import { componentsStore } from "$lib/stores/designStore.ts";
import { alignComponents } from "$lib/utils/alignment-utils.ts";
import type { Alignment } from "$lib/utils/alignment-utils.ts";

export const selectedComponentIds = writable<string[]>([]);
export const primarySelectedComponentId = writable<string | null>(null);
export const canAlign = derived(selectedComponentIds, ($ids) => $ids.length > 1);

export function alignSelectedComponents(alignment: Alignment): void {
    const currentSelectedIds = get(selectedComponentIds);
    if (!get(canAlign)) return;

    const primaryId = get(primarySelectedComponentId);
    const allComponents = get(componentsStore);
    const selectedComps = allComponents.filter((c) => currentSelectedIds.includes(c.id));

    if (selectedComps.length <= 1) return;

    let primary = selectedComps.find((c) => c.id === primaryId);
    if (!primary) {
        primary = selectedComps[0];
    }

    alignComponents(selectedComps, primary, alignment);
}

export function clearSelectionState() {
    selectedComponentIds.set([]);
    primarySelectedComponentId.set(null);
}

export function selectAllComponentsState() {
    const allIds = get(componentsStore).map((c) => c.id);
    selectedComponentIds.set(allIds);
    primarySelectedComponentId.set(allIds.length > 0 ? allIds[0] : null);
}

export const alignmentActions = {
    alignSelectedComponents,
    clearSelectionState,
    selectAllComponentsState
};