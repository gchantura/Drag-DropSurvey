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
    options: string[]; // For checkbox, radio, dropdown
    description?: string; // For section, introduction
    src?: string; // For fileAttachment (image source)
    maxRating?: number; // For rating
    acceptedFileTypes?: string; // For fileUpload
    maxFileSize?: number; // For fileUpload (in MB)
    columns: string[]; // For matrix rows
    rows: string[]; // For matrix columns

    // Internal state used during interactions (e.g., drag/resize)
    startX?: number; // Represents starting X for multi-drag OR starting width for resize
    startY?: number; // Represents starting Y for multi-drag OR starting height for resize
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