// src/lib/stores/canvasStore.ts
import { writable } from 'svelte/store';

// --- Constants ---
export const DPI = 96;
export const CM_PER_INCH = 2.54;
export const PIXEL_PER_CM = DPI / CM_PER_INCH;
export const PIXEL_PER_INCH = DPI;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_SENSITIVITY = 0.001;
export const RULER_SIZE = 32; // px
export const SNAP_THRESHOLD = 5; // px

// --- Page Size Definitions ---
export const pageSizes = {
    A4: { width: (210 * PIXEL_PER_CM) / 10, height: (297 * PIXEL_PER_CM) / 10 },
    Letter: { width: 8.5 * PIXEL_PER_INCH, height: 11 * PIXEL_PER_INCH },
    Custom: { width: 800, height: 1100 } // Default custom size
};

// --- Store State Interface ---
interface CanvasViewState {
    width: number;
    height: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    pageFormat: string;
}

// --- Store Initialization ---
const initialFormat = 'A4';
const initialWidth = pageSizes[initialFormat as keyof typeof pageSizes]?.width ?? pageSizes.Custom.width;
const initialHeight = pageSizes[initialFormat as keyof typeof pageSizes]?.height ?? pageSizes.Custom.height;

// Initialize Custom page size
pageSizes.Custom.width = initialWidth;
pageSizes.Custom.height = initialHeight;

// Create the writable store instance
const { subscribe, update, set } = writable<CanvasViewState>({
    width: initialWidth,
    height: initialHeight,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    pageFormat: initialFormat
});

// --- Helper Functions ---
function clampZoom(scale: number): number {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
}

function calculateOffsets(scale: number, contentWidth: number, contentHeight: number, viewportWidth: number, viewportHeight: number): { offsetX: number, offsetY: number } {
    const newOffsetX = Math.max(0, (viewportWidth - RULER_SIZE - contentWidth) / 2);
    const newOffsetY = Math.max(0, (viewportHeight - RULER_SIZE - contentHeight) / 2);
    return { offsetX: newOffsetX, offsetY: newOffsetY };
}

// --- Store Actions ---
function setCanvasSize(width: number, height: number) {
    update((state) => {
        pageSizes.Custom.width = width;
        pageSizes.Custom.height = height;
        return { ...state, width, height, pageFormat: 'Custom' };
    });
}

function setPageFormat(format: string) {
    update((state) => {
        const validFormat = format as keyof typeof pageSizes;
        const { width, height } = pageSizes[validFormat] ?? pageSizes.Custom;
        return { ...state, pageFormat: format, width, height };
    });
}

function setCanvasTransform(scale: number, offsetX: number, offsetY: number) {
    update((state) => ({
        ...state,
        scale: clampZoom(scale),
        offsetX,
        offsetY
    }));
}

function setCanvasOffset(offsetX: number, offsetY: number) {
    update((state) => ({ ...state, offsetX, offsetY }));
}

function setCanvasScale(newScale: number) {
    update((state) => ({
        ...state,
        scale: clampZoom(newScale)
    }));
}

function resetZoom(viewportWidth: number, viewportHeight: number) {
    update((state) => {
        const newScale = 1;
        const contentWidth = state.width * newScale;
        const contentHeight = state.height * newScale;
        const { offsetX, offsetY } = calculateOffsets(newScale, contentWidth, contentHeight, viewportWidth, viewportHeight);
        return { ...state, scale: newScale, offsetX, offsetY };
    });
}

function zoomIn() {
    update((state) => ({
        ...state,
        scale: clampZoom(state.scale + 0.1)
    }));
}

function zoomOut() {
    update((state) => ({
        ...state,
        scale: clampZoom(state.scale - 0.1)
    }));
}

function adjustZoom(delta: number, centerX: number, centerY: number) {
    update((state) => {
        const zoomFactor = Math.exp(delta);
        const newScale = clampZoom(state.scale * zoomFactor);

        if (newScale === state.scale) {
            return state; // No change
        }

        const mouseX_Canvas_PreZoom = (centerX - state.offsetX) / state.scale;
        const mouseY_Canvas_PreZoom = (centerY - state.offsetY) / state.scale;
        const newOffsetX = centerX - mouseX_Canvas_PreZoom * newScale;
        const newOffsetY = centerY - mouseY_Canvas_PreZoom * newScale;

        return { ...state, scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
    });
}

// --- Export Store and Actions ---
export const canvasViewStore = {
    subscribe,
    setCanvasSize,
    setPageFormat,
    setCanvasTransform,
    setCanvasOffset,
    setCanvasScale,
    resetZoom,
    zoomIn,
    zoomOut,
    adjustZoom
};