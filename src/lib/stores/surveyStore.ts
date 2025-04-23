// src/lib/stores/surveyStore.ts
import { v4 as uuid } from 'uuid';
import { writable, get } from 'svelte/store';
import type { ComponentType, SurveyComponent } from '$lib/types/survey.ts'; // Adjusted path needed if not in same dir

// Create the store for survey components
export const componentsStore = writable<SurveyComponent[]>([]);

// Helper functions for manipulating components
export function addComponent(type: ComponentType) {
    componentsStore.update((comps) => [
        ...comps,
        {
            id: uuid(),
            type,
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`, // Default label
            x: 50,
            y: 50,
            width: type === 'section' || type === 'title' || type === 'introduction' ? 400 : 200,
            height: type === 'textarea' || type === 'matrix' || type === 'section' ? 150 : 100,
            fontSize: 16,
            fontFamily: 'Arial',
            color: '#000000',
            bgColor: '#FFFFFF', // Default to white BG
            required: false,
            options:
                type === 'checkbox' || type === 'radio' || type === 'dropdown'
                    ? ['Option 1', 'Option 2']
                    : [],
            description: type === 'section' || type === 'introduction' ? 'Description...' : '',
            src: type === 'fileAttachment' ? '' : undefined,
            maxRating: type === 'rating' ? 5 : undefined,
            acceptedFileTypes: type === 'fileUpload' ? '.pdf,.doc,.docx,.jpg,.png' : undefined,
            maxFileSize: type === 'fileUpload' ? 5 : undefined, // In MB
            columns: type === 'matrix' ? ['Column 1', 'Column 2'] : [],
            rows: type === 'matrix' ? ['Row 1', 'Row 2'] : [],
            startX: 0, // Initialize startX/startY
            startY: 0
        }
    ]);
}

export function updateComponent(id: string, updates: Partial<SurveyComponent>) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id) {
                // Preserve existing startX/startY unless explicitly updated
                const { startX, startY, ...restUpdates } = updates;
                return {
                    ...comp,
                    ...restUpdates,
                    startX: startX !== undefined ? startX : comp.startX,
                    startY: startY !== undefined ? startY : comp.startY
                };
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
    const component = components.find((comp) => comp.id === id);

    if (!component) return '';

    const newId = uuid();
    // Deep copy complex properties like arrays
    const newComponent = {
        ...component,
        options: [...(component.options ?? [])], // Handle potential undefined
        columns: [...(component.columns ?? [])], // Handle potential undefined
        rows: [...(component.rows ?? [])],       // Handle potential undefined
        id: newId,
        x: (component.x ?? 0) + 20, // Default offset if not provided
        y: (component.y ?? 0) + 20,
        ...positionUpdates,
        startX: 0, // Reset start positions for new component
        startY: 0
    };

    componentsStore.update((comps) => [...comps, newComponent]);
    return newId;
}

// --- Options Management ---
export function addOption(id: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && Array.isArray(comp.options)) {
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
            if (comp.id === id && Array.isArray(comp.options) && index >= 0 && index < comp.options.length) {
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
            if (comp.id === id && Array.isArray(comp.options) && index >= 0 && index < comp.options.length) {
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

// --- Matrix Management ---
export function addRow(id: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === 'matrix' && Array.isArray(comp.rows)) {
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
            if (
                comp.id === id &&
                comp.type === 'matrix' &&
                Array.isArray(comp.rows) &&
                index >= 0 &&
                index < comp.rows.length
            ) {
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
            if (
                comp.id === id &&
                comp.type === 'matrix' &&
                Array.isArray(comp.rows) &&
                index >= 0 &&
                index < comp.rows.length
            ) {
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
            if (comp.id === id && comp.type === 'matrix' && Array.isArray(comp.columns)) {
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
            if (
                comp.id === id &&
                comp.type === 'matrix' &&
                Array.isArray(comp.columns) &&
                index >= 0 &&
                index < comp.columns.length
            ) {
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
            if (
                comp.id === id &&
                comp.type === 'matrix' &&
                Array.isArray(comp.columns) &&
                index >= 0 &&
                index < comp.columns.length
            ) {
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


// --- Persistence ---
const STORAGE_KEY = 'surveyBuilderData_v1'; // Use a versioned key

export function saveSurvey() {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const components = get(componentsStore);
            const surveyData = JSON.stringify(components);
            localStorage.setItem(STORAGE_KEY, surveyData);
            console.log('Survey saved successfully.');
            return true;
        } catch (e) {
            console.error('Failed to save survey to localStorage:', e);
            return false;
        }
    }
    console.warn('LocalStorage is not available. Cannot save survey.');
    return false;
}

export function loadSurvey() {
    if (typeof window !== 'undefined' && window.localStorage) {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // Basic validation: Check if it's an array
                if (Array.isArray(parsedData)) {
                    // Further validation could be added here to check component structure
                    componentsStore.set(parsedData);
                    console.log('Survey loaded successfully.');
                    return true;
                } else {
                    console.error('Invalid survey data format found in localStorage.');
                    localStorage.removeItem(STORAGE_KEY); // Clear invalid data
                    return false;
                }
            } catch (e) {
                console.error('Failed to parse saved survey data:', e);
                localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
                return false;
            }
        } else {
            console.log('No saved survey found in localStorage.');
        }
    } else {
        console.warn('LocalStorage is not available. Cannot load survey.');
    }
    return false;
}

export function exportSurvey() {
    try {
        const components = get(componentsStore);
        const surveyData = JSON.stringify(components, null, 2); // Pretty print JSON

        // Create a blob and download link
        const blob = new Blob([surveyData], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `survey-export-${new Date().toISOString().split('T')[0]}.json`;

        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('Survey exported successfully.');
        return true;
    } catch (e) {
        console.error('Failed to export survey:', e);
        return false;
    }
}

export function importSurvey(jsonData: string): boolean {
    try {
        const components = JSON.parse(jsonData);
        // Basic validation
        if (Array.isArray(components)) {
            // Add more validation here if needed (check if items have 'id', 'type' etc.)
            componentsStore.set(components);
            console.log('Survey imported successfully.');
            return true;
        } else {
            console.error('Import failed: Invalid JSON format (expected an array).');
            return false;
        }
    } catch (e) {
        console.error('Failed to import survey data:', e);
        return false;
    }
}

export function clearSurvey() {
    componentsStore.set([]);
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY); // Also clear from storage
    }
    console.log('Survey cleared.');
}