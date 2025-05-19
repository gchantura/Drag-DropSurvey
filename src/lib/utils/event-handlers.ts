// src/lib/utils/event-handlers.ts
import type { SurveyComponent } from "$lib/types/types.ts";

export type DragHandlerConfig = {
    onStart: (event: MouseEvent, data?: any) => void;
    onDrag: (event: MouseEvent, data?: any) => void;
    onEnd: (event: MouseEvent, data?: any) => void;
    threshold?: number;
    button?: number;
    preventDefault?: boolean;
    data?: any;
};

export function createDragHandler(config: DragHandlerConfig) {
    const {
        onStart,
        onDrag,
        onEnd,
        threshold = 5,
        button = 0,
        preventDefault = true,
        data = null
    } = config;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let thresholdMet = false;

    function handleMouseDown(event: MouseEvent) {
        if (event.button !== button) return;
        if (preventDefault) event.preventDefault();

        isDragging = true;
        thresholdMet = false;
        startX = event.clientX;
        startY = event.clientY;

        onStart(event, data);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;

        if (!thresholdMet) {
            const dx = Math.abs(event.clientX - startX);
            const dy = Math.abs(event.clientY - startY);
            if (dx > threshold || dy > threshold) {
                thresholdMet = true;
            } else {
                return;
            }
        }

        if (preventDefault) event.preventDefault();
        onDrag(event, data);
    }

    function handleMouseUp(event: MouseEvent) {
        if (!isDragging) return;

        isDragging = false;
        if (preventDefault) event.preventDefault();

        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        onEnd(event, data);
    }

    return {
        handleMouseDown,
        destroy() {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    };
}

export function createResizeHandler(component: SurveyComponent, onResize: (width: number, height: number) => void) {
    return createDragHandler({
        onStart: (event) => {
            // Store initial dimensions
            component.startX = component.width;
            component.startY = component.height;
        },
        onDrag: (event) => {
            if (!component.startX || !component.startY) return;

            const dx = event.clientX - event.clientX + (event.movementX || 0);
            const dy = event.clientY - event.clientY + (event.movementY || 0);

            const newWidth = Math.max(20, component.startX + dx);
            const newHeight = Math.max(20, component.startY + dy);

            onResize(newWidth, newHeight);
        },
        onEnd: () => {
            // Clean up if needed
        }
    });
}

export function createPanHandler(onPan: (dx: number, dy: number) => void) {
    let lastX = 0;
    let lastY = 0;

    return createDragHandler({
        onStart: (event) => {
            lastX = event.clientX;
            lastY = event.clientY;
            document.body.style.cursor = 'grabbing';
        },
        onDrag: (event) => {
            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;

            lastX = event.clientX;
            lastY = event.clientY;

            onPan(dx, dy);
        },
        onEnd: () => {
            document.body.style.cursor = '';
        }
    });
}

export function calculateMousePosition(clientX: number, clientY: number, element: HTMLElement) {
    if (!element) return { x: 0, y: 0 };

    const rect = element.getBoundingClientRect();
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}