// src/lib/utils/store-utils.ts
import { get } from 'svelte/store';
import type { Writable } from 'svelte/store';

export function updateStoreItem<T extends { id: string }>(
    store: Writable<T[]>,
    id: string,
    updates: Partial<T>
): boolean {
    let updated = false;

    store.update(items => {
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            updated = true;
        }
        return items;
    });

    return updated;
}

export function removeStoreItem<T extends { id: string }>(
    store: Writable<T[]>,
    id: string
): T | null {
    let removedItem: T | null = null;

    store.update(items => {
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            removedItem = items[index];
            return [...items.slice(0, index), ...items.slice(index + 1)];
        }
        return items;
    });

    return removedItem;
}

export function addStoreItem<T>(
    store: Writable<T[]>,
    item: T
): void {
    store.update(items => [...items, item]);
}

export function getStoreItem<T extends { id: string }>(
    store: Writable<T[]>,
    id: string
): T | undefined {
    return get(store).find(item => item.id === id);
}