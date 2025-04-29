import { writable, get } from 'svelte/store';

export const DPI = 96; // Pixels per inch
export const CM_PER_INCH = 2.54;
export const PIXEL_PER_CM = DPI / CM_PER_INCH; // Pixels per centimeter
export const PIXEL_PER_INCH = DPI; // Pixels per inch

export const MIN_ZOOM = 0.1; // Minimum zoom level (10%)
export const MAX_ZOOM = 5; // Maximum zoom level (500%)
export const ZOOM_SENSITIVITY = 0.001; // How sensitive zoom is to mouse wheel delta

export const RULER_SIZE = 32; // Size of the rulers in pixels
export const SNAP_THRESHOLD = 5; // Pixels threshold for snapping

// Define standard canvas sizes in pixels
export const standardSizes = {
    'A4 Portrait': { width: Math.round((210 * PIXEL_PER_CM) / 10), height: Math.round((297 * PIXEL_PER_CM) / 10) }, // Convert mm to px
    'A4 Landscape': { width: Math.round((297 * PIXEL_PER_CM) / 10), height: Math.round((210 * PIXEL_PER_CM) / 10) }, // Convert mm to px
    'Letter Portrait': { width: Math.round(8.5 * PIXEL_PER_INCH), height: Math.round(11 * PIXEL_PER_INCH) }, // Inches to px
    'Letter Landscape': { width: Math.round(11 * PIXEL_PER_INCH), height: Math.round(8.5 * PIXEL_PER_INCH) }, // Inches to px
    'Website (1920x1080)': { width: 1920, height: 1080 },
    'Website Medium (1366x768)': { width: 1366, height: 768 },
    'Square (1080x1080)': { width: 1080, height: 1080 },
    'Presentation (16:9)': { width: 1280, height: 720 },
    // 'Custom' size will track the *last* custom size set
    Custom: { width: 800, height: 1100 } // Initial value, will be overwritten
};

export type StandardSizeName = keyof typeof standardSizes; // Type for the keys of standardSizes

interface CanvasViewState {
    width: number; // Canvas width in pixels
    height: number; // Canvas height in pixels
    scale: number; // Current zoom level (1.0 = 100%)
    offsetX: number; // Pan offset X
    offsetY: number; // Pan offset Y
}

// Set an initial standard size, then update the Custom preset
const initialSizeName: StandardSizeName = 'A4 Portrait';
const initialWidth = standardSizes[initialSizeName]?.width ?? standardSizes.Custom.width;
const initialHeight = standardSizes[initialSizeName]?.height ?? standardSizes.Custom.height;

// Initialize the 'Custom' size to match the initial selected standard size
standardSizes.Custom.width = initialWidth;
standardSizes.Custom.height = initialHeight;

// Create the writable store with the initial state
const { subscribe, update, set } = writable<CanvasViewState>({
    width: initialWidth,
    height: initialHeight,
    scale: 1, // Initial zoom is 100%
    offsetX: 0, // Initial offset is 0, 0
    offsetY: 0
});

// Helper function to clamp zoom level within min/max bounds
function clampZoom(scale: number): number {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
}

// Helper function to calculate centering offsets (used for reset zoom)
// Adjusts for ruler size
function calculateCenteringOffsets(contentWidth: number, contentHeight: number, viewportWidth: number, viewportHeight: number): { offsetX: number; offsetY: number } {
    const effectiveViewportWidth = viewportWidth - RULER_SIZE;
    const effectiveViewportHeight = viewportHeight - RULER_SIZE;

    let offsetX = (effectiveViewportWidth - contentWidth) / 2;
    let offsetY = (effectiveViewportHeight - contentHeight) / 2;

    // Ensure offset includes the ruler area
    offsetX = Math.max(RULER_SIZE, offsetX);
    offsetY = Math.max(RULER_SIZE, offsetY);


    // Or, alternative perspective: calculate center based on full viewport, then shift by ruler?
    // Let's stick to calculating based on drawable area for now, seems more direct.
    return { offsetX, offsetY };

}


// === Store Actions / Setters ===

// Action to set the canvas width and height
function setCanvasDimensions(width: number, height: number) {
    update((state) => {
        // Ensure minimum dimensions (e.g., 100px)
        const newWidth = Math.max(100, width);
        const newHeight = Math.max(100, height);

        // When custom size is set manually, update the 'Custom' preset to remember it
        standardSizes.Custom.width = newWidth;
        standardSizes.Custom.height = newHeight;


        return { ...state, width: newWidth, height: newHeight };
    });
}

// Action to set the scale and offset directly
function setCanvasTransform(scale: number, offsetX: number, offsetY: number) {
    update((state) => ({
        ...state,
        scale: clampZoom(scale),
        offsetX,
        offsetY
    }));
}

// Action to set just the offset
function setCanvasOffset(offsetX: number, offsetY: number) {
    update((state) => ({
        ...state,
        offsetX,
        offsetY
    }));
}

// Action to set just the scale, clamping it
function setCanvasScale(newScale: number) {
    update((state) => ({
        ...state,
        scale: clampZoom(newScale)
    }));
}

// Action to reset zoom to 100% and center the canvas (needs viewport dimensions)
function resetZoom(viewportWidth: number, viewportHeight: number) {
    update((state) => {
        const newScale = 1;
        const contentWidth = state.width * newScale;
        const contentHeight = state.height * newScale;

        const { offsetX, offsetY } = calculateCenteringOffsets(contentWidth, contentHeight, viewportWidth, viewportHeight);

        return {
            ...state,
            scale: newScale,
            offsetX,
            offsetY
        };
    });
}

// Simple actions to zoom in/out by a fixed increment
function zoomIn() {
    update((state) => ({
        ...state,
        scale: clampZoom(state.scale + 0.1) // Increase scale by 0.1
    }));
}

function zoomOut() {
    update((state) => ({
        ...state,
        scale: clampZoom(state.scale - 0.1) // Decrease scale by 0.1
    }));
}

// Action to adjust zoom relative to a point (e.g., mouse cursor)
// delta is the scroll delta, centerX/centerY is the viewport coordinate
function adjustZoom(delta: number, centerX: number, centerY: number) {
    update((state) => {
        // Calculate the new scale factor based on delta and sensitivity
        const zoomFactor = Math.exp(-delta * ZOOM_SENSITIVITY);
        const newScale = clampZoom(state.scale * zoomFactor);

        // If scale didn't change (e.g., already at min/max), do nothing
        if (newScale === state.scale) {
            return state;
        }

        // Calculate the canvas coordinates under the cursor *before* the zoom
        const mouseX_Canvas_PreZoom = (centerX - state.offsetX) / state.scale;
        const mouseY_Canvas_PreZoom = (centerY - state.offsetY) / state.scale;

        // Calculate the new offsets required to keep the point under the cursor
        const newOffsetX = centerX - mouseX_Canvas_PreZoom * newScale;
        const newOffsetY = centerY - mouseY_Canvas_PreZoom * newScale;

        return {
            ...state,
            scale: newScale,
            offsetX: newOffsetX,
            offsetY: newOffsetY
        };
    });
}


// Expose store and actions
export const canvasViewStore = {
    subscribe,
    setCanvasDimensions,
    setCanvasTransform,
    setCanvasOffset,
    setCanvasScale,
    resetZoom,
    zoomIn,
    zoomOut,
    adjustZoom
};