// First, ensure the SelectionBox and DraggingGuide types are properly exported
export type SelectionBox = {
    active: boolean
    startX: number
    startY: number
    endX: number
    endY: number
    // Add these properties for compatibility with CanvasContent.svelte
    x?: number
    y?: number
    width?: number
    height?: number
    visible?: boolean
}

export type DraggingGuide = {
    direction: "horizontal" | "vertical"
    index: number
} | null

// Update the SurveyComponent interface to include all needed properties
export interface SurveyComponent {
    id: string
    type: ComponentType
    label: string
    x: number
    y: number
    width: number
    height: number
    fontSize: number
    fontFamily: string
    color: string
    bgColor: string
    required: boolean
    options?: string[]
    description?: string
    src?: string
    maxRating?: number
    acceptedFileTypes?: string
    maxFileSize?: number
    columns?: string[]
    rows?: string[] | number // Union type to support both matrix rows (string[]) and textarea rows (number)
    startX?: number
    startY?: number
    locked?: boolean
    customStyle?: Partial<ComponentStyle> // Allow components to override default styles
    placeholder?: string // Add placeholder for input/textarea/dropdown
    text?: string // Add text property for introduction components
    fontWeight?: string // Add fontWeight property
}

// Component Type definition
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

// Component styling interface
export interface ComponentStyle {
    backgroundColor: string
    backgroundOpacity: number
    backgroundGradient: boolean
    backgroundGradientStart: string
    backgroundGradientEnd: string
    backgroundGradientDirection: string
    borderRadius: string
    borderWidth: string
    borderColor: string
    borderStyle: string
    boxShadow: string
    fontFamily: string
    fontSize: string
    fontWeight: string
    color: string
    textAlign: string
    padding: string
    margin: string
    opacity: number
    transform: string
    transition: string
}

// Component-specific styling interfaces
export interface InputComponentStyle extends ComponentStyle {
    placeholderColor: string
    focusBorderColor: string
    errorColor: string
    labelFontSize: string
    labelFontWeight: string
}

export interface ButtonComponentStyle extends ComponentStyle {
    hoverBackgroundColor: string
    activeBackgroundColor: string
    hoverColor: string
    disabledOpacity: number
}

export interface ComponentStyleMap {
    default: ComponentStyle
    input: InputComponentStyle
    textarea: InputComponentStyle
    checkbox: ComponentStyle
    radio: ComponentStyle
    dropdown: InputComponentStyle
    fileUpload: ComponentStyle
    fileAttachment: ComponentStyle
    text: ComponentStyle
    title: ComponentStyle
    section: ComponentStyle
    introduction: ComponentStyle
    matrix: ComponentStyle
    rating: ComponentStyle
}
