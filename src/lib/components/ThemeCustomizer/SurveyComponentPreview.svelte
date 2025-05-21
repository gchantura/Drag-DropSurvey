<script lang="ts">
  import type { SurveyComponent } from '$lib/types/types';
  import { componentStyleStore } from '$lib/stores/componentStyleStore';
  
  export let component: SurveyComponent;
  
  // Get the style for this component type
  $: componentStyle = $componentStyleStore[component.type] || $componentStyleStore.default;
  
  // Generate CSS based on the component style
  $: cssStyle = generateCssStyle(componentStyle);
  
  function generateCssStyle(style: any) {
    let css = '';
    
    // Apply background (solid or gradient)
    if (style.backgroundGradient) {
      css += `background: linear-gradient(${style.backgroundGradientDirection}, ${style.backgroundGradientStart}, ${style.backgroundGradientEnd});`;
    } else {
      css += `background-color: ${style.backgroundColor};`;
    }
    
    // Apply other styles
    css += `
      opacity: ${style.opacity};
      color: ${style.color};
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize};
      font-weight: ${style.fontWeight};
      text-align: ${style.textAlign};
      border: ${style.borderWidth} ${style.borderStyle} ${style.borderColor};
      border-radius: ${style.borderRadius};
      padding: ${style.padding};
      margin: ${style.margin};
      box-shadow: ${style.boxShadow};
      transition: ${style.transition};
    `;
    
    return css;
  }
  
  // Render the appropriate component based on its type
  function renderComponent() {
    switch(component.type) {
      case 'input':
        return `
          <div>
            <label style="display: block; margin-bottom: 0.25rem; font-size: ${componentStyle.labelFontSize}; font-weight: ${componentStyle.labelFontWeight};">
              ${component.label} ${component.required ? '*' : ''}
            </label>
            <input type="text" placeholder="${component.placeholder || ''}" style="width: 100%; padding: 0.5rem; border: 1px solid ${componentStyle.borderColor}; border-radius: ${componentStyle.borderRadius};">
          </div>
        `;
      
      case 'textarea':
        return `
          <div>
            <label style="display: block; margin-bottom: 0.25rem; font-size: ${componentStyle.labelFontSize}; font-weight: ${componentStyle.labelFontWeight};">
              ${component.label} ${component.required ? '*' : ''}
            </label>
            <textarea rows="${component.rows || 4}" placeholder="${component.placeholder || ''}" style="width: 100%; padding: 0.5rem; border: 1px solid ${componentStyle.borderColor}; border-radius: ${componentStyle.borderRadius};"></textarea>
          </div>
        `;
      
      case 'checkbox':
        return `
          <fieldset style="border: none; padding: 0; margin: 0;">
            <legend style="font-weight: ${componentStyle.labelFontWeight}; margin-bottom: 0.5rem;">
              ${component.label} ${component.required ? '*' : ''}
            </legend>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${(component.options || []).map(option => `
                <div style="display: flex; align-items: center;">
                  <input type="checkbox" id="option-${option.replace(/\s+/g, '-').toLowerCase()}" style="margin-right: 0.5rem;">
                  <label for="option-${option.replace(/\s+/g, '-').toLowerCase()}">${option}</label>
                </div>
              `).join('')}
            </div>
          </fieldset>
        `;
      
      case 'radio':
        return `
          <fieldset style="border: none; padding: 0; margin: 0;">
            <legend style="font-weight: ${componentStyle.labelFontWeight}; margin-bottom: 0.5rem;">
              ${component.label} ${component.required ? '*' : ''}
            </legend>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${(component.options || []).map(option => `
                <div style="display: flex; align-items: center;">
                  <input type="radio" name="radio-group" id="option-${option.replace(/\s+/g, '-').toLowerCase()}" style="margin-right: 0.5rem;">
                  <label for="option-${option.replace(/\s+/g, '-').toLowerCase()}">${option}</label>
                </div>
              `).join('')}
            </div>
          </fieldset>
        `;
      
      case 'dropdown':
        return `
          <div>
            <label style="display: block; margin-bottom: 0.25rem; font-size: ${componentStyle.labelFontSize}; font-weight: ${componentStyle.labelFontWeight};">
              ${component.label} ${component.required ? '*' : ''}
            </label>
            <select style="width: 100%; padding: 0.5rem; border: 1px solid ${componentStyle.borderColor}; border-radius: ${componentStyle.borderRadius};">
              <option value="" disabled selected>${component.placeholder || 'Select an option'}</option>
              ${(component.options || []).map(option => `
                <option value="${option}">${option}</option>
              `).join('')}
            </select>
          </div>
        `;
      
      case 'title':
        return `
          <h1 style="font-size: ${componentStyle.fontSize}; font-weight: ${componentStyle.fontWeight}; margin: 0; text-align: ${componentStyle.textAlign};">
            ${component.label}
          </h1>
        `;
      
      case 'section':
        return `
          <div>
            <div style="border-bottom: 2px solid ${componentStyle.borderColor}; margin-bottom: 8px;"></div>
            <h2 style="font-size: ${componentStyle.fontSize}; font-weight: ${componentStyle.fontWeight}; margin: 0 0 8px 0;">
              ${component.label}
            </h2>
            ${component.description ? `<p style="margin-top: 4px; font-size: 0.875rem; color: #4b5563;">${component.description}</p>` : ''}
          </div>
        `;
      
      case 'introduction':
        return `
          <div>
            <h2 style="font-size: ${componentStyle.fontSize}; font-weight: ${componentStyle.fontWeight}; margin: 0 0 1rem 0;">
              ${component.label}
            </h2>
            <p>${component.text || ''}</p>
          </div>
        `;
      
      case 'matrix':
        return `
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: ${componentStyle.fontWeight};">
              ${component.label} ${component.required ? '*' : ''}
            </label>
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th style="border: 1px solid ${componentStyle.borderColor}; padding: 0.5rem; background-color: #f5f5f5;"></th>
                  ${(component.columns || []).map(col => `
                    <th style="border: 1px solid ${componentStyle.borderColor}; padding: 0.5rem; background-color: #f5f5f5;">${col}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${(component.rows || []).map(row => `
                  <tr>
                    <td style="border: 1px solid ${componentStyle.borderColor}; padding: 0.5rem;">${row}</td>
                    ${(component.columns || []).map(() => `
                      <td style="border: 1px solid ${componentStyle.borderColor}; padding: 0.5rem; text-align: center;">
                        <input type="radio" name="matrix-${row.replace(/\s+/g, '-').toLowerCase()}" style="margin: 0;">
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      
      case 'rating':
        return `
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: ${componentStyle.fontWeight};">
              ${component.label} ${component.required ? '*' : ''}
            </label>
            <div style="display: flex; gap: 0.5rem;">
              ${Array(component.maxRating || 5).fill(0).map((_, i) => `
                <button style="width: 40px; height: 40px; border: 1px solid ${componentStyle.borderColor}; background: #fff; cursor: pointer;">
                  ${i + 1}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      
      case 'fileUpload':
        return `
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: ${componentStyle.fontWeight};">
              ${component.label} ${component.required ? '*' : ''}
            </label>
            <div style="display: flex; align-items: center;">
              <button style="background-color: #f0f0f0; padding: 0.5rem; border: 1px solid ${componentStyle.borderColor}; border-radius: ${componentStyle.borderRadius} 0 0 ${componentStyle.borderRadius};">
                Choose file
              </button>
              <div style="flex: 1; padding: 0.5rem; border: 1px solid ${componentStyle.borderColor}; border-left: none; border-radius: 0 ${componentStyle.borderRadius} ${componentStyle.borderRadius} 0;">
                No file chosen
              </div>
            </div>
            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #666;">
              Accepted file types: ${component.acceptedFileTypes || '.pdf,.jpg,.png'}<br>
              Maximum file size: ${component.maxFileSize || 5}MB
            </div>
          </div>
        `;
      
      case 'fileAttachment':
        return `
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: ${componentStyle.fontWeight};">
              ${component.label} ${component.required ? '*' : ''}
            </label>
            <div style="display: flex; align-items: center; padding: 0.5rem; border: 1px solid ${componentStyle.borderColor}; border-radius: ${componentStyle.borderRadius}; background-color: #f9f9f9;">
              <span style="font-size: 1.5em; margin-right: 0.5rem;">📎</span>
              <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${component.src ? component.src.split('/').pop() : 'No file attached'}
              </span>
              ${component.src ? `
                <a href="#" style="background-color: #3b82f6; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; text-decoration: none; font-size: 0.875rem;">
                  Download
                </a>
              ` : ''}
            </div>
          </div>
        `;
      
      default:
        return `<p>${component.label || 'Text Component'}</p>`;
    }
  }
</script>

<div style={cssStyle}>
  {@html renderComponent()}
</div>

<style>
  /* Prevent global styles from affecting the preview */
  div {
    all: unset;
    display: block;
    box-sizing: border-box;
  }
</style>
