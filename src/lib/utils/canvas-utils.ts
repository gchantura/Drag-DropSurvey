// src/lib/utils/canvas-utils.ts
import type { SurveyComponent } from "$lib/types/types.ts";

export function snapToGrid(value: number, gridSize: number, enableSnap: boolean): number {
    if (!enableSnap || gridSize <= 0 || isNaN(value)) return value;
    return Math.round(value / gridSize) * gridSize;
}

export function snapToGuides(
    value: number,
    guides: number[],
    threshold: number,
    scale: number,
    enableSnap: boolean
): number {
    if (!enableSnap || !guides.length || isNaN(value)) return value;

    for (const guide of guides) {
        if (Math.abs(value - guide) * scale < threshold) {
            return guide;
        }
    }

    return value;
}

export function isComponentInViewport(
    component: SurveyComponent,
    offsetX: number,
    offsetY: number,
    scale: number,
    viewportWidth: number,
    viewportHeight: number
): boolean {
    const compLeft = component.x * scale + offsetX;
    const compTop = component.y * scale + offsetY;
    const compRight = compLeft + component.width * scale;
    const compBottom = compTop + component.height * scale;

    return !(compRight < 0 || compLeft > viewportWidth || compBottom < 0 || compTop > viewportHeight);
}

export function getComponentsInSelectionBox(
    components: SurveyComponent[],
    selectionBox: { startX: number, startY: number, endX: number, endY: number }
): string[] {
    const { startX, startY, endX, endY } = selectionBox;
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    return components
        .filter(comp => {
            const centerX = comp.x + comp.width / 2;
            const centerY = comp.y + comp.height / 2;
            return centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY;
        })
        .map(comp => comp.id);
}

export function calculateCanvasMousePosition(
    clientX: number,
    clientY: number,
    viewportElement: HTMLElement,
    offsetX: number,
    offsetY: number,
    scale: number
): { x: number, y: number } {
    if (!viewportElement) return { x: 0, y: 0 };

    const viewportRect = viewportElement.getBoundingClientRect();
    const mouseX_VP = clientX - viewportRect.left;
    const mouseY_VP = clientY - viewportRect.top;

    if (scale === 0) return { x: 0, y: 0 };

    return {
        x: (mouseX_VP - offsetX) / scale,
        y: (mouseY_VP - offsetY) / scale
    };
}

export function getGridSize(units: 'cm' | 'inches' | 'px', PIXEL_PER_CM: number, PIXEL_PER_INCH: number): number {
    switch (units) {
        case 'cm':
            return PIXEL_PER_CM / 2;
        case 'inches':
            return PIXEL_PER_INCH / 4;
        case 'px':
            return 10;
        default:
            return PIXEL_PER_CM / 2;
    }
}