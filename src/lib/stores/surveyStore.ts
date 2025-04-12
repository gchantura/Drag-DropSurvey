// lib/stores/surveyStore.ts
import { v4 as uuid } from 'uuid';
import { writable, get } from 'svelte/store';
import type { ComponentType, SurveyComponent } from '../types/survey.js';

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
            description: undefined,
            src: '',
            maxRating: 0,
            columns: function (columns: any): unknown {
                throw new Error('Function not implemented.');
            },
            rows: function (rows: any): unknown {
                throw new Error('Function not implemented.');
            }
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

export function removeComponent(id: string) {
    componentsStore.update((comps) => comps.filter((comp) => comp.id !== id));
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
            componentsStore.set(JSON.parse(savedData));
            return true;
        }
    }
    return false;
}

export function clearSurvey() {
    componentsStore.set([]);
}