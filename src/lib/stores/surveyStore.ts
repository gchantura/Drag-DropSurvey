"use client"

import { v4 as uuid } from "uuid"
import { writable, get } from "svelte/store"
import type { ComponentType, SurveyComponent, ExportFormat, ExportSettings } from "$lib/types/survey.ts" // Use standard path without .ts

export const componentsStore = writable<SurveyComponent[]>([])
export const exportSettingsStore = writable<ExportSettings>({
    format: "html",
    includeStyles: true,
    includeValidation: true,
    includeFramework: false,
    minify: false,
})

export function addComponent(type: ComponentType) {
    componentsStore.update((comps) => [
        ...comps,
        {
            id: uuid(),
            type,
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
            x: 50,
            y: 50,
            width: type === "section" || type === "title" || type === "introduction" ? 400 : 200,
            height: type === "textarea" || type === "matrix" || type === "section" ? 150 : 100,
            fontSize: 16,
            fontFamily: "Arial",
            color: "#000000",
            bgColor: "#FFFFFF",
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderStyle: "solid",
            padding: 8,
            margin: 0,
            textAlign: "left",
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
            boxShadow: "none",
            required: false,
            placeholder: type === "input" || type === "textarea" ? "Enter text..." : undefined,
            helpText: "",
            validationPattern: "",
            validationMessage: "",
            options: type === "checkbox" || type === "radio" || type === "dropdown" ? ["Option 1", "Option 2"] : [],
            description: type === "section" || type === "introduction" ? "Description..." : "",
            src: type === "fileAttachment" ? "" : undefined,
            maxRating: type === "rating" ? 5 : undefined,
            acceptedFileTypes: type === "fileUpload" ? ".pdf,.doc,.docx,.jpg,.png" : undefined,
            maxFileSize: type === "fileUpload" ? 5 : undefined,
            columns: type === "matrix" ? ["Column 1", "Column 2"] : [],
            rows: type === "matrix" ? ["Row 1", "Row 2"] : [],
            startX: 0,
            startY: 0,
        },
    ])
}
export function updateComponent(id: string, updates: Partial<SurveyComponent>) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id) {
                const { startX, startY, ...restUpdates } = updates
                return {
                    ...comp,
                    ...restUpdates,
                    startX: startX !== undefined ? startX : comp.startX,
                    startY: startY !== undefined ? startY : comp.startY,
                }
            }
            return comp
        })
    })
}
export function deleteComponent(id: string) {
    componentsStore.update((comps) => comps.filter((comp) => comp.id !== id))
}
export function duplicateComponent(id: string, positionUpdates: Partial<SurveyComponent> = {}): string {
    const components = get(componentsStore)
    const component = components.find((comp) => comp.id === id)
    if (!component) return ""
    const newId = uuid()
    const newComponent = {
        ...component,
        options: [...(component.options ?? [])],
        columns: [...(component.columns ?? [])],
        rows: [...(component.rows ?? [])],
        id: newId,
        x: (component.x ?? 0) + 20,
        y: (component.y ?? 0) + 20,
        ...positionUpdates,
        startX: 0,
        startY: 0,
    }
    componentsStore.update((comps) => [...comps, newComponent])
    return newId
}
export function addOption(id: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && Array.isArray(comp.options)) {
                return { ...comp, options: [...comp.options, `Option ${comp.options.length + 1}`] }
            }
            return comp
        })
    })
}
export function updateOption(id: string, index: number, value: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && Array.isArray(comp.options) && index >= 0 && index < comp.options.length) {
                const newOptions = [...comp.options]
                newOptions[index] = value
                return { ...comp, options: newOptions }
            }
            return comp
        })
    })
}
export function removeOption(id: string, index: number) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && Array.isArray(comp.options) && index >= 0 && index < comp.options.length) {
                const newOptions = [...comp.options]
                newOptions.splice(index, 1)
                return { ...comp, options: newOptions }
            }
            return comp
        })
    })
}
export function addRow(id: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === "matrix" && Array.isArray(comp.rows)) {
                return { ...comp, rows: [...comp.rows, `Row ${comp.rows.length + 1}`] }
            }
            return comp
        })
    })
}
export function updateRow(id: string, index: number, value: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (
                comp.id === id &&
                comp.type === "matrix" &&
                Array.isArray(comp.rows) &&
                index >= 0 &&
                index < comp.rows.length
            ) {
                const newRows = [...comp.rows]
                newRows[index] = value
                return { ...comp, rows: newRows }
            }
            return comp
        })
    })
}
export function removeRow(id: string, index: number) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (
                comp.id === id &&
                comp.type === "matrix" &&
                Array.isArray(comp.rows) &&
                index >= 0 &&
                index < comp.rows.length
            ) {
                const newRows = [...comp.rows]
                newRows.splice(index, 1)
                return { ...comp, rows: newRows }
            }
            return comp
        })
    })
}
export function addColumn(id: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (comp.id === id && comp.type === "matrix" && Array.isArray(comp.columns)) {
                return { ...comp, columns: [...comp.columns, `Column ${comp.columns.length + 1}`] }
            }
            return comp
        })
    })
}
export function updateColumn(id: string, index: number, value: string) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (
                comp.id === id &&
                comp.type === "matrix" &&
                Array.isArray(comp.columns) &&
                index >= 0 &&
                index < comp.columns.length
            ) {
                const newColumns = [...comp.columns]
                newColumns[index] = value
                return { ...comp, columns: newColumns }
            }
            return comp
        })
    })
}
export function removeColumn(id: string, index: number) {
    componentsStore.update((comps) => {
        return comps.map((comp) => {
            if (
                comp.id === id &&
                comp.type === "matrix" &&
                Array.isArray(comp.columns) &&
                index >= 0 &&
                index < comp.columns.length
            ) {
                const newColumns = [...comp.columns]
                newColumns.splice(index, 1)
                return { ...comp, columns: newColumns }
            }
            return comp
        })
    })
}
const STORAGE_KEY = "surveyBuilderData_v2"
export function saveSurvey() {
    if (typeof window !== "undefined" && window.localStorage) {
        try {
            const components = get(componentsStore)
            const surveyData = JSON.stringify(components)
            localStorage.setItem(STORAGE_KEY, surveyData)
            return true
        } catch (e) {
            console.error("Failed to save survey to localStorage:", e)
            return false
        }
    }
    return false
}
export function loadSurvey() {
    if (typeof window !== "undefined" && window.localStorage) {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)
                if (Array.isArray(parsedData)) {
                    componentsStore.set(parsedData)
                    return true
                } else {
                    console.error("Invalid survey data format found in localStorage.")
                    localStorage.removeItem(STORAGE_KEY)
                    return false
                }
            } catch (e) {
                console.error("Failed to parse saved survey data:", e)
                localStorage.removeItem(STORAGE_KEY)
                return false
            }
        }
    }
    return false
}
export function exportSurvey() {
    try {
        const components = get(componentsStore)
        const surveyData = JSON.stringify(components, null, 2)
        const blob = new Blob([surveyData], { type: "application/json;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `survey-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        return true
    } catch (e) {
        console.error("Failed to export survey:", e)
        return false
    }
}
export function importSurvey(jsonData: string): boolean {
    try {
        const components = JSON.parse(jsonData)
        if (Array.isArray(components)) {
            componentsStore.set(components)
            return true
        } else {
            console.error("Import failed: Invalid JSON format (expected an array).")
            return false
        }
    } catch (e) {
        console.error("Failed to import survey data:", e)
        return false
    }
}
export function clearSurvey() {
    componentsStore.set([])
    if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY)
    }
}

