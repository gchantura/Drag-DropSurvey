export type ComponentType =
    | "text"
    | "input"
    | "textarea"
    | "checkbox"
    | "radio"
    | "dropdown"
    | "fileAttachment"
    | "fileUpload"
    | "section"
    | "title"
    | "introduction"
    | "matrix"
    | "rating"

export interface SurveyComponent {
    id: string
    type: ComponentType
    label: string
    x: number
    y: number
    width: number
    height: number
    fontSize?: number
    fontFamily?: string
    color?: string
    bgColor?: string
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    borderStyle?: string
    padding?: number
    margin?: number
    textAlign?: string
    fontWeight?: string
    fontStyle?: string
    textDecoration?: string
    opacity?: number
    boxShadow?: string
    rotation?: number
    scale?: number
    animation?: "none" | "fade" | "slide" | "bounce" | "pulse" | "spin"
    animationDuration?: number
    zIndex?: number
    required?: boolean
    placeholder?: string
    helpText?: string
    validationPattern?: string
    validationMessage?: string
    options?: string[]
    description?: string
    src?: string
    maxRating?: number
    acceptedFileTypes?: string
    maxFileSize?: number
    columns?: string[]
    rows?: string[]
    startX?: number
    startY?: number
}

export type ExportFormat = "html" | "json" | "react" | "vue" | "angular"

export interface ExportSettings {
    format: ExportFormat
    includeStyles: boolean
    includeValidation: boolean
    includeFramework: boolean
    minify: boolean
    splitFiles: boolean
}
export interface Survey {
    id: string
    title: string
    description: string
    components: SurveyComponent[]
    exportSettings: ExportSettings
}
export interface SurveyState {
    surveys: Survey[]
    selectedSurveyId: string | null
    selectedComponentId: string | null
    selectedComponentType: ComponentType | null
    selectedComponent: SurveyComponent | null
    selectedComponentIndex: number | null
    selectedComponentPosition: { x: number; y: number } | null
    selectedComponentSize: { width: number; height: number } | null
    selectedComponentStyles: {
        [key: string]: string | number | boolean | undefined
    }
    selectedComponentOptions: string[] | null
    selectedComponentDescription: string | null
    selectedComponentValidation: {
        pattern: string | null
        message: string | null
    }
    selectedComponentFile: {
        acceptedFileTypes: string | null
        maxFileSize: number | null
    }
    selectedComponentMatrix: {
        columns: string[] | null
        rows: string[] | null
    }
    selectedComponentRating: {
        maxRating: number | null
    }
}
