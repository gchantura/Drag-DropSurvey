import { derived, get } from 'svelte/store';
import { componentsStore, updateComponent } from '$lib/stores/surveyStore.ts';
import { selectedComponentIds } from './alignmentStore.ts';

export type Distribution = 'horizontal' | 'vertical';

// --- Derived State ---
export const canDistribute = derived(
    selectedComponentIds,
    ($ids) => $ids.length > 2
);

// --- Distribution Action ---
export function distributeSelectedComponents