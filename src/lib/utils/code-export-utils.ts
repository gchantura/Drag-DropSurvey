// src/lib/utils/code-export-utils.ts
import type { SurveyComponent } from "$lib/types/types"

/**
 * Generates HTML code for a component
 */
export function generateComponentHTML(component: SurveyComponent): string {
  switch (component.type) {
    case "text":
      return generateTextHTML(component)
    case "input":
      return generateInputHTML(component)
    case "textarea":
      return generateTextAreaHTML(component)
    case "checkbox":
      return generateCheckboxHTML(component)
    case "radio":
      return generateRadioHTML(component)
    case "dropdown":
      return generateDropdownHTML(component)
    case "fileAttachment":
      return generateFileAttachmentHTML(component)
    case "fileUpload":
      return generateFileUploadHTML(component)
    case "section":
      return generateSectionHTML(component)
    case "title":
      return generateTitleHTML(component)
    case "introduction":
      return generateIntroductionHTML(component)
    case "matrix":
      return generateMatrixHTML(component)
    case "rating":
      return generateRatingHTML(component)
    default:
      return `<!-- Unsupported component type: ${component.type} -->`
  }
}

/**
 * Generates CSS code for a component
 */
export function generateComponentCSS(component: SurveyComponent): string {
  const baseCSS = `
.component-${component.id} {
    position: relative;
    width: ${component.width}px;
    height: ${component.height}px;
    font-family: ${component.fontFamily || "Arial"};
    font-size: ${component.fontSize || 16}px;
    color: ${component.color || "#000000"};
    background-color: ${component.bgColor || "#FFFFFF"};
    padding: 8px;
    box-sizing: border-box;
}`

  // Add component-specific CSS
  switch (component.type) {
    case "section":
      return `${baseCSS}
.component-${component.id} .section-title {
    font-weight: bold;
    margin-bottom: 8px;
}
.component-${component.id} .section-divider {
    height: 2px;
    background-color: #3b82f6;
    margin-bottom: 8px;
}`
    case "title":
      return `${baseCSS}
.component-${component.id} h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    text-align: center;
}`
    case "introduction":
      return `${baseCSS}
.component-${component.id} {
    background-color: #f3f4f6;
    border-radius: 8px;
}
.component-${component.id} .intro-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 12px 0;
}`
    case "checkbox":
    case "radio":
      return `${baseCSS}
.component-${component.id} .options-list {
    list-style-type: none;
    padding: 0;
    margin: 8px 0 0 0;
}
.component-${component.id} .option-item {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
}
.component-${component.id} .option-item input {
    margin-right: 8px;
}`
    case "matrix":
      return `${baseCSS}
.component-${component.id} table {
    width: 100%;
    border-collapse: collapse;
}
.component-${component.id} th, 
.component-${component.id} td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}
.component-${component.id} th {
    background-color: #f5f5f5;
}`
    case "rating":
      return `${baseCSS}
.component-${component.id} .rating-stars {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}
.component-${component.id} .star {
    width: 40px;
    height: 40px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.component-${component.id} .star:hover {
    background: #f0f0f0;
}`
    default:
      return baseCSS
  }
}

/**
 * Generates JavaScript code for a component
 */
export function generateComponentJS(component: SurveyComponent): string {
  switch (component.type) {
    case "rating":
      return `
// JavaScript for Rating component ${component.id}
document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.component-${component.id} .star');
    let selectedRating = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStars();
        });
    });
    
    function updateStars() {
        stars.forEach((star, index) => {
            if (index < selectedRating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }
});`
    case "fileUpload":
      return `
// JavaScript for File Upload component ${component.id}
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-upload-${component.id}');
    const fileNameDisplay = document.getElementById('file-name-${component.id}');
    const errorMessage = document.getElementById('error-message-${component.id}');
    
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            
            // Check file size
            const maxSize = ${component.maxFileSize || 5} * 1024 * 1024; // Convert to bytes
            if (file.size > maxSize) {
                errorMessage.textContent = \`File size exceeds the maximum limit of ${component.maxFileSize || 5}MB\`;
                fileNameDisplay.textContent = 'No file chosen';
                this.value = '';
            } else {
                errorMessage.textContent = '';
                fileNameDisplay.textContent = file.name;
            }
        } else {
            fileNameDisplay.textContent = 'No file chosen';
        }
    });
});`
    case "dropdown":
      return `
// JavaScript for Dropdown component ${component.id}
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.getElementById('dropdown-${component.id}');
    
    dropdown.addEventListener('change', function() {
        console.log('Selected option:', this.value);
        // Add your custom logic here
    });
});`
    default:
      return `
// No specific JavaScript needed for ${component.type} component ${component.id}
// You can add custom event handlers here if needed`
  }
}

/**
 * Generates complete HTML document with CSS and JS for multiple components
 */
export function generateFullExport(components: SurveyComponent[]): { html: string; css: string; js: string } {
  let htmlContent = ""
  let cssContent = ""
  let jsContent = ""

  components.forEach((component) => {
    htmlContent += generateComponentHTML(component) + "\n\n"
    cssContent += generateComponentCSS(component) + "\n\n"
    const componentJS = generateComponentJS(component)
    if (componentJS.trim() !== "") {
      jsContent += componentJS + "\n\n"
    }
  })

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Survey Components</title>
    <style>
${cssContent}
    </style>
</head>
<body>
${htmlContent}
    <script>
${jsContent}
    </script>
</body>
</html>`

  return {
    html: htmlContent,
    css: cssContent,
    js: jsContent,
    fullHTML,
  }
}

// Helper functions for generating HTML for each component type
function generateTextHTML(component: SurveyComponent): string {
  return `<div class="component-${component.id}">
    <p>${component.label}</p>
</div>`
}

function generateInputHTML(component: SurveyComponent): string {
  return `<div class="component-${component.id}">
    <label for="input-${component.id}">${component.label}${component.required ? " *" : ""}</label>
    <input type="text" id="input-${component.id}" name="input-${component.id}" placeholder="Enter text...">
</div>`
}

function generateTextAreaHTML(component: SurveyComponent): string {
  return `<div class="component-${component.id}">
    <label for="textarea-${component.id}">${component.label}${component.required ? " *" : ""}</label>
    <textarea id="textarea-${component.id}" name="textarea-${component.id}" rows="5" placeholder="Leave a comment..."></textarea>
</div>`
}

function generateCheckboxHTML(component: SurveyComponent): string {
  const options = component.options || []
  const optionsHTML = options
    .map(
      (option, index) => `
        <li class="option-item">
            <input type="checkbox" id="checkbox-${component.id}-${index}" name="checkbox-${component.id}" value="${option}">
            <label for="checkbox-${component.id}-${index}">${option}</label>
        </li>`,
    )
    .join("")

  return `<div class="component-${component.id}">
    <fieldset>
        <legend>${component.label}${component.required ? " *" : ""}</legend>
        <ul class="options-list">
            ${optionsHTML}
        </ul>
    </fieldset>
</div>`
}

function generateRadioHTML(component: SurveyComponent): string {
  const options = component.options || []
  const optionsHTML = options
    .map(
      (option, index) => `
        <li class="option-item">
            <input type="radio" id="radio-${component.id}-${index}" name="radio-${component.id}" value="${option}">
            <label for="radio-${component.id}-${index}">${option}</label>
        </li>`,
    )
    .join("")

  return `<div class="component-${component.id}">
    <fieldset>
        <legend>${component.label}${component.required ? " *" : ""}</legend>
        <ul class="options-list">
            ${optionsHTML}
        </ul>
    </fieldset>
</div>`
}

function generateDropdownHTML(component: SurveyComponent): string {
  const options = component.options || []
  const optionsHTML = options.map((option) => `<option value="${option}">${option}</option>`).join("")

  return `<div class="component-${component.id}">
    <label for="dropdown-${component.id}">${component.label}${component.required ? " *" : ""}</label>
    <select id="dropdown-${component.id}" name="dropdown-${component.id}">
        <option value="" disabled selected>-- Select --</option>
        ${optionsHTML}
    </select>
</div>`
}

function generateFileAttachmentHTML(component: SurveyComponent): string {
  const filename = component.src?.split("/").pop() || ""
  const fileIcon = getFileIcon(filename)

  return `<div class="component-${component.id}">
    <label>${component.label}${component.required ? " *" : ""}</label>
    <div class="file-preview">
        <span class="file-icon">${fileIcon}</span>
        <span class="file-name">${filename}</span>
        ${component.src ? `<a href="${component.src}" download class="download-btn" target="_blank" rel="noopener noreferrer">Download</a>` : ""}
    </div>
</div>`
}

function generateFileUploadHTML(component: SurveyComponent): string {
  return `<div class="component-${component.id}">
    <label for="file-upload-${component.id}">${component.label}${component.required ? " *" : ""}</label>
    <div class="upload-container">
        <input type="file" id="file-upload-${component.id}" name="file-upload-${component.id}" accept="${component.acceptedFileTypes || ".pdf,.doc,.docx,.jpg,.png"}">
        <div class="upload-btn">
            <span>Choose file</span>
            <span id="file-name-${component.id}" class="file-name">No file chosen</span>
        </div>
    </div>
    <div id="error-message-${component.id}" class="error-message"></div>
    <div class="help-text">
        Accepted file types: ${(component.acceptedFileTypes || ".pdf,.doc,.docx,.jpg,.png").split(",").join(", ")}
        <br>
        Maximum file size: ${component.maxFileSize || 5}MB
    </div>
</div>`
}

function generateSectionHTML(component: SurveyComponent): string {
  return `<div class="component-${component.id}">
    <div class="section-divider"></div>
    <h2 class="section-title">${component.label}</h2>
    ${component.description ? `<p class="section-description">${component.description}</p>` : ""}
</div>`
}

function generateTitleHTML(component: SurveyComponent): string {
  return `<div class="component-${component.id}">
    <h1>${component.label}</h1>
</div>`
}

function generateIntroductionHTML(component: SurveyComponent): string {
  return `<div class="component-${component.id}">
    <h2 class="intro-title">${component.label}</h2>
    ${component.description ? `<div class="intro-description">${component.description}</div>` : ""}
</div>`
}

function generateMatrixHTML(component: SurveyComponent): string {
  const columns = component.columns || []
  const rows = component.rows || []

  let tableHTML = `<thead>
        <tr>
            <th></th>
            ${columns.map((column) => `<th>${column}</th>`).join("")}
        </tr>
    </thead>
    <tbody>`

  rows.forEach((row) => {
    tableHTML += `
        <tr>
            <td>${row}</td>
            ${columns.map(() => `<td><input type="radio" name="matrix-${component.id}-${row}"></td>`).join("")}
        </tr>`
  })

  tableHTML += `
    </tbody>`

  return `<div class="component-${component.id}">
    <label>${component.label}${component.required ? " *" : ""}</label>
    <table>
        ${tableHTML}
    </table>
</div>`
}

function generateRatingHTML(component: SurveyComponent): string {
  const maxRating = component.maxRating || 5
  let starsHTML = ""

  for (let i = 1; i <= maxRating; i++) {
    starsHTML += `<button class="star" data-value="${i}">${i}</button>`
  }

  return `<div class="component-${component.id}">
    <label>${component.label}${component.required ? " *" : ""}</label>
    <div class="rating-stars">
        ${starsHTML}
    </div>
</div>`
}

function getFileIcon(filename: string): string {
  const ext = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase()

  if (["jpg", "jpeg", "png", "gif", "svg"].includes(ext)) return "📷"
  if (["pdf"].includes(ext)) return "📄"
  if (["doc", "docx"].includes(ext)) return "📝"
  if (["xls", "xlsx"].includes(ext)) return "📊"
  if (["ppt", "pptx"].includes(ext)) return "📑"
  if (["zip", "rar", "7z"].includes(ext)) return "🗜️"

  return "📎"
}
