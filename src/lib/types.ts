export type SurveyComponent = {
    id: string;
    type: 'text' | 'input' | 'checkbox' | 'radio' | 'dropdown';
    label?: string;
    options?: string[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
};