// Export code generation functions
export function generateHtmlExport(settings: ExportSettings): string {
    const components = get(componentsStore)
    let html =
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Survey Form</title>\n'

    if (settings.includeStyles) {
        html += "  <style>\n"
        html +=
            "    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }\n"
        html += "    .form-group { margin-bottom: 20px; }\n"
        html += "    label { display: block; margin-bottom: 5px; font-weight: bold; }\n"
        html +=
            '    input[type="text"], textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }\n'
        html += "    .checkbox-group, .radio-group { display: flex; flex-direction: column; gap: 8px; }\n"
        html += "    .section { border-top: 3px solid #3b82f6; padding-top: 10px; margin-top: 30px; }\n"
        html += "    .title { text-align: center; font-size: 24px; margin-bottom: 20px; }\n"
        html += "    .introduction { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n"
        html += "    .required { color: #e11d48; }\n"
        html += "    .help-text { font-size: 0.8em; color: #6b7280; margin-top: 4px; }\n"
        html +=
            '    button[type="submit"] { background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }\n'
        html += '    button[type="submit"]:hover { background-color: #2563eb; }\n'
        html += "  </style>\n"
    }

    html += "</head>\n<body>\n"
    html += '  <form id="survey-form">\n'

    // Sort components by y position to maintain logical order
    const sortedComponents = [...components].sort((a, b) => a.y - b.y)

    sortedComponents.forEach((component) => {
        const requiredMark = component.required ? '<span class="required">*</span>' : ""
        const helpText = component.helpText ? `<div class="help-text">${component.helpText}</div>` : ""

        switch (component.type) {
            case "title":
                html += `    <h1 class="title">${component.label}</h1>\n`
                break

            case "introduction":
                html += `    <div class="introduction">\n`
                html += `      <h2>${component.label}</h2>\n`
                html += `      <p>${component.description || ""}</p>\n`
                html += `    </div>\n`
                break

            case "section":
                html += `    <div class="section">\n`
                html += `      <h2>${component.label}</h2>\n`
                html += `      <p>${component.description || ""}</p>\n`
                html += `    </div>\n`
                break

            case "text":
                html += `    <div class="form-group">\n`
                html += `      <p>${component.label}</p>\n`
                html += `    </div>\n`
                break

            case "input":
                html += `    <div class="form-group">\n`
                html += `      <label for="input-${component.id}">${component.label} ${requiredMark}</label>\n`
                html += `      <input type="text" id="input-${component.id}" name="input-${component.id}" placeholder="${component.placeholder || ""}" ${component.required ? "required" : ""}>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break

            case "textarea":
                html += `    <div class="form-group">\n`
                html += `      <label for="textarea-${component.id}">${component.label} ${requiredMark}</label>\n`
                html += `      <textarea id="textarea-${component.id}" name="textarea-${component.id}" rows="5" placeholder="${component.placeholder || ""}" ${component.required ? "required" : ""}></textarea>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break

            case "checkbox":
                html += `    <div class="form-group">\n`
                html += `      <label>${component.label} ${requiredMark}</label>\n`
                html += `      <div class="checkbox-group">\n`
                component.options.forEach((option, index) => {
                    html += `        <div>\n`
                    html += `          <input type="checkbox" id="checkbox-${component.id}-${index}" name="checkbox-${component.id}" value="${option}">\n`
                    html += `          <label for="checkbox-${component.id}-${index}">${option}</label>\n`
                    html += `        </div>\n`
                })
                html += `      </div>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break

            case "radio":
                html += `    <div class="form-group">\n`
                html += `      <label>${component.label} ${requiredMark}</label>\n`
                html += `      <div class="radio-group">\n`
                component.options.forEach((option, index) => {
                    html += `        <div>\n`
                    html += `          <input type="radio" id="radio-${component.id}-${index}" name="radio-${component.id}" value="${option}" ${index === 0 && component.required ? "required" : ""}>\n`
                    html += `          <label for="radio-${component.id}-${index}">${option}</label>\n`
                    html += `        </div>\n`
                })
                html += `      </div>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break

            case "dropdown":
                html += `    <div class="form-group">\n`
                html += `      <label for="select-${component.id}">${component.label} ${requiredMark}</label>\n`
                html += `      <select id="select-${component.id}" name="select-${component.id}" ${component.required ? "required" : ""}>\n`
                html += `        <option value="" disabled selected>-- Select --</option>\n`
                component.options.forEach((option) => {
                    html += `        <option value="${option}">${option}</option>\n`
                })
                html += `      </select>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break

            case "fileUpload":
                html += `    <div class="form-group">\n`
                html += `      <label for="file-${component.id}">${component.label} ${requiredMark}</label>\n`
                html += `      <input type="file" id="file-${component.id}" name="file-${component.id}" accept="${component.acceptedFileTypes || "*"}" ${component.required ? "required" : ""}>\n`
                html += `      <div class="help-text">Max file size: ${component.maxFileSize || 5}MB</div>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break

            case "rating":
                html += `    <div class="form-group">\n`
                html += `      <label>${component.label} ${requiredMark}</label>\n`
                html += `      <div class="rating">\n`
                for (let i = 1; i <= (component.maxRating || 5); i++) {
                    html += `        <input type="radio" id="rating-${component.id}-${i}" name="rating-${component.id}" value="${i}" ${component.required ? "required" : ""}>\n`
                    html += `        <label for="rating-${component.id}-${i}">${i}</label>\n`
                }
                html += `      </div>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break

            case "matrix":
                html += `    <div class="form-group">\n`
                html += `      <label>${component.label} ${requiredMark}</label>\n`
                html += `      <table class="matrix">\n`
                html += `        <thead>\n`
                html += `          <tr>\n`
                html += `            <th></th>\n`
                component.columns.forEach((column) => {
                    html += `            <th>${column}</th>\n`
                })
                html += `          </tr>\n`
                html += `        </thead>\n`
                html += `        <tbody>\n`
                component.rows.forEach((row, rowIndex) => {
                    html += `          <tr>\n`
                    html += `            <td>${row}</td>\n`
                    component.columns.forEach((column, colIndex) => {
                        html += `            <td><input type="radio" name="matrix-${component.id}-${rowIndex}" value="${column}" ${component.required && colIndex === 0 ? "required" : ""}></td>\n`
                    })
                    html += `          </tr>\n`
                })
                html += `        </tbody>\n`
                html += `      </table>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break
        }
    })

    html += '    <div class="form-group">\n'
    html += '      <button type="submit">Submit</button>\n'
    html += "    </div>\n"
    html += "  </form>\n"

    if (settings.includeValidation) {
        html += "  <script>\n"
        html += '    document.getElementById("survey-form").addEventListener("submit", function(event) {\n'
        html += "      event.preventDefault();\n"
        html += "      // Collect form data\n"
        html += "      const formData = new FormData(this);\n"
        html += "      const formValues = {};\n"
        html += "      for (let [key, value] of formData.entries()) {\n"
        html += "        formValues[key] = value;\n"
        html += "      }\n"
        html += '      console.log("Form submitted:", formValues);\n'
        html += "      // Here you would typically send the data to a server\n"
        html += '      alert("Form submitted successfully!");\n'
        html += "    });\n"
        html += "  </script>\n"
    }

    html += "</body>\n</html>"

    if (settings.minify) {
        // Very basic minification
        html = html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim()
    }

    return html
}

