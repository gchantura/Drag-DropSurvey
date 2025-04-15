// lib/stores/surveyStore.ts
import { v4 as uuid } from 'uuid';
import { writable, get } from 'svelte/store';
import type { ComponentType, SurveyComponent } from '../types/survey.ts';

// Create the store for survey components
export const componentsStore = writable<SurveyComponent[]>([]);

// Helper functions for manipulating components
export function addComponent(type: ComponentType) {
    componentsStore.update((comps) => [
        ...comps,
        {
            id: uuid(),
            type,
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} question`,
            x: 50,
            y: 50,
            width: 200,
            height: 100,
            fontSize: 16,
            fontFamily: 'Arial',
            color: '#000000',
            bgColor: '#F0F0F0',
            required: false,
            options: type === 'checkbox' || type === 'radio' || type === 'dropdown'
                ? ['Option 1', 'Option 2']
                : [],
            description: '',
            src: type === 'fileAttachment' ? '' : undefined,
            maxRating: type === 'rating' ? 5 : 0,
            acceptedFileTypes: type === 'fileUpload' ? '.pdf,.doc,.docx,.jpg,.png' : undefined,
            maxFileSize: type === 'fileUpload' ? 5 : undefined, // In MB
            columns: type === 'matrix' ? ['Column 1', 'Column 2'] : [],
            rows: type === 'matrix' ? ['Row 1', 'Row 2'] : [],
            startX: 2000,
            startY: 2000
        }
    ]);
}

export function updateComponent(id: string, updates: Partial<SurveyComponent>) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id) {
                return { ...comp, ...updates };
            }
            return comp;
        });
    });
}

// Function to delete a component
export function deleteComponent(id: string) {
    componentsStore.update((comps) => comps.filter((comp) => comp.id !== id));
}

// Function to duplicate a component
export function duplicateComponent(id: string, positionUpdates: Partial<SurveyComponent> = {}): string {
    const components = get(componentsStore);
    const component = components.find(comp => comp.id === id);

    if (!component) return '';

    const newId = uuid();
    const newComponent = {
        ...component,
        id: newId,
        ...positionUpdates
    };

    componentsStore.update(comps => [...comps, newComponent]);
    return newId;
}

export function addOption(id: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id) {
                return {
                    ...comp,
                    options: [...comp.options, `Option ${comp.options.length + 1}`]
                };
            }
            return comp;
        });
    });
}

export function updateOption(id: string, index: number, value: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id) {
                const newOptions = [...comp.options];
                newOptions[index] = value;
                return {
                    ...comp,
                    options: newOptions
                };
            }
            return comp;
        });
    });
}

export function removeOption(id: string, index: number) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id) {
                const newOptions = [...comp.options];
                newOptions.splice(index, 1);
                return {
                    ...comp,
                    options: newOptions
                };
            }
            return comp;
        });
    });
}

// Matrix-specific operations
export function addRow(id: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === 'matrix') {
                return {
                    ...comp,
                    rows: [...comp.rows, `Row ${comp.rows.length + 1}`]
                };
            }
            return comp;
        });
    });
}

export function updateRow(id: string, index: number, value: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === 'matrix') {
                const newRows = [...comp.rows];
                newRows[index] = value;
                return {
                    ...comp,
                    rows: newRows
                };
            }
            return comp;
        });
    });
}

export function removeRow(id: string, index: number) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === 'matrix') {
                const newRows = [...comp.rows];
                newRows.splice(index, 1);
                return {
                    ...comp,
                    rows: newRows
                };
            }
            return comp;
        });
    });
}

export function addColumn(id: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === 'matrix') {
                return {
                    ...comp,
                    columns: [...comp.columns, `Column ${comp.columns.length + 1}`]
                };
            }
            return comp;
        });
    });
}

export function updateColumn(id: string, index: number, value: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === 'matrix') {
                const newColumns = [...comp.columns];
                newColumns[index] = value;
                return {
                    ...comp,
                    columns: newColumns
                };
            }
            return comp;
        });
    });
}

export function removeColumn(id: string, index: number) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === 'matrix') {
                const newColumns = [...comp.columns];
                newColumns.splice(index, 1);
                return {
                    ...comp,
                    columns: newColumns
                };
            }
            return comp;
        });
    });
}

export function saveSurvey() {
    const components = get(componentsStore);
    const surveyData = JSON.stringify(components);

    if (typeof window !== 'undefined') {
        localStorage.setItem('surveyBuilder', surveyData);
        return true;
    }
    return false;
}

export function loadSurvey() {
    if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('surveyBuilder');
        if (savedData) {
            try {
                componentsStore.set(JSON.parse(savedData));
                return true;
            } catch (e) {
                console.error('Failed to parse saved survey data:', e);
                return false;
            }
        }
    }
    return false;
}

export function exportSurvey() {
    const components = get(componentsStore);
    const surveyData = JSON.stringify(components, null, 2);

    // Create a blob and download link
    const blob = new Blob([surveyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    return true;
}

export function importSurvey(jsonData: string): boolean {
    try {
        const components = JSON.parse(jsonData);
        if (Array.isArray(components)) {
            componentsStore.set(components);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Failed to import survey data:', e);
        return false;
    }
}

export function clearSurvey() {
    componentsStore.set([]);
}