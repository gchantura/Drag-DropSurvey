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

export interface SurveyComponent {
    id: string;
    type: ComponentType;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    bgColor: string;
    required: boolean;
    options?: string[];
    description?: string;
    src?: string;
    maxRating?: number;
    acceptedFileTypes?: string;
    maxFileSize?: number;
    columns?: string[];
    rows?: string[];
    startX?: number;
    startY?: number;
}

export type SelectionBox = {
    active: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
};

export type DraggingGuide = {
    direction: 'horizontal' | 'vertical';
    index: number;
} | null;