export function generateReactExport(settings: ExportSettings): string {
    const components = get(componentsStore)
    let reactCode = ""

    // Import statements
    reactCode += 'import React, { useState } from "react";\n\n'

    // Form component
    reactCode += "export default function SurveyForm() {\n"
    reactCode += "  const [formData, setFormData] = useState({});\n\n"

    // Handle change function
    reactCode += "  const handleChange = (e) => {\n"
    reactCode += "    const { name, value, type, checked } = e.target;\n"
    reactCode += "    setFormData(prev => ({\n"
    reactCode += "      ...prev,\n"
    reactCode += '      [name]: type === "checkbox" ? checked : value\n'
    reactCode += "    }));\n"
    reactCode += "  };\n\n"

    // Handle submit function
    reactCode += "  const handleSubmit = (e) => {\n"
    reactCode += "    e.preventDefault();\n"
    reactCode += '    console.log("Form submitted:", formData);\n'
    reactCode += "    // Here you would typically send the data to a server\n"
    reactCode += '    alert("Form submitted successfully!");\n'
    reactCode += "  };\n\n"

    // Render function
    reactCode += "  return (\n"
    reactCode += '    <form onSubmit={handleSubmit} className="survey-form">\n'

    // Sort components by y position to maintain logical order
    const sortedComponents = [...components].sort((a, b) => a.y - b.y)

    sortedComponents.forEach((component, index) => {
        const requiredMark = component.required ? '<span className="required">*</span>' : ""
        const helpText = component.helpText
            ? `<div className="help-text">${component.helpText}</div>`
            : ""

        switch (component.type) {
            case "title":
                reactCode += `      <h1 className="title">${component.label}</h1>\n`
                break

            case "introduction":
                reactCode += `      <div className="introduction">\n`
                reactCode += `        <h2>${component.label}</h2>\n`
                reactCode += `        <p>${component.description || ""}</p>\n`
                reactCode += `      </div>\n`
                break

            case "section":
                reactCode += `      <div className="section">\n`
                reactCode += `        <h2>${component.label}</h2>\n`
                reactCode += `        <p>${component.description || ""}</p>\n`
                reactCode += `      </div>\n`
                break

            case "text":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <p>${component.label}</p>\n`
                reactCode += `      </div>\n`
                break

            case "input":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label htmlFor="input-${component.id}">${component.label} {requiredMark}</label>\n`
                reactCode += `        <input\n`
                reactCode += `          type="text"\n`
                reactCode += `          id="input-${component.id}"\n`
                reactCode += `          name="input-${component.id}"\n`
                reactCode += `          placeholder="${component.placeholder || ""}"\n`
                reactCode += `          value={formData[\`input-${component.id}\`] || ""}\n`
                reactCode += `          onChange={handleChange}\n`
                reactCode += `          ${component.required ? "required" : ""}\n`
                reactCode += `        />\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break

            case "textarea":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label htmlFor="textarea-${component.id}">${component.label} {requiredMark}</label>\n`
                reactCode += `        <textarea\n`
                reactCode += `          id="textarea-${component.id}"\n`
                reactCode += `          name="textarea-${component.id}"\n`
                reactCode += `          rows={5}\n`
                reactCode += `          placeholder="${component.placeholder || ""}"\n`
                reactCode += `          value={formData[\`textarea-${component.id}\`] || ""}\n`
                reactCode += `          onChange={handleChange}\n`
                reactCode += `          ${component.required ? "required" : ""}\n`
                reactCode += `        />\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break

            case "checkbox":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label>{component.label} {requiredMark}</label>\n`
                reactCode += `        <div className="checkbox-group">\n`
                component.options.forEach((option, optionIndex) => {
                    reactCode += `          <div key={\`checkbox-${index}-${optionIndex}\`}>\n`
                    reactCode += `            <input\n`
                    reactCode += `              type="checkbox"\n`
                    reactCode += `              id="checkbox-${component.id}-${optionIndex}"\n`
                    reactCode += `              name="checkbox-${component.id}-${optionIndex}"\n`
                    reactCode += `              value="${option}"\n`
                    reactCode += `              checked={formData[\`checkbox-${component.id}-${optionIndex}\`] || false}\n`
                    reactCode += `              onChange={handleChange}\n`
                    reactCode += `            />\n`
                    reactCode += `            <label htmlFor="checkbox-${component.id}-${optionIndex}">${option}</label>\n`
                    reactCode += `          </div>\n`
                })
                reactCode += `        </div>\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break

            case "radio":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label>{component.label} {requiredMark}</label>\n`
                reactCode += `        <div className="radio-group">\n`
                component.options.forEach((option, optionIndex) => {
                    reactCode += `          <div key={\`radio-${component.id}-${optionIndex}\`}>\n`
                    reactCode += `            <input\n`
                    reactCode += `              type="radio"\n`
                    reactCode += `              id="radio-${component.id}-${optionIndex}"\n`
                    reactCode += `              name="radio-${component.id}"\n`
                    reactCode += `              value="${option}"\n`
                    reactCode += `              checked={formData[\`radio-${component.id}\`] === "${option}"}\n`
                    reactCode += `              onChange={handleChange}\n`
                    reactCode += `              ${component.required ? "required" : ""}\n`
                    reactCode += `            />\n`
                    reactCode += `            <label htmlFor="radio-${component.id}-${optionIndex}">${option}</label>\n`
                    reactCode += `          </div>\n`
                })
                reactCode += `        </div>\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break

            case "dropdown":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label htmlFor="select-${component.id}">${component.label} {requiredMark}</label>\n`
                reactCode += `        <select\n`
                reactCode += `          id="select-${component.id}"\n`
                reactCode += `          name="select-${component.id}"\n`
                reactCode += `          value={formData[\`select-${component.id}\`] || ""}\n`
                reactCode += `          onChange={handleChange}\n`
                reactCode += `          ${component.required ? "required" : ""}\n`
                reactCode += `        >\n`
                reactCode += `          <option value="" disabled>-- Select --</option>\n`
                component.options.forEach((option, optionIndex) => {
                    reactCode += `          <option key={\`option-${index}-${optionIndex}\`} value="${option}">${option}</option>\n`
                })
                reactCode += `        </select>\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break
        }
    })

    reactCode += '      <div className="form-group">\n'
    reactCode += '        <button type="submit">Submit</button>\n'
    reactCode += "      </div>\n"
    reactCode += "    </form>\n"
    reactCode += "  );\n"
    reactCode += "}\n"

    if (settings.includeStyles) {
        reactCode += "\n// Add this CSS to your stylesheet\n"
        reactCode += "/*\n"
        reactCode +=
            ".survey-form { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }\n"
        reactCode += ".form-group { margin-bottom: 20px; }\n"
        reactCode += ".form-group label { display: block; margin-bottom: 5px; font-weight: bold; }\n"
        reactCode +=
            '.form-group input[type="text"], .form-group textarea, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }\n'
        reactCode += ".checkbox-group, .radio-group { display: flex; flex-direction: column; gap: 8px; }\n"
        reactCode += ".section { border-top: 3px solid #3b82f6; padding-top: 10px; margin-top: 30px; }\n"
        reactCode += ".title { text-align: center; font-size: 24px; margin-bottom: 20px; }\n"
        reactCode +=
            ".introduction { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n"
        reactCode += ".required { color: #e11d48; }\n"
        reactCode += ".help-text { font-size: 0.8em; color: #6b7280; margin-top: 4px; }\n"
        reactCode +=
            'button[type="submit"] { background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }\n'
        reactCode += 'button[type="submit"]:hover { background-color: #2563eb; }\n'
        reactCode += "*/\n"
    }

    return reactCode
}

export function generateVueExport(settings: ExportSettings): string {
    const components = get(componentsStore)
    let vueCode = ""

    vueCode += "<template>\n"
    vueCode += '  <form @submit.prevent="handleSubmit" class="survey-form">\n'

    // Sort components by y position to maintain logical order
    const sortedComponents = [...components].sort((a, b) => a.y - b.y)

    sortedComponents.forEach((component) => {
        const requiredMark = component.required ? '<span class="required">*</span>' : ""
        const helpText = component.helpText ? `<div class="help-text">${component.helpText}</div>` : ""

        switch (component.type) {
            case "title":
                vueCode += `    <h1 class="title">${component.label}</h1>\n`
                break

            case "introduction":
                vueCode += `    <div class="introduction">\n`
                vueCode += `      <h2>${component.label}</h2>\n`
                vueCode += `      <p>${component.description || ""}</p>\n`
                vueCode += `    </div>\n`
                break

            case "section":
                vueCode += `    <div class="section">\n`
                vueCode += `      <h2>${component.label}</h2>\n`
                vueCode += `      <p>${component.description || ""}</p>\n`
                vueCode += `    </div>\n`
                break

            case "text":
                vueCode += `    <div class="form-group">\n`
                vueCode += `      <p>${component.label}</p>\n`
                vueCode += `    </div>\n`
                break

            case "input":
                vueCode += `    <div class="form-group">\n`
                vueCode += `      <label for="input-${component.id}">${component.label} ${requiredMark}</label>\n`
                vueCode += `      <input\n`
                vueCode += `        type="text"\n`
                vueCode += `        id="input-${component.id}"\n`
                vueCode += `        v-model="formData['input-${component.id}']"\n`
                vueCode += `        placeholder="${component.placeholder || ""}"\n`
                vueCode += `        ${component.required ? "required" : ""}\n`
                vueCode += `      />\n`
                vueCode += `      ${helpText}\n`
                vueCode += `    </div>\n`
                break

            case "textarea":
                vueCode += `    <div class="form-group">\n`
                vueCode += `      <label for="textarea-${component.id}">${component.label} ${requiredMark}</label>\n`
                vueCode += `      <textarea\n`
                vueCode += `        id="textarea-${component.id}"\n`
                vueCode += `        v-model="formData['textarea-${component.id}']"\n`
                vueCode += `        rows="5"\n`
                vueCode += `        placeholder="${component.placeholder || ""}"\n`
                vueCode += `        ${component.required ? "required" : ""}\n`
                vueCode += `      ></textarea>\n`
                vueCode += `      ${helpText}\n`
                vueCode += `    </div>\n`
                break

            case "checkbox":
                vueCode += `    <div class="form-group">\n`
                vueCode += `      <label>${component.label} ${requiredMark}</label>\n`
                vueCode += `      <div class="checkbox-group">\n`
                component.options.forEach((option, index) => {
                    vueCode += `        <div>\n`
                    vueCode += `          <input\n`
                    vueCode += `            type="checkbox"\n`
                    vueCode += `            id="checkbox-${component.id}-${index}"\n`
                    vueCode += `            v-model="formData['checkbox-${component.id}-${index}']"\n`
                    vueCode += `            :value="true"\n`
                    vueCode += `          />\n`
                    vueCode += `          <label for="checkbox-${component.id}-${index}">${option}</label>\n`
                    vueCode += `        </div>\n`
                })
                vueCode += `      </div>\n`
                vueCode += `      ${helpText}\n`
                vueCode += `    </div>\n`
                break

            case "radio":
                vueCode += `    <div class="form-group">\n`
                vueCode += `      <label>${component.label} ${requiredMark}</label>\n`
                vueCode += `      <div class="radio-group">\n`
                component.options.forEach((option, index) => {
                    vueCode += `        <div>\n`
                    vueCode += `          <input\n`
                    vueCode += `            type="radio"\n`
                    vueCode += `            id="radio-${component.id}-${index}"\n`
                    vueCode += `            v-model="formData['radio-${component.id}']"\n`
                    vueCode += `            value="${option}"\n`
                    vueCode += `            ${component.required ? "required" : ""}\n`
                    vueCode += `          />\n`
                    vueCode += `          <label for="radio-${component.id}-${index}">${option}</label>\n`
                    vueCode += `        </div>\n`
                })
                vueCode += `      </div>\n`
                vueCode += `      ${helpText}\n`
                vueCode += `    </div>\n`
                break

            case "dropdown":
                vueCode += `    <div class="form-group">\n`
                vueCode += `      <label for="select-${component.id}">${component.label} ${requiredMark}</label>\n`
                vueCode += `      <select\n`
                vueCode += `        id="select-${component.id}"\n`
                vueCode += `        v-model="formData['select-${component.id}']"\n`
                vueCode += `        ${component.required ? "required" : ""}\n`
                vueCode += `      >\n`
                vueCode += `        <option value="" disabled>-- Select --</option>\n`
                component.options.forEach((option) => {
                    vueCode += `        <option value="${option}">${option}</option>\n`
                })
                vueCode += `      </select>\n`
                vueCode += `      ${helpText}\n`
                vueCode += `    </div>\n`
                break
        }
    })

    vueCode += '    <div class="form-group">\n'
    vueCode += '      <button type="submit">Submit</button>\n'
    vueCode += "    </div>\n"
    vueCode += "  </form>\n"
    vueCode += "</template>\n\n"

    vueCode += "<script>\n"
    vueCode += "export default {\n"
    vueCode += "  data() {\n"
    vueCode += "    return {\n"
    vueCode += "      formData: {}\n"
    vueCode += "    };\n"
    vueCode += "  },\n"
    vueCode += "  methods: {\n"
    vueCode += "    handleSubmit() {\n"
    vueCode += '      console.log("Form submitted:", this.formData);\n'
    vueCode += "      // Here you would typically send the data to a server\n"
    vueCode += '      alert("Form submitted successfully!");\n'
    vueCode += "    }\n"
    vueCode += "  }\n"
    vueCode += "};\n"
    vueCode += "</script>\n\n"

    if (settings.includeStyles) {
        vueCode += "<style>\n"
        vueCode +=
            ".survey-form { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }\n"
        vueCode += ".form-group { margin-bottom: 20px; }\n"
        vueCode += ".form-group label { display: block; margin-bottom: 5px; font-weight: bold; }\n"
        vueCode +=
            '.form-group input[type="text"], .form-group textarea, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }\n'
        vueCode += ".checkbox-group, .radio-group { display: flex; flex-direction: column; gap: 8px; }\n"
        vueCode += ".section { border-top: 3px solid #3b82f6; padding-top: 10px; margin-top: 30px; }\n"
        vueCode += ".title { text-align: center; font-size: 24px; margin-bottom: 20px; }\n"
        vueCode += ".introduction { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n"
        vueCode += ".required { color: #e11d48; }\n"
        vueCode += ".help-text { font-size: 0.8em; color: #6b7280; margin-top: 4px; }\n"
        vueCode +=
            'button[type="submit"] { background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }\n'
        vueCode += 'button[type="submit"]:hover { background-color: #2563eb; }\n'
        vueCode += "</style>\n"
    }

    return vueCode
}

export function generateAngularExport(settings: ExportSettings): string {
    const components = get(componentsStore)
    let angularCode = ""

    // Component TS file
    angularCode += "// survey-form.component.ts\n"
    angularCode += "import { Component } from '@angular/core';\n"
    angularCode += "import { FormBuilder, FormGroup, Validators } from '@angular/forms';\n\n"

    angularCode += "@Component({\n"
    angularCode += "  selector: 'app-survey-form',\n"
    angularCode += "  templateUrl: './survey-form.component.html',\n"
    if (settings.includeStyles) {
        angularCode += "  styleUrls: ['./survey-form.component.css']\n"
    }
    angularCode += "})\n"
    angularCode += "export class SurveyFormComponent {\n"
    angularCode += "  surveyForm: FormGroup;\n\n"

    angularCode += "  constructor(private fb: FormBuilder) {\n"
    angularCode += "    this.surveyForm = this.fb.group({\n"

    // Add form controls
    components.forEach((component) => {
        if (["input", "textarea", "dropdown", "radio"].includes(component.type)) {
            angularCode += `      '${component.type}-${component.id}': ['', ${component.required ? "Validators.required" : ""}],\n`
        }
    })

    angularCode += "    });\n"
    angularCode += "  }\n\n"

    angularCode += "  onSubmit() {\n"
    angularCode += "    if (this.surveyForm.valid) {\n"
    angularCode += "      console.log('Form submitted:', this.surveyForm.value);\n"
    angularCode += "      // Here you would typically send the data to a server\n"
    angularCode += "      alert('Form submitted successfully!');\n"
    angularCode += "    } else {\n"
    angularCode += "      // Mark all fields as touched to trigger validation display\n"
    angularCode += "      Object.keys(this.surveyForm.controls).forEach(key => {\n"
    angularCode += "        const control = this.surveyForm.get(key);\n"
    angularCode += "        control?.markAsTouched();\n"
    angularCode += "      });\n"
    angularCode += "    }\n"
    angularCode += "  }\n"
    angularCode += "}\n\n"

    // Component HTML file
    angularCode += "// survey-form.component.html\n"
    angularCode += '<form [formGroup]="surveyForm" (ngSubmit)="onSubmit()" class="survey-form">\n'

    // Sort components by y position to maintain logical order
    const sortedComponents = [...components].sort((a, b) => a.y - b.y)

    sortedComponents.forEach((component) => {
        const requiredMark = component.required ? '<span class="required">*</span>' : ""
        const helpText = component.helpText ? `<div class="help-text">${component.helpText}</div>` : ""

        switch (component.type) {
            case "title":
                angularCode += `  <h1 class="title">${component.label}</h1>\n`
                break

            case "introduction":
                angularCode += `  <div class="introduction">\n`
                angularCode += `    <h2>${component.label}</h2>\n`
                angularCode += `    <p>${component.description || ""}</p>\n`
                angularCode += `  </div>\n`
                break

            case "section":
                angularCode += `  <div class="section">\n`
                angularCode += `    <h2>${component.label}</h2>\n`
                angularCode += `    <p>${component.description || ""}</p>\n`
                angularCode += `  </div>\n`
                break

            case "text":
                angularCode += `  <div class="form-group">\n`
                angularCode += `    <p>${component.label}</p>\n`
                angularCode += `  </div>\n`
                break

            case "input":
                angularCode += `  <div class="form-group">\n`
                angularCode += `    <label for="input-${component.id}">${component.label} ${requiredMark}</label>\n`
                angularCode += `    <input\n`
                angularCode += `      type="text"\n`
                angularCode += `      id="input-${component.id}"\n`
                angularCode += `      formControlName="input-${component.id}"\n`
                angularCode += `      placeholder="${component.placeholder || ""}"\n`
                angularCode += `    />\n`
                angularCode += `    <div *ngIf="surveyForm.get('input-${component.id}')?.invalid && surveyForm.get('input-${component.id}')?.touched" class="error-message">\n`
                angularCode += `      This field is required\n`
                angularCode += `    </div>\n`
                angularCode += `    ${helpText}\n`
                angularCode += `  </div>\n`
                break

            case "textarea":
                angularCode += `  <div class="form-group">\n`
                angularCode += `    <label for="textarea-${component.id}">${component.label} ${requiredMark}</label>\n`
                angularCode += `    <textarea\n`
                angularCode += `      id="textarea-${component.id}"\n`
                angularCode += `      formControlName="textarea-${component.id}"\n`
                angularCode += `      rows="5"\n`
                angularCode += `      placeholder="${component.placeholder || ""}"\n`
                angularCode += `    ></textarea>\n`
                angularCode += `    <div *ngIf="surveyForm.get('textarea-${component.id}')?.invalid && surveyForm.get('textarea-${component.id}')?.touched" class="error-message">\n`
                angularCode += `      This field is required\n`
                angularCode += `    </div>\n`
                angularCode += `    ${helpText}\n`
                angularCode += `  </div>\n`
                break

            case "radio":
                angularCode += `  <div class="form-group">\n`
                angularCode += `    <label>${component.label} ${requiredMark}</label>\n`
                angularCode += `    <div class="radio-group">\n`
                component.options.forEach((option, index) => {
                    angularCode += `      <div>\n`
                    angularCode += `        <input\n`
                    angularCode += `          type="radio"\n`
                    angularCode += `          id="radio-${component.id}-${index}"\n`
                    angularCode += `          formControlName="radio-${component.id}"\n`
                    angularCode += `          value="${option}"\n`
                    angularCode += `        />\n`
                    angularCode += `        <label for="radio-${component.id}-${index}">${option}</label>\n`
                    angularCode += `      </div>\n`
                })
                angularCode += `    </div>\n`
                angularCode += `    <div *ngIf="surveyForm.get('radio-${component.id}')?.invalid && surveyForm.get('radio-${component.id}')?.touched" class="error-message">\n`
                angularCode += `      Please select an option\n`
                angularCode += `    </div>\n`
                angularCode += `    ${helpText}\n`
                angularCode += `  </div>\n`
                break

            case "dropdown":
                angularCode += `  <div class="form-group">\n`
                angularCode += `    <label for="select-${component.id}">${component.label} ${requiredMark}</label>\n`
                angularCode += `    <select\n`
                angularCode += `      id="select-${component.id}"\n`
                angularCode += `      formControlName="dropdown-${component.id}"\n`
                angularCode += `    >\n`
                angularCode += `      <option value="" disabled>-- Select --</option>\n`
                component.options.forEach((option) => {
                    angularCode += `      <option value="${option}">${option}</option>\n`
                })
                angularCode += `    </select>\n`
                angularCode += `    <div *ngIf="surveyForm.get('dropdown-${component.id}')?.invalid && surveyForm.get('dropdown-${component.id}')?.touched" class="error-message">\n`
                angularCode += `      Please select an option\n`
                angularCode += `    </div>\n`
                angularCode += `    ${helpText}\n`
                angularCode += `  </div>\n`
                break
        }
    })

    angularCode += '  <div class="form-group">\n'
    angularCode += '    <button type="submit">Submit</button>\n'
    angularCode += "  </div>\n"
    angularCode += "</form>\n\n"

    if (settings.includeStyles) {
        angularCode += "// survey-form.component.css\n"
        angularCode +=
            ".survey-form { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }\n"
        angularCode += ".form-group { margin-bottom: 20px; }\n"
        angularCode += ".form-group label { display: block; margin-bottom: 5px; font-weight: bold; }\n"
        angularCode +=
            '.form-group input[type="text"], .form-group textarea, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }\n'
        angularCode += ".checkbox-group, .radio-group { display: flex; flex-direction: column; gap: 8px; }\n"
        angularCode += ".section { border-top: 3px solid #3b82f6; padding-top: 10px; margin-top: 30px; }\n"
        angularCode += ".title { text-align: center; font-size: 24px; margin-bottom: 20px; }\n"
        angularCode +=
            ".introduction { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n"
        angularCode += ".required { color: #e11d48; }\n"
        angularCode += ".help-text { font-size: 0.8em; color: #6b7280; margin-top: 4px; }\n"
        angularCode += ".error-message { color: #e11d48; font-size: 0.8em; margin-top: 4px; }\n"
        angularCode +=
            'button[type="submit"] { background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }\n'
        angularCode += 'button[type="submit"]:hover { background-color: #2563eb; }\n'
    }

    return angularCode
}

export function exportSurveyAsCode(format: ExportFormat, settings: ExportSettings): string {
    switch (format) {
        case "html":
            return generateHtmlExport(settings)
        case "react":
            return generateReactExport(settings)
        case "vue":
            return generateVueExport(settings)
        case "angular":
            return generateAngularExport(settings)
        case "json":
        default:
            return JSON.stringify(get(componentsStore), null, 2)
    }
}
