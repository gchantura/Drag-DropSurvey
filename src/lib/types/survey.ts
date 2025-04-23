// src/lib/types/survey.ts

/**
 * Defines the possible types for a survey component.
 */
export type ComponentType =
    | 'text'
    | 'input'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'dropdown'
    | 'fileAttachment'
    | 'fileUpload'
    | 'section'
    | 'title'
    | 'introduction'
    | 'matrix'
    | 'rating';

/**
 * Represents a single component within the survey canvas.
 */
export interface SurveyComponent {
    // Core properties
    id: string;
    type: ComponentType;
    label: string;

    // Positioning and dimensions (in canvas pixels)
    x: number;
    y: number;
    width: number;
    height: number;

    // Styling properties
    fontSize: number;
    fontFamily: string;
    color: string;
    bgColor: string;

    // Common field properties
    required: boolean;

    // Type-specific properties
    options?: string[]; // For checkbox, radio, dropdown - Made optional as not all types have it
    description?: string; // For section, introduction
    src?: string; // For fileAttachment (image source)
    maxRating?: number; // For rating
    acceptedFileTypes?: string; // For fileUpload
    maxFileSize?: number; // For fileUpload (in MB)
    columns?: string[]; // For matrix columns (clarified usage)
    rows?: string[]; // For matrix rows (clarified usage)

    // Internal state used during interactions (e.g., drag/resize)
    // Represents starting width/height for resize operations
    // Not strictly needed for multi-drag as initial positions are stored separately
    startX?: number;
    startY?: number;
}

/**
 * Represents the state of the rectangular selection box used for multi-select.
 * Coordinates are relative to the unscaled canvas.
 */
export type SelectionBox = {
    active: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
};

/**
 * Represents the state when a horizontal or vertical guide is being dragged.
 * `null` when no guide is being dragged.
 */
export type DraggingGuide = {
    direction: 'horizontal' | 'vertical';
    index: number; // Index within the horizontalGuides or verticalGuides array
} | null;