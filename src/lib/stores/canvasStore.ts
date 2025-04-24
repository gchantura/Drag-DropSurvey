// src/lib/stores/canvasStore.ts
import { writable } from 'svelte/store';

// --- Constants ---
// These are configuration values related to rendering, units, and interactions.
// Exporting them allows consistent use across the application if needed.
export const DPI = 96;
export const CM_PER_INCH = 2.54;
export const PIXEL_PER_CM = DPI / CM_PER_INCH;
export const PIXEL_PER_INCH = DPI;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_SENSITIVITY = 0.001;
export const RULER_SIZE = 32; // px - Visual constant for the canvas UI
export const SNAP_THRESHOLD = 5; // px - Interaction constant for snapping behavior

// --- Page Size Definitions ---
// Central place to define standard page sizes in pixels.
export const pageSizes = {
    A4: { width: (210 * PIXEL_PER_CM) / 10, height: (297 * PIXEL_PER_CM) / 10 },
    Letter: { width: 8.5 * PIXEL_PER_INCH, height: 11 * PIXEL_PER_INCH },
    Custom: { width: 800, height: 1100 } // Default custom size, might be updated
};

// --- Store State Interface ---
// Defines the shape of the reactive state managed by this store.
interface CanvasViewState {
    width: number; // Current canvas width in pixels
    height: number; // Current canvas height in pixels
    scale: number; // Current zoom level (1 = 100%)
    offsetX: number; // Horizontal pan offset in viewport pixels
    offsetY: number; // Vertical pan offset in viewport pixels
    pageFormat: string; // Identifier for the current page size ('A4', 'Letter', 'Custom')
}

// --- Store Initialization ---
const initialFormat = 'A4';
const initialWidth = pageSizes[initialFormat as keyof typeof pageSizes]?.width ?? pageSizes.Custom.width;
const initialHeight = pageSizes[initialFormat as keyof typeof pageSizes]?.height ?? pageSizes.Custom.height;

// Initialize the 'Custom' page size definition to match the initial state
pageSizes.Custom.width = initialWidth;
pageSizes.Custom.height = initialHeight;

// Create the writable store instance
const { subscribe, update, set } = writable<CanvasViewState>({
    width: initialWidth,
    height: initialHeight,
    scale: 1,
    offsetX: 0, // Start centered or at top-left (0,0 is common)
    offsetY: 0,
    pageFormat: initialFormat
});

// --- Store Actions (Functions to modify the state) ---

/** Updates the canvas dimensions directly. Used for 'Custom' size changes. */
function setCanvasSize(width: number, height: number) {
    update((state) => {
        // Update the 'Custom' definition whenever size is set directly
        pageSizes.Custom.width = width;
        pageSizes.Custom.height = height;
        return { ...state, width, height, pageFormat: 'Custom' }; // Assume setting size directly means 'Custom'
    });
}

/** Sets the page format and updates canvas dimensions accordingly. */
function setPageFormat(format: string) {
    update((state) => {
        let newWidth = state.width;
        let newHeight = state.height;
        const validFormat = format as keyof typeof pageSizes;

        if (format !== 'Custom' && pageSizes[validFormat]) {
            newWidth = pageSizes[validFormat].width;
            newHeight = pageSizes[validFormat].height;
        } else {
            // If switching to 'Custom', use the stored 'Custom' dimensions
            newWidth = pageSizes.Custom.width;
            newHeight = pageSizes.Custom.height;
        }
        return { ...state, pageFormat: format, width: newWidth, height: newHeight };
    });
}

/** Sets the entire canvas transform (scale and offset), clamping the scale. */
function setCanvasTransform(scale: number, offsetX: number, offsetY: number) {
    update((state) => ({
        ...state,
        scale: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale)),
        offsetX,
        offsetY
    }));
}

/** Updates only the canvas offset (used for panning). */
function setCanvasOffset(offsetX: number, offsetY: number) {
    update((state) => ({ ...state, offsetX, offsetY }));
}

/** Updates only the canvas scale, clamping the value (used for simple zoom buttons). */
function setCanvasScale(newScale: number) {
    update((state) => ({
        ...state,
        scale: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale))
    }));
}

/** Resets zoom to 100% and centers the canvas within the given viewport dimensions. */
function resetZoom(viewportWidth: number, viewportHeight: number) {
    update((state) => {
        const newScale = 1;
        // Use the current state's width/height for centering calculation
        const contentWidth = state.width * newScale;
        const contentHeight = state.height * newScale;
        // Calculate offsets to center the content, ensuring offset is not negative
        const newOffsetX = Math.max(0, (viewportWidth - RULER_SIZE - contentWidth) / 2);
        const newOffsetY = Math.max(0, (viewportHeight - RULER_SIZE - contentHeight) / 2);
        return {
            ...state,
            scale: newScale,
            offsetX: newOffsetX,
            offsetY: newOffsetY
        };
    });
}

/** Increases the zoom level by a fixed step. */
function zoomIn(p0?: number, p1?: number) {
    update((state) => {
        const newScale = Math.min(state.scale + 0.1, MAX_ZOOM);
        // Note: Simple zoom doesn't center on mouse - adjustZoom is needed for that
        return { ...state, scale: newScale };
    });
}

/** Decreases the zoom level by a fixed step. */
function zoomOut(p0?: number, p1?: number) {
    update((state) => {
        const newScale = Math.max(state.scale - 0.1, MIN_ZOOM);
        return { ...state, scale: newScale };
    });
}

/** Adjusts zoom based on a delta (e.g., from wheel event) and centers on a specific point (viewport coordinates). */
function adjustZoom(delta: number, centerX: number, centerY: number) {
    update((state) => {
        const zoomFactor = Math.exp(delta);
        const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.scale * zoomFactor));

        if (newScale === state.scale) {
            return state; // No change in scale
        }

        // Calculate mouse position in canvas coordinates *before* the zoom
        const mouseX_Canvas_PreZoom = (centerX - state.offsetX) / state.scale;
        const mouseY_Canvas_PreZoom = (centerY - state.offsetY) / state.scale;

        // Calculate the new offset required to keep the pre-zoom canvas point
        // under the mouse cursor (centerX, centerY) *after* the zoom
        const newOffsetX = centerX - mouseX_Canvas_PreZoom * newScale;
        const newOffsetY = centerY - mouseY_Canvas_PreZoom * newScale;

        return { ...state, scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
    });
}

// --- Export Store and Actions ---
// Make the store subscription and the actions available for import.
export const canvasViewStore = {
    subscribe, // Allows components to react to state changes ($canvasViewStore)
    setCanvasSize,
    setPageFormat,
    setCanvasTransform,
    setCanvasOffset,
    setCanvasScale,
    resetZoom, // Requires viewport size from component
    zoomIn,
    zoomOut,
    adjustZoom // Requires mouse coords from component
};