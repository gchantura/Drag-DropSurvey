# Survey Builder User Guide

## Introduction

Welcome to the Survey Builder application! This tool allows you to create custom surveys by dragging and dropping components onto a canvas. This guide will help you understand how to use the application effectively.

## Getting Started

### Interface Overview

The Survey Builder interface consists of three main sections:

1. **Left Sidebar**: Contains component types you can add to your survey and survey actions.
2. **Canvas**: The main area where you build your survey by arranging components.
3. **Right Sidebar**: Contains alignment tools and additional component properties.

### Adding Components

To add a component to your survey:

1. Click on a component type in the left sidebar.
2. The component will appear on the canvas.
3. Drag it to position it where you want.

### Selecting and Editing Components

- **Click** on a component to select it.
- **Shift+Click** to select multiple components.
- When a component is selected, its properties appear in the right sidebar.
- Edit the component's properties in the right sidebar to customize it.

## Working with the Canvas

### Navigation

- **Pan**: Hold the spacebar and drag, or use middle mouse button.
- **Zoom**: Use Ctrl/Cmd + Mouse Wheel, or use the zoom controls.
- **Reset View**: Press Ctrl/Cmd + 0 or use the reset button.

### Guides and Grid

- **Toggle Grid**: Press Ctrl/Cmd + G or use the toolbar button.
- **Toggle Guides**: Press Ctrl/Cmd + H or use the toolbar button.
- **Add Guide**: Double-click on a ruler.
- **Move Guide**: Drag an existing guide.
- **Remove Guide**: Right-click on a guide and select "Delete Guide".
- **Guide Manager**: Use the "Guide Manager" button to add, edit, or remove guides.

### Alignment and Distribution

- Select multiple components to enable alignment and distribution tools.
- Use the alignment buttons to align components (left, center, right, top, middle, bottom).
- Use the distribution buttons to distribute components evenly.
- Use "Auto Spacing" to automatically space selected components evenly.
- Use "Auto Position" to arrange all components in a grid layout.

## Component Properties

Each component has various properties that can be customized:

### Basic Properties
- **Label**: The text displayed on the component.
- **Required**: For form components, marks the field as required.
- **Position and Size**: X, Y coordinates and width, height.

### Style Properties
- **Typography**: Font family, size, weight, style, color, etc.
- **Background**: Background color.
- **Border**: Border radius, width, color, style.
- **Spacing**: Padding and margin.
- **Effects**: Opacity, box shadow.
- **Transform**: Rotation and scale.
- **Animation**: Various animation effects and duration.

### Advanced Properties
- **Validation**: For input components, set validation patterns and error messages.
- **Options**: For multi-choice components, manage the available options.
- **Matrix**: For matrix components, manage rows and columns.

## Saving and Exporting

### Saving Your Work
- Click "Save Survey" to save your work to browser storage.
- Click "Load Survey" to load a previously saved survey.

### Exporting
- Click "Export Survey" to open the export options.
- Choose from various export formats:
  - **HTML**: Export as a standalone HTML form.
  - **JSON**: Export survey data for later import.
  - **React/Vue/Angular**: Export as a component for these frameworks.
  - **PNG/JPEG**: Export as an image.

### Importing
- Click "Import JSON" to import a previously exported JSON file.

## Keyboard Shortcuts

- **Ctrl/Cmd + A**: Select all components
- **Ctrl/Cmd + D**: Duplicate selected component(s)
- **Delete/Backspace**: Delete selected component(s)
- **Arrow Keys**: Move selected component(s) by 1px
- **Shift + Arrow Keys**: Move selected component(s) by 10px
- **Ctrl/Cmd + G**: Toggle grid snap
- **Ctrl/Cmd + H**: Toggle guides visibility
- **Ctrl/Cmd + +**: Zoom in
- **Ctrl/Cmd + -**: Zoom out
- **Ctrl/Cmd + 0**: Reset zoom & center view
- **Spacebar (Hold)**: Enable pan mode
- **Escape**: Close context menu / Cancel selection / Deselect all

## Tips and Tricks

- Use the context menu (right-click) for quick actions on components or guides.
- Double-click on rulers to add guides at specific positions.
- Use the "Auto Position" feature to quickly arrange all components in a grid.
- Use "Auto Spacing" to evenly distribute selected components.
- Combine multiple alignment operations to achieve precise layouts.
- Use the guide manager to add guides at exact pixel positions.
- Export your survey as code to integrate it into your website or application.
