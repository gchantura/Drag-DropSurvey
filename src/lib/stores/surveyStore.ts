"use client"

import { v4 as uuid } from "uuid"
import { writable, get } from "svelte/store"
import type { ComponentType, SurveyComponent, ExportFormat, ExportSettings } from "$lib/types/survey.ts"

export const componentsStore = writable<SurveyComponent[]>([])
export const exportSettingsStore = writable<ExportSettings>({
    format: "html",
    includeStyles: true,
    includeValidation: true,
    includeFramework: false,
    minify: false,
    splitFiles: false,
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
            // New properties with defaults
            rotation: 0,
            scale: 1,
            animation: "none",
            animationDuration: 1,
            zIndex: 10,
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

// Generate CSS for the survey
function generateSurveyCSS(settings: ExportSettings): string {
    let css = `/* Survey Form Styles */
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"], textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox-group, .radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section {
  border-top: 3px solid #3b82f6;
  padding-top: 10px;
  margin-top: 30px;
}

.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.introduction {
  background-color: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.required {
  color: #e11d48;
}

.help-text {
  font-size: 0.8em;
  color: #6b7280;
  margin-top: 4px;
}

button[type="submit"] {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #2563eb;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
}

.matrix-table th, .matrix-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.matrix-table th {
  background-color: #f3f4f6;
}

.rating {
  display: flex;
  gap: 8px;
}

.rating input[type="radio"] {
  display: none;
}

.rating label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.rating input[type="radio"]:checked + label {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.file-attachment {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9fafb;
}

/* Validation styles */
.invalid {
  border-color: #e11d48 !important;
  background-color: rgba(225, 29, 72, 0.05);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
}
`

    if (settings.minify) {
        // Basic minification
        css = css
            .replace(/\s+/g, " ")
            .replace(/\/\*.*?\*\//g, "")
            .replace(/\s*{\s*/g, "{")
            .replace(/\s*}\s*/g, "}")
            .replace(/\s*:\s*/g, ":")
            .replace(/\s*;\s*/g, ";")
            .replace(/;\}/g, "}")
            .trim()
    }

    return css
}

// Generate JavaScript for the survey
function generateSurveyJS(settings: ExportSettings): string {
    let js = `// Survey Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('survey-form');
  
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Collect form data
    const formData = new FormData(this);
    const formValues = {};
    
    for (let [key, value] of formData.entries()) {
      formValues[key] = value;
    }
    
    console.log('Form submitted:', formValues);
    
    // Here you would typically send the data to a server
    alert('Form submitted successfully!');
  });
  
  // Add validation for required fields
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.addEventListener('invalid', function(event) {
      if (!field.validity.valid) {
        field.classList.add('invalid');
      }
    });
    
    field.addEventListener('input', function(event) {
      if (field.validity.valid) {
        field.classList.remove('invalid');
      }
    });
  });
});
`

    if (settings.minify) {
        // Basic minification
        js = js
            .replace(/\s+/g, " ")
            .replace(/\/\/.*?\n/g, "")
            .replace(/\s*{\s*/g, "{")
            .replace(/\s*}\s*/g, "}")
            .replace(/\s*:\s*/g, ":")
            .replace(/\s*;\s*/g, ";")
            .replace(/;\s*}/g, "}")
            .trim()
    }

    return js
}

// Generate HTML for the survey
function generateSurveyHTML(settings: ExportSettings): string {
    const components = get(componentsStore)

    // Sort components by y position to maintain logical order
    const sortedComponents = [...components].sort((a, b) => a.y - b.y)

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey Form</title>
`

    if (settings.includeStyles) {
        if (settings.splitFiles) {
            html += `  <link rel="stylesheet" href="survey-styles.css">\n`
        } else {
            html += `  <style>\n`
            html += generateSurveyCSS(settings)
                .split("\n")
                .map((line) => `    ${line}`)
                .join("\n")
            html += `\n  </style>\n`
        }
    }

    html += `</head>
<body>
  <form id="survey-form">
`

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
                component.options?.forEach((option, index) => {
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
                component.options?.forEach((option, index) => {
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
                component.options?.forEach((option) => {
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
                html += `      <table class="matrix-table">\n`
                html += `        <thead>\n`
                html += `          <tr>\n`
                html += `            <th></th>\n`
                component.columns?.forEach((column) => {
                    html += `            <th>${column}</th>\n`
                })
                html += `          </tr>\n`
                html += `        </thead>\n`
                html += `        <tbody>\n`
                component.rows?.forEach((row, rowIndex) => {
                    html += `          <tr>\n`
                    html += `            <td>${row}</td>\n`
                    component.columns?.forEach((column, colIndex) => {
                        html += `            <td><input type="radio" name="matrix-${component.id}-${rowIndex}" value="${column}" ${component.required && colIndex === 0 ? "required" : ""}></td>\n`
                    })
                    html += `          </tr>\n`
                })
                html += `        </tbody>\n`
                html += `      </table>\n`
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break

            case "fileAttachment":
                html += `    <div class="form-group">\n`
                html += `      <label>${component.label} ${requiredMark}</label>\n`
                if (component.src) {
                    html += `      <div class="file-attachment">\n`
                    html += `        <a href="${component.src}" target="_blank" download>Download Attached File</a>\n`
                    html += `      </div>\n`
                } else {
                    html += `      <div class="file-attachment">No file attached</div>\n`
                }
                html += `      ${helpText}\n`
                html += `    </div>\n`
                break
        }
    })

    html += `    <div class="form-group">\n`
    html += `      <button type="submit">Submit</button>\n`
    html += `    </div>\n`
    html += `  </form>\n`

    if (settings.includeValidation) {
        if (settings.splitFiles) {
            html += `  <script src="survey-script.js"></script>\n`
        } else {
            html += `  <script>\n`
            html += generateSurveyJS(settings)
                .split("\n")
                .map((line) => `    ${line}`)
                .join("\n")
            html += `\n  </script>\n`
        }
    }

    html += `</body>\n</html>`

    if (settings.minify) {
        // Basic minification
        html = html.replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/\s+>/g, ">").replace(/<\s+/g, "<").trim()
    }

    return html
}

// Generate React code for the survey
function generateReactCode(settings: ExportSettings): string {
    const components = get(componentsStore)

    // Sort components by y position to maintain logical order
    const sortedComponents = [...components].sort((a, b) => a.y - b.y)

    let reactCode = `import React, { useState } from "react";

export default function SurveyForm() {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to a server
    alert("Form submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="survey-form">
`

    sortedComponents.forEach((component, index) => {
        const requiredMark = component.required ? '<span className="required">*</span>' : ""
        const helpText = component.helpText ? `<div className="help-text">${component.helpText}</div>` : ""

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
                reactCode += `        <label htmlFor="input-${component.id}">${component.label} {${requiredMark}}</label>\n`
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
                reactCode += `        <label htmlFor="textarea-${component.id}">${component.label} {${requiredMark}}</label>\n`
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
                reactCode += `        <label>${component.label} {${requiredMark}}</label>\n`
                reactCode += `        <div className="checkbox-group">\n`
                component.options?.forEach((option, optionIndex) => {
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
                reactCode += `        <label>${component.label} {${requiredMark}}</label>\n`
                reactCode += `        <div className="radio-group">\n`
                component.options?.forEach((option, optionIndex) => {
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
                reactCode += `        <label htmlFor="select-${component.id}">${component.label} {${requiredMark}}</label>\n`
                reactCode += `        <select\n`
                reactCode += `          id="select-${component.id}"\n`
                reactCode += `          name="select-${component.id}"\n`
                reactCode += `          value={formData[\`select-${component.id}\`] || ""}\n`
                reactCode += `          onChange={handleChange}\n`
                reactCode += `          ${component.required ? "required" : ""}\n`
                reactCode += `        >\n`
                reactCode += `          <option value="" disabled>-- Select --</option>\n`
                component.options?.forEach((option, optionIndex) => {
                    reactCode += `          <option key={\`option-${index}-${optionIndex}\`} value="${option}">${option}</option>\n`
                })
                reactCode += `        </select>\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break

            case "rating":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label>${component.label} {${requiredMark}}</label>\n`
                reactCode += `        <div className="rating">\n`
                for (let i = 1; i <= (component.maxRating || 5); i++) {
                    reactCode += `          <div key={\`rating-${component.id}-${i}\`}>\n`
                    reactCode += `            <input\n`
                    reactCode += `              type="radio"\n`
                    reactCode += `              id="rating-${component.id}-${i}"\n`
                    reactCode += `              name="rating-${component.id}"\n`
                    reactCode += `              value="${i}"\n`
                    reactCode += `              checked={formData[\`rating-${component.id}\`] === "${i}"}\n`
                    reactCode += `              onChange={handleChange}\n`
                    reactCode += `              ${component.required ? "required" : ""}\n`
                    reactCode += `            />\n`
                    reactCode += `            <label htmlFor="rating-${component.id}-${i}">${i}</label>\n`
                    reactCode += `          </div>\n`
                }
                reactCode += `        </div>\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break

            case "matrix":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label>${component.label} {${requiredMark}}</label>\n`
                reactCode += `        <table className="matrix-table">\n`
                reactCode += `          <thead>\n`
                reactCode += `            <tr>\n`
                reactCode += `              <th></th>\n`
                component.columns?.forEach((column, colIndex) => {
                    reactCode += `              <th key={\`col-${colIndex}\`}>${column}</th>\n`
                })
                reactCode += `            </tr>\n`
                reactCode += `          </thead>\n`
                reactCode += `          <tbody>\n`
                component.rows?.forEach((row, rowIndex) => {
                    reactCode += `            <tr key={\`row-${rowIndex}\`}>\n`
                    reactCode += `              <td>${row}</td>\n`
                    component.columns?.forEach((column, colIndex) => {
                        reactCode += `              <td key={\`cell-${rowIndex}-${colIndex}\`}>\n`
                        reactCode += `                <input\n`
                        reactCode += `                  type="radio"\n`
                        reactCode += `                  name={\`matrix-${component.id}-${rowIndex}\`}\n`
                        reactCode += `                  value="${column}"\n`
                        reactCode += `                  checked={formData[\`matrix-${component.id}-${rowIndex}\`] === "${column}"}\n`
                        reactCode += `                  onChange={handleChange}\n`
                        reactCode += `                  ${component.required && colIndex === 0 ? "required" : ""}\n`
                        reactCode += `                />\n`
                        reactCode += `              </td>\n`
                    })
                    reactCode += `            </tr>\n`
                })
                reactCode += `          </tbody>\n`
                reactCode += `        </table>\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break

            case "fileUpload":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label htmlFor="file-${component.id}">${component.label} {${requiredMark}}</label>\n`
                reactCode += `        <input\n`
                reactCode += `          type="file"\n`
                reactCode += `          id="file-${component.id}"\n`
                reactCode += `          name="file-${component.id}"\n`
                reactCode += `          accept="${component.acceptedFileTypes || "*"}"\n`
                reactCode += `          onChange={handleChange}\n`
                reactCode += `          ${component.required ? "required" : ""}\n`
                reactCode += `        />\n`
                reactCode += `        <div className="help-text">Max file size: ${component.maxFileSize || 5}MB</div>\n`
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break

            case "fileAttachment":
                reactCode += `      <div className="form-group">\n`
                reactCode += `        <label>${component.label} {${requiredMark}}</label>\n`
                if (component.src) {
                    reactCode += `        <div className="file-attachment">\n`
                    reactCode += `          <a href="${component.src}" target="_blank" rel="noopener noreferrer" download>Download Attached File</a>\n`
                    reactCode += `        </div>\n`
                } else {
                    reactCode += `        <div className="file-attachment">No file attached</div>\n`
                }
                reactCode += `        ${helpText}\n`
                reactCode += `      </div>\n`
                break
        }
    })

    reactCode += `      <div className="form-group">\n`
    reactCode += `        <button type="submit">Submit</button>\n`
    reactCode += `      </div>\n`
    reactCode += `    </form>\n`
    reactCode += `  );\n`
    reactCode += `}\n`

    if (settings.minify) {
        // Basic minification
        reactCode = reactCode
            .replace(/\s+/g, " ")
            .replace(/\/\/.*?\n/g, "")
            .replace(/\s*{\s*/g, "{")
            .replace(/\s*}\s*/g, "}")
            .replace(/\s*:\s*/g, ":")
            .replace(/\s*;\s*/g, ";")
            .replace(/;\s*}/g, "}")
            .trim()
    }

    return reactCode
}

// Export survey as code
export function exportSurveyAsCode(
    format: ExportFormat,
    settings: ExportSettings,
): { files: { name: string; content: string }[] } {
    const files: { name: string; content: string }[] = []

    switch (format) {
        case "html":
            if (settings.splitFiles) {
                // Generate separate HTML, CSS, and JS files
                files.push({ name: "index.html", content: generateSurveyHTML({ ...settings, splitFiles: true }) })

                if (settings.includeStyles) {
                    files.push({ name: "survey-styles.css", content: generateSurveyCSS(settings) })
                }

                if (settings.includeValidation) {
                    files.push({ name: "survey-script.js", content: generateSurveyJS(settings) })
                }
            } else {
                // Generate a single HTML file with embedded CSS and JS
                files.push({ name: "survey.html", content: generateSurveyHTML(settings) })
            }
            break

        case "react":
            files.push({ name: "SurveyForm.jsx", content: generateReactCode(settings) })

            if (settings.includeStyles && settings.splitFiles) {
                files.push({ name: "survey-styles.css", content: generateSurveyCSS(settings) })
            }
            break

        case "json":
            files.push({
                name: "survey-data.json",
                content: JSON.stringify(get(componentsStore), null, 2),
            })
            break

        default:
            files.push({
                name: "survey-data.json",
                content: JSON.stringify(get(componentsStore), null, 2),
            })
    }

    return { files }
}
