// lib/types/survey.ts
export type ComponentType =
    'text' |
    'input' |
    'textarea' |
    'checkbox' |
    'radio' |
    'dropdown' |
    'fileAttachment' |
    'fileUpload' |
    'section' |
    'title' |
    'introduction' |
    'matrix' |
    'rating';

export interface SurveyComponent {
    startX?: number;
    startY?: number;
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
    options: string[];
    description?: string;
    src?: string;
    maxRating?: number;
    acceptedFileTypes?: string;
    maxFileSize?: number; // In MB
    columns: any;
    rows: any;
}