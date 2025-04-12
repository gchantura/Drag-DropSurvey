// lib/types/survey.ts
export type ComponentType = 'text' | 'input' | 'textarea' | 'checkbox' | 'radio' | 'dropdown' | 'file'

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
    options: string[];
    // File specific properties
    multiple?: boolean;
    accept?: string;
}