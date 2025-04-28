// src/lib/stores/themeStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function getInitialTheme(): 'light' | 'dark' {
    if (!browser) { return 'light'; }
    const storedTheme = localStorage.getItem('color-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') { return storedTheme; }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const initialTheme = getInitialTheme();
export const theme = writable<'light' | 'dark'>(initialTheme);

if (browser) {
    if (initialTheme === 'dark') { document.documentElement.classList.add('dark'); }
    else { document.documentElement.classList.remove('dark'); }
}

export function toggleTheme() {
    theme.update(current => {
        const newTheme = current === 'dark' ? 'light' : 'dark';
        if (browser) {
            if (newTheme === 'dark') { document.documentElement.classList.add('dark'); }
            else { document.documentElement.classList.remove('dark'); }
            localStorage.setItem('color-theme', newTheme);
        }
        return newTheme;
    });
}

export function setTheme(newTheme: 'light' | 'dark') {
    if (browser) {
        if (newTheme === 'dark') { document.documentElement.classList.add('dark'); }
        else { document.documentElement.classList.remove('dark'); }
        localStorage.setItem('color-theme', newTheme);
    }
    theme.set(newTheme);
}