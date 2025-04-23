<!-- src/lib/components/Canvas.svelte -->
<script lang="ts">
	import {
		componentsStore,
		updateComponent,
		deleteComponent,
		duplicateComponent,
		loadSurvey
	} from '$lib/stores/surveyStore.ts'; // Use $lib alias for survey store
	import {
		canvasViewStore, // Import the new canvas view store
		PIXEL_PER_CM, // Import necessary constants from the store file
		PIXEL_PER_INCH,
		RULER_SIZE,
		SNAP_THRESHOLD,
		ZOOM_SENSITIVITY
	} from '$lib/stores/canvasStore.ts'; // Use $lib alias for canvas store
	import { onMount, tick, onDestroy } from 'svelte';
	import type {
		SurveyComponent as SurveyComponentType,
		SelectionBox,
		DraggingGuide
	} from '$lib/types/survey.ts'; // Use $lib alias for types

	// Child Components (Ensure paths are correct for your project structure)
	import CanvasToolbar from '$lib/components/CanvasComponents/CanvasToolbar.svelte';
	import ToolbarAlignment from '$lib/components/CanvasComponents/ToolbarAlignment.svelte';
	import CanvasRuler from '$lib/components/CanvasComponents/CanvasRuler.svelte';
	import CanvasViewport from '$lib/components/CanvasComponents/CanvasViewport.svelte';
	import ContextMenu from '$lib/components/CanvasComponents/ContextMenu.svelte';
	import StatusBar from '$lib/components/CanvasComponents/StatusBar.svelte';

	// Type needed for the component instance reference
	import type { SvelteComponent } from 'svelte';

	// --- Component Props ---
	export let selectedComponent: SurveyComponentType | null = null; // Controlled externally or via selection
	export let units: 'cm' | 'inches' | 'px' = 'cm'; // Local UI preference

	// --- LOCAL State (Not suitable for global store) ---

	// Viewport dimensions derived from DOM element size
	let viewportWidth = 0;
	let viewportHeight = 0;
	let containerRef: HTMLDivElement; // Ref for overall container
	let viewportRef: HTMLDivElement; // Ref to the scrollable div element
	let canvasViewportInstance: CanvasViewport | undefined = undefined; // Specific type if known methods are called

	// Interaction state (transient, tied to mouse/keyboard events)
	let mouseX_Viewport = 0; // Mouse X relative to viewport top-left
	let mouseY_Viewport = 0; // Mouse Y relative to viewport top-left
	let mouseX_Canvas = 0; // Mouse X relative to canvas top-left (unscaled)
	let mouseY_Canvas = 0; // Mouse Y relative to canvas top-left (unscaled)
	let isDragging = false; // Flag: component drag in progress
	let isResizing = false; // Flag: component resize in progress
	let isPanning = false; // Flag: canvas pan in progress (middle mouse or space+drag)
	let isSelecting = false; // Flag: selection box drag in progress
	let startX = 0; // Initial clientX for drag/pan/resize
	let startY = 0; // Initial clientY for drag/pan/resize
	let startOffsetX_Interaction = 0; // Canvas offsetX at the start of a pan
	let startOffsetY_Interaction = 0; // Canvas offsetY at the start of a pan
	let activeComponentId: string | null = null; // ID of component being dragged/resized
	let lastClickTime = 0; // For double-click detection
	let dragInitialPositions = new Map<string, { x: number; y: number }>(); // Store start pos for multi-drag

	// Selection state (local to this canvas instance)
	let multiSelectedComponentIds: string[] = []; // IDs of currently selected components
	let selectionBox: SelectionBox = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 }; // Selection rectangle state

	// Guides state (visual aids, local to this canvas)
	let horizontalGuides: number[] = [100, 200]; // Y-coordinates of horizontal guides
	let verticalGuides: number[] = [100, 300]; // X-coordinates of vertical guides
	let showGuides = true; // Toggle visibility
	let draggingGuide: DraggingGuide = null; // State for guide dragging

	// Snapping state (local interaction modifier)
	let enableSnap = true; // Toggle snapping
	let gridSize = getGridSize(); // Calculated based on units

	// Context Menu state (local UI element state)
	let showContextMenu = false;
	let contextMenuX = 0;
	let contextMenuY = 0;
	let contextMenuTarget: EventTarget | null = null;

	// --- Computed Values ---
	$: selectedComponentId = selectedComponent ? selectedComponent.id : null; // Reactive derived value

	// --- Functions ---

	/** Calculates grid size in pixels based on current units */
	function getGridSize(): number {
		switch (units) {
			case 'cm':
				return PIXEL_PER_CM / 2; // e.g., snap every 0.5 cm
			case 'inches':
				return PIXEL_PER_INCH / 4; // e.g., snap every 0.25 inch
			case 'px':
				return 10; // Snap every 10 pixels
			default:
				return PIXEL_PER_CM / 2;
		}
	}

	/** Updates page format and dimensions via the store */
	function updatePageFormat(newFormat: string): void {
		canvasViewStore.setPageFormat(newFormat);
		// Grid size depends on units, which might change independently or be tied to format implicitly
		gridSize = getGridSize();
		// Recenter view after format change? Optional.
		// tick().then(() => resetZoomAndCenter());
	}

	/** Snaps a value to the nearest grid line */
	function snapToGrid(value: number): number {
		if (!enableSnap || gridSize <= 0) return value;
		return Math.round(value / gridSize) * gridSize;
	}

	/** Snaps a value to the nearest guide if within threshold */
	function snapToGuides(value: number, direction: 'horizontal' | 'vertical'): number {
		if (!enableSnap || !showGuides) return value;
		const guides = direction === 'horizontal' ? verticalGuides : horizontalGuides;
		const currentScale = $canvasViewStore.scale; // Read from store
		for (const guide of guides) {
			// Threshold is in screen pixels, adjust check based on scale
			if (Math.abs(value - guide) * currentScale < SNAP_THRESHOLD) {
				return guide;
			}
		}
		return value;
	}

	/** Calculates mouse coordinates relative to the unscaled canvas origin */
	function calculateCanvasMousePos(clientX: number, clientY: number): { x: number; y: number } {
		if (!viewportRef) return { x: 0, y: 0 };
		const viewportRect = viewportRef.getBoundingClientRect();
		// Mouse position relative to the viewport div's top-left corner
		const mouseX_VP = clientX - viewportRect.left;
		const mouseY_VP = clientY - viewportRect.top;
		// Read current transform from the store
		const { offsetX, offsetY, scale } = $canvasViewStore;
		// Convert viewport coordinates to canvas coordinates
		return {
			x: (mouseX_VP - offsetX) / scale,
			y: (mouseY_VP - offsetY) / scale
		};
	}

	// --- Event Handlers ---

	/** Handles mouse movement over the window (for dragging, panning, etc.) */
	function handleMouseMove(e: MouseEvent): void {
		const currentScale = $canvasViewStore.scale; // Get current scale from store

		// Update viewport-relative mouse coordinates
		if (viewportRef) {
			const viewportRect = viewportRef.getBoundingClientRect();
			mouseX_Viewport = e.clientX - viewportRect.left;
			mouseY_Viewport = e.clientY - viewportRect.top;
		}

		// Update canvas-relative mouse coordinates
		const { x: currentCanvasX, y: currentCanvasY } = calculateCanvasMousePos(e.clientX, e.clientY);
		mouseX_Canvas = currentCanvasX;
		mouseY_Canvas = currentCanvasY;

		// --- Handle Active Interactions ---

		// Dragging Components
		if (isDragging && activeComponentId) {
			const dx_canvas = (e.clientX - startX) / currentScale; // Delta in canvas coords
			const dy_canvas = (e.clientY - startY) / currentScale;
			multiSelectedComponentIds.forEach((id) => {
				const initialPos = dragInitialPositions.get(id);
				if (initialPos) {
					// Calculate potential new position
					let newX = initialPos.x + dx_canvas;
					let newY = initialPos.y + dy_canvas;
					// Apply snapping
					newX = snapToGuides(newX, 'horizontal');
					newY = snapToGuides(newY, 'vertical');
					newX = snapToGrid(newX);
					newY = snapToGrid(newY);
					// Update component via surveyStore
					updateComponent(id, { x: newX, y: newY });
				}
			});
		}
		// Resizing Component
		else if (isResizing && activeComponentId) {
			const component = $componentsStore.find((c) => c.id === activeComponentId);
			// Ensure component and its starting dimensions (stored during onStartResize) exist
			if (!component || component.startX === undefined || component.startY === undefined) return;

			const dx_canvas = (e.clientX - startX) / currentScale; // Delta in canvas coords
			const dy_canvas = (e.clientY - startY) / currentScale;
			const minWidth = 20; // Minimum component size
			const minHeight = 20;

			// Calculate potential new dimensions based on stored start size + delta
			let newWidth = component.startX + dx_canvas;
			let newHeight = component.startY + dy_canvas;

			// Apply snapping and minimum size constraints
			newWidth = snapToGrid(Math.max(minWidth, newWidth));
			newHeight = snapToGrid(Math.max(minHeight, newHeight));
			// Note: Snapping resize to guides is less common, could be added here

			// Update component via surveyStore
			updateComponent(activeComponentId, { width: newWidth, height: newHeight });
		}
		// Panning Canvas
		else if (isPanning) {
			const dx_viewport = e.clientX - startX; // Delta in viewport coords
			const dy_viewport = e.clientY - startY;
			// Update canvas offset in the store based on initial offset + delta
			canvasViewStore.setCanvasOffset(
				startOffsetX_Interaction + dx_viewport,
				startOffsetY_Interaction + dy_viewport
			);
		}
		// Dragging Guide
		else if (draggingGuide) {
			if (draggingGuide.direction === 'horizontal') {
				// Snap guide position to grid
				horizontalGuides[draggingGuide.index] = snapToGrid(mouseY_Canvas);
				horizontalGuides = [...horizontalGuides]; // Trigger reactivity
			} else {
				verticalGuides[draggingGuide.index] = snapToGrid(mouseX_Canvas);
				verticalGuides = [...verticalGuides]; // Trigger reactivity
			}
		}
		// Dragging Selection Box
		else if (selectionBox.active) {
			isSelecting = true; // Mark selecting as active
			selectionBox.endX = mouseX_Canvas;
			selectionBox.endY = mouseY_Canvas;
			selectionBox = { ...selectionBox }; // Trigger reactivity
			updateSelectionFromBox(); // Update selected components based on box
		}
	}

	/** Handles mouse button release */
	function handleMouseUp(e: MouseEvent): void {
		// Reset all interaction flags and related state
		if (isDragging) isDragging = false;
		if (isResizing) isResizing = false;
		if (isPanning) {
			isPanning = false;
			document.body.classList.remove('panning'); // Remove cursor style class
		}
		if (isSelecting) isSelecting = false; // Reset selecting flag (box might still be visible briefly)
		if (draggingGuide) draggingGuide = null;
		if (selectionBox.active) {
			selectionBox.active = false; // Deactivate selection box
			// Optionally clear the visual box immediately:
			// selectionBox = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };
		}

		activeComponentId = null;
		dragInitialPositions.clear();
	}

	/** Handles mouse leaving the window, treated like mouse up if interaction was active */
	function handleMouseLeave(e: MouseEvent): void {
		// If the mouse leaves the window entirely while an interaction is happening
		if (
			e.relatedTarget === null &&
			(isDragging || isResizing || isPanning || selectionBox.active || draggingGuide)
		) {
			handleMouseUp(e); // End the interaction
		}
	}

	/** Handles mouse wheel events for zooming */
	function handleWheel(e: WheelEvent): void {
		// Zoom on Ctrl+Wheel or Pinch-to-Zoom (Cmd+Wheel on Mac)
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault(); // Prevent page scroll
			const delta = -e.deltaY * ZOOM_SENSITIVITY; // Calculate zoom delta

			if (viewportRef) {
				// Get mouse position relative to viewport for zoom centering
				const viewportRect = viewportRef.getBoundingClientRect();
				const mouseX_VP = e.clientX - viewportRect.left;
				const mouseY_VP = e.clientY - viewportRect.top;
				// Call store action to adjust zoom, centered on mouse position
				canvasViewStore.adjustZoom(delta, mouseX_VP, mouseY_VP);
			}
		}
		// Allow natural scrolling if Ctrl/Meta not pressed (Shift+Wheel often scrolls horizontally)
	}

	/** Handles keyboard shortcuts */
	function handleKeydown(e: KeyboardEvent): void {
		// Ignore keydown if focus is inside an input element or specifically allowed area
		if (
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement ||
			e.target instanceof HTMLSelectElement ||
			(e.target as HTMLElement).closest('.allow-input') // Check for a parent with this class
		) {
			return; // Don't interfere with typing
		}

		let dx = 0;
		let dy = 0; // Initialize dy here
		const step = e.shiftKey ? 10 : 1; // Movement step size
		let needsUpdate = false; // Flag to trigger component update

		switch (e.key) {
			case 'ArrowUp':
				dy = -step;
				needsUpdate = true;
				break;
			case 'ArrowDown':
				dy = step; // Corrected assignment
				needsUpdate = true;
				break;
			case 'ArrowLeft':
				dx = -step;
				needsUpdate = true;
				break;
			case 'ArrowRight':
				dx = step;
				needsUpdate = true;
				break;
			case 'Delete':
			case 'Backspace':
				if (multiSelectedComponentIds.length > 0) {
					e.preventDefault(); // Prevent browser back navigation on Backspace
					deleteSelected();
				}
				break;
			case 'd': // Ctrl+D or Cmd+D for Duplicate
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					duplicateSelected();
				}
				break;
			case 'a': // Ctrl+A or Cmd+A for Select All
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					selectAllComponents();
				}
				break;
			case 'g': // Ctrl+G or Cmd+G to toggle grid snap
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					toggleSnap();
				}
				break;
			case 'h': // Ctrl+H or Cmd+H to toggle guides (H for Hide/Show)
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					toggleGuides();
				}
				break;
			case 'Escape': // Clear selection, close context menu
				clearSelection();
				closeContextMenu();
				if (isSelecting) isSelecting = false;
				if (selectionBox.active) selectionBox.active = false;
				break;
			// Add more shortcuts as needed (e.g., zoom, save)
			default:
				return; // Ignore other keys
		}

		// If an arrow key was pressed and components are selected, move them
		if (needsUpdate && multiSelectedComponentIds.length > 0) {
			e.preventDefault(); // Prevent default arrow key behavior (scrolling)
			multiSelectedComponentIds.forEach((id) => {
				const comp = $componentsStore.find((c) => c.id === id);
				if (comp) {
					// Calculate new position (consider snapping?)
					let newX = comp.x + dx;
					let newY = comp.y + dy;
					// Optional: Snap position after keyboard move
					// newX = snapToGrid(newX);
					// newY = snapToGrid(newY);
					updateComponent(id, { x: newX, y: newY });
				}
			});
			// Update the exported selectedComponent if it was moved
			if (selectedComponent && multiSelectedComponentIds.includes(selectedComponent.id)) {
				selectedComponent = $componentsStore.find((c) => c.id === selectedComponent?.id) || null;
			}
		}
	}

	/** Handles right-click to show context menu */
	function handleContextMenu(e: MouseEvent): void {
		e.preventDefault(); // Prevent default browser context menu
		showContextMenu = true;
		contextMenuX = e.clientX;
		contextMenuY = e.clientY;
		contextMenuTarget = e.target; // Store the element that was clicked
	}

	/** Closes the context menu */
	function closeContextMenu(): void {
		showContextMenu = false;
		contextMenuTarget = null;
	}

	// --- Component/Guide Interaction Callbacks (from CanvasViewport/Ruler) ---

	/** Callback when component drag starts */
	function onStartDrag(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; component: SurveyComponentType };
		const { event, component } = detail;
		if (event.button !== 0) return; // Only react to left-click drags

		isDragging = true; // Set local flag
		activeComponentId = component.id; // Track the main component interacted with
		startX = event.clientX; // Record starting mouse position
		startY = event.clientY;

		// Handle selection logic (Shift key for multi-select toggle)
		if (event.shiftKey) {
			if (multiSelectedComponentIds.includes(component.id)) {
				// Shift+Click on selected: Deselect it
				multiSelectedComponentIds = multiSelectedComponentIds.filter((id) => id !== component.id);
				// If the primary selected component was deselected, pick a new primary or null
				if (selectedComponent?.id === component.id) {
					selectedComponent =
						multiSelectedComponentIds.length > 0
							? $componentsStore.find((c) => c.id === multiSelectedComponentIds[0]) || null
							: null;
				}
			} else {
				// Shift+Click on unselected: Add to selection, make it primary
				multiSelectedComponentIds = [...multiSelectedComponentIds, component.id];
				selectedComponent = component;
			}
		} else {
			// Click without Shift
			if (!multiSelectedComponentIds.includes(component.id)) {
				// Clicked on unselected: Select only this one
				selectedComponent = component;
				multiSelectedComponentIds = [component.id];
			} else {
				// Clicked on already selected (could be part of multi-select): Make it primary
				selectedComponent = component;
				// No change needed to multiSelectedComponentIds if it was already selected
			}
		}

		// Store initial positions for *all* currently selected components for multi-drag
		dragInitialPositions.clear();
		multiSelectedComponentIds.forEach((id) => {
			const comp = $componentsStore.find((c) => c.id === id);
			if (comp) {
				dragInitialPositions.set(id, { x: comp.x, y: comp.y });
			}
		});

		event.preventDefault(); // Prevent text selection during drag
		closeContextMenu(); // Close context menu if open
	}

	/** Callback when component resize starts */
	function onStartResize(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; component: SurveyComponentType };
		const { event, component } = detail;
		if (event.button !== 0) return; // Only react to left-click drags

		isResizing = true; // Set local flag
		activeComponentId = component.id; // Track the component being resized
		startX = event.clientX; // Record starting mouse position
		startY = event.clientY;

		// Store the component's size *at the start of the resize* onto the component's data.
		// This is used in handleMouseMove to calculate the new size based on the delta.
		updateComponent(component.id, { startX: component.width, startY: component.height });

		// Select only the component being resized
		selectedComponent = component;
		multiSelectedComponentIds = [component.id];

		event.stopPropagation(); // Prevent triggering canvas click/pan
		event.preventDefault(); // Prevent text selection
		closeContextMenu(); // Close context menu if open
	}

	/** Callback when the canvas background is clicked */
	function handleCanvasClick(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; x: number; y: number };
		const { event, x, y } = detail; // x, y are canvas coordinates
		const currentTime = Date.now();

		// Double-click detection on canvas background (e.g., near rulers to add guides)
		if (currentTime - lastClickTime < 300) {
			// 300ms threshold for double-click
			const guideAreaThreshold_Canvas = 15 / $canvasViewStore.scale; // Threshold in canvas pixels
			let addedGuide = false;
			// Check if double-click is near the top edge (for vertical guide)
			if (y < guideAreaThreshold_Canvas) {
				verticalGuides = [...verticalGuides, snapToGrid(x)];
				addedGuide = true;
			}
			// Check if double-click is near the left edge (for horizontal guide)
			else if (x < guideAreaThreshold_Canvas) {
				horizontalGuides = [...horizontalGuides, snapToGrid(y)];
				addedGuide = true;
			}
			if (addedGuide) {
				event.stopPropagation(); // Prevent triggering other actions if guide added
			}
		}
		lastClickTime = currentTime; // Store time for next click check

		// Click on canvas background usually clears selection, unless Shift is held
		if (!isDragging && !isResizing && !isSelecting && !event.shiftKey) {
			clearSelection();
		}
		closeContextMenu(); // Close context menu on any canvas click
	}

	/** Callback when a component is clicked (but not dragged/resized) */
	function handleSelectComponent(e: CustomEvent): void {
		// This might be redundant if onStartDrag handles selection, but can be useful
		// if click without drag needs specific behavior.
		const component = e.detail.component as SurveyComponentType;
		const event = e.detail.event as MouseEvent;

		// Only process if not currently dragging or resizing
		if (!isDragging && !isResizing) {
			if (event.shiftKey) {
				// Toggle selection with shift key
				if (multiSelectedComponentIds.includes(component.id)) {
					multiSelectedComponentIds = multiSelectedComponentIds.filter((id) => id !== component.id);
					if (selectedComponent?.id === component.id) {
						selectedComponent =
							multiSelectedComponentIds.length > 0
								? $componentsStore.find((c) => c.id === multiSelectedComponentIds[0]) || null
								: null;
					}
				} else {
					multiSelectedComponentIds = [...multiSelectedComponentIds, component.id];
					selectedComponent = component;
				}
			} else {
				// Regular click: select only this component
				if (
					!multiSelectedComponentIds.includes(component.id) ||
					multiSelectedComponentIds.length > 1
				) {
					selectedComponent = component;
					multiSelectedComponentIds = [component.id];
				} else {
					// Clicking the only selected component: keep it selected
					selectedComponent = component;
				}
			}
		}
		closeContextMenu();
	}

	/** Callback when starting a selection box drag on the canvas background */
	function onStartSelectionBox(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; x: number; y: number };
		const { event, x, y } = detail; // x, y are canvas coordinates

		// Only start if left button pressed and not interacting with components/guides
		if (event.button !== 0 || isDragging || isResizing || draggingGuide) return;

		isSelecting = true; // Set local flag
		selectionBox.active = true; // Activate the visual box
		selectionBox.startX = x;
		selectionBox.startY = y;
		selectionBox.endX = x; // Start and end at same point initially
		selectionBox.endY = y;
		selectionBox = { ...selectionBox }; // Trigger reactivity

		// If Shift key is not held, clear existing selection before starting new box
		if (!event.shiftKey) {
			clearSelection();
		}
		closeContextMenu();
	}

	/** Updates the list of selected components based on the current selection box */
	function updateSelectionFromBox(): void {
		if (!selectionBox.active) return;

		// Determine box boundaries
		const minX = Math.min(selectionBox.startX, selectionBox.endX);
		const maxX = Math.max(selectionBox.startX, selectionBox.endX);
		const minY = Math.min(selectionBox.startY, selectionBox.endY);
		const maxY = Math.max(selectionBox.startY, selectionBox.endY);

		// Find components intersecting the box
		const newlySelectedIds = $componentsStore
			.filter(
				(comp) =>
					// Simple intersection check (component rect vs selection rect)
					comp.x < maxX &&
					comp.x + comp.width > minX &&
					comp.y < maxY &&
					comp.y + comp.height > minY
			)
			.map((comp) => comp.id);

		// Update selection state
		// Note: This replaces the selection. If additive selection (Shift+box) is needed,
		// the logic here would need to merge newlySelectedIds with existing ones.
		multiSelectedComponentIds = newlySelectedIds;
		selectedComponent =
			multiSelectedComponentIds.length > 0
				? $componentsStore.find((c) => c.id === multiSelectedComponentIds[0]) || null // Select first found as primary
				: null;
	}

	/** Callback when canvas panning starts (e.g., middle mouse down) */
	function onStartPan(e: CustomEvent): void {
		const event = e.detail as MouseEvent;
		// Could check event.button === 1 for middle mouse specifically if needed

		isPanning = true; // Set local flag
		startX = event.clientX; // Record starting mouse position
		startY = event.clientY;
		// Store the canvas offset *at the start of the pan* from the global store
		startOffsetX_Interaction = $canvasViewStore.offsetX;
		startOffsetY_Interaction = $canvasViewStore.offsetY;

		event.preventDefault(); // Prevent default middle-mouse scroll behavior
		document.body.classList.add('panning'); // Add class for grab cursor
		closeContextMenu();
	}

	/** Callback when a guide drag starts */
	function onStartGuideMove(e: CustomEvent): void {
		draggingGuide = e.detail as DraggingGuide; // Store guide info
		closeContextMenu();
	}

	/** Callback to remove a guide (e.g., from context menu or drag off canvas) */
	function removeGuide(e: CustomEvent): void {
		const detail = e.detail as { direction: 'horizontal' | 'vertical'; index: number };
		const { direction, index } = detail;

		if (direction === 'horizontal') {
			if (index >= 0 && index < horizontalGuides.length) {
				horizontalGuides.splice(index, 1);
				horizontalGuides = [...horizontalGuides]; // Trigger reactivity
			}
		} else {
			// Vertical
			if (index >= 0 && index < verticalGuides.length) {
				verticalGuides.splice(index, 1);
				verticalGuides = [...verticalGuides]; // Trigger reactivity
			}
		}
		closeContextMenu(); // Close menu if action came from there
	}

	// --- Actions (Triggered by Toolbar, Context Menu, Keyboard) ---

	/** Clears the current selection */
	function clearSelection(): void {
		selectedComponent = null;
		multiSelectedComponentIds = [];
	}

	/** Selects all components on the canvas */
	function selectAllComponents(): void {
		multiSelectedComponentIds = $componentsStore.map((comp) => comp.id);
		// Set the first component as the primary selected one if any exist
		selectedComponent = multiSelectedComponentIds.length > 0 ? $componentsStore[0] : null;
	}

	/** Resets zoom and centers the canvas view */
	function resetZoomAndCenter(): void {
		if (viewportRef) {
			// Call store action, providing the current viewport dimensions
			canvasViewStore.resetZoom(viewportWidth, viewportHeight);
		}
		// If viewportRef isn't available yet, centering isn't possible.
		// Could potentially set scale to 1 and offset to 0 as a fallback.
		// else { canvasViewStore.setCanvasTransform(1, 0, 0); }
	}

	/** Zooms in using the store action */
	function handleZoomIn(): void {
		canvasViewStore.zoomIn();
	}

	/** Zooms out using the store action */
	function handleZoomOut(): void {
		canvasViewStore.zoomOut();
	}

	/** Duplicates the currently selected component(s) */
	function duplicateSelected(): void {
		if (multiSelectedComponentIds.length === 0) return;

		const newIds: string[] = [];
		multiSelectedComponentIds.forEach((id) => {
			const newId = duplicateComponent(id); // Uses surveyStore function
			if (newId) newIds.push(newId);
		});

		// After duplication, select the newly created components
		tick().then(() => {
			// Wait for the store update to reflect in the DOM/components
			multiSelectedComponentIds = newIds;
			selectedComponent =
				newIds.length > 0 ? $componentsStore.find((c) => c.id === newIds[0]) || null : null;
		});
		closeContextMenu();
	}

	/** Deletes the currently selected component(s) */
	function deleteSelected(): void {
		if (multiSelectedComponentIds.length > 0) {
			multiSelectedComponentIds.forEach((id) => deleteComponent(id)); // Uses surveyStore function
			clearSelection(); // Clear selection after deleting
		}
		closeContextMenu();
	}

	/** Toggles the measurement units */
	function toggleUnits(): void {
		const unitOrder: Array<'cm' | 'inches' | 'px'> = ['cm', 'inches', 'px'];
		const currentIndex = unitOrder.indexOf(units);
		units = unitOrder[(currentIndex + 1) % unitOrder.length]; // Cycle through units
		gridSize = getGridSize(); // Recalculate grid size based on new units
	}

	/** Toggles snapping */
	function toggleSnap(): void {
		enableSnap = !enableSnap;
	}

	/** Toggles guide visibility */
	function toggleGuides(): void {
		showGuides = !showGuides;
	}

	/** Automatically arranges components in a grid-like layout */
	function autoPosition(): void {
		const components = $componentsStore;
		if (components.length < 1) return;

		const PADDING = 20; // Padding from canvas edge
		const GAP = 15; // Gap between components
		let currentX = PADDING;
		let currentY = PADDING;
		let maxRowHeight = 0;
		const currentCanvasWidth = $canvasViewStore.width; // Get width from store

		components.forEach((component) => {
			// Check if adding the component exceeds canvas width
			if (currentX + component.width + PADDING > currentCanvasWidth && currentX > PADDING) {
				// Move to the next row
				currentX = PADDING;
				currentY += maxRowHeight + GAP;
				maxRowHeight = 0; // Reset max height for the new row
			}

			// Update component position via surveyStore
			updateComponent(component.id, { x: currentX, y: currentY });

			// Track the tallest component in the current row
			maxRowHeight = Math.max(maxRowHeight, component.height);
			// Advance X position for the next component
			currentX += component.width + GAP;
		});
	}

	/** Aligns selected components based on the primary selection */
	function alignComponents(
		alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
	): void {
		if (multiSelectedComponentIds.length <= 1) return; // Need at least two components

		const selectedComps = $componentsStore.filter((c) => multiSelectedComponentIds.includes(c.id));
		if (selectedComps.length <= 1) return;

		// Determine the primary component (anchor for alignment)
		// Use the explicitly selected one if available, otherwise the first in the list
		const primary =
			selectedComponent && multiSelectedComponentIds.includes(selectedComponent.id)
				? selectedComponent
				: selectedComps[0];

		// Calculate target alignment coordinate based on the primary component
		let targetX: number | undefined;
		let targetY: number | undefined;

		switch (alignment) {
			case 'left':
				targetX = primary.x;
				break;
			case 'center':
				targetX = primary.x + primary.width / 2;
				break;
			case 'right':
				targetX = primary.x + primary.width;
				break;
			case 'top':
				targetY = primary.y;
				break;
			case 'middle':
				targetY = primary.y + primary.height / 2;
				break;
			case 'bottom':
				targetY = primary.y + primary.height;
				break;
		}

		// Apply alignment to other selected components
		selectedComps.forEach((comp) => {
			if (comp.id === primary.id) return; // Don't align the primary to itself

			let newX = comp.x;
			let newY = comp.y;

			// Adjust X based on alignment type
			if (targetX !== undefined) {
				if (alignment === 'left') newX = targetX;
				else if (alignment === 'center') newX = targetX - comp.width / 2;
				else if (alignment === 'right') newX = targetX - comp.width;
			}
			// Adjust Y based on alignment type
			if (targetY !== undefined) {
				if (alignment === 'top') newY = targetY;
				else if (alignment === 'middle') newY = targetY - comp.height / 2;
				else if (alignment === 'bottom') newY = targetY - comp.height;
			}

			// Update component position (rounding helps prevent fractional pixels)
			updateComponent(comp.id, { x: Math.round(newX), y: Math.round(newY) });
		});
	}

	/** Distributes selected components evenly horizontally or vertically */
	function distributeComponents(direction: 'horizontal' | 'vertical'): void {
		if (multiSelectedComponentIds.length <= 2) return; // Need at least three components

		// Get copies of selected components to avoid modifying store directly during calculation
		const selectedComps = $componentsStore
			.filter((c) => multiSelectedComponentIds.includes(c.id))
			.map((c) => ({ ...c })); // Shallow copy is enough here

		if (selectedComps.length <= 2) return;

		if (direction === 'horizontal') {
			// Sort components by their left edge (X coordinate)
			selectedComps.sort((a, b) => a.x - b.x);

			const first = selectedComps[0];
			const last = selectedComps[selectedComps.length - 1];

			// Calculate the total horizontal span from the left of the first to the right of the last
			const totalRange = last.x + last.width - first.x;
			// Calculate the sum of the widths of all selected components
			const totalWidth = selectedComps.reduce((sum, comp) => sum + comp.width, 0);

			// Ensure there's more than one component to distribute between
			if (selectedComps.length <= 1) return;

			// Calculate the total space available *between* components
			const totalSpacing = Math.max(0, totalRange - totalWidth);
			// Calculate the equal gap size between each component
			const gap = totalSpacing / (selectedComps.length - 1);

			// Reposition components with the calculated gap
			let currentX = first.x; // Start with the position of the first component
			selectedComps.forEach((comp, index) => {
				// Update the actual component in the store
				updateComponent(comp.id, { x: Math.round(currentX) });
				// Advance the position for the next component
				currentX += comp.width + gap;
			});
		} else {
			// Vertical Distribution
			// Sort components by their top edge (Y coordinate)
			selectedComps.sort((a, b) => a.y - b.y);

			const first = selectedComps[0];
			const last = selectedComps[selectedComps.length - 1];

			// Calculate the total vertical span
			const totalRange = last.y + last.height - first.y;
			// Calculate the sum of the heights
			const totalHeight = selectedComps.reduce((sum, comp) => sum + comp.height, 0);

			if (selectedComps.length <= 1) return;

			// Calculate total vertical space between components
			const totalSpacing = Math.max(0, totalRange - totalHeight);
			// Calculate equal vertical gap
			const gap = totalSpacing / (selectedComps.length - 1);

			// Reposition components
			let currentY = first.y;
			selectedComps.forEach((comp) => {
				updateComponent(comp.id, { y: Math.round(currentY) });
				currentY += comp.height + gap;
			});
		}
	}

	// --- Lifecycle ---
	onMount(() => {
		// Initial setup - page format is set by store default
		// updatePageFormat($canvasViewStore.pageFormat); // Ensure consistency if needed

		// Observe the viewport size changes
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === viewportRef) {
					// Update LOCAL viewport dimensions
					viewportWidth = entry.contentRect.width;
					viewportHeight = entry.contentRect.height;
				}
			}
		});

		if (viewportRef) {
			resizeObserver.observe(viewportRef);
			// Get initial dimensions
			viewportWidth = viewportRef.clientWidth;
			viewportHeight = viewportRef.clientHeight;
			// Initial centering after dimensions are known
			// resetZoomAndCenter(); // Optional: Center on mount
		}

		// Add global event listeners
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('mouseleave', handleMouseLeave); // Handle mouse leaving window
		window.addEventListener('keydown', handleKeydown);

		// Load survey data from localStorage on mount
		loadSurvey(); // From surveyStore

		// Cleanup function
		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('keydown', handleKeydown);
			document.body.classList.remove('panning'); // Ensure cursor style is reset
		};
	});

	// --- External Control (e.g., from a Properties Panel) ---
	/** Allows external components to set the primary selected component */
	export function setSelectedComponent(comp: SurveyComponentType | null): void {
		if (comp) {
			selectedComponent = comp;
			// Ensure the externally set component is also in the multi-select list
			if (!multiSelectedComponentIds.includes(comp.id)) {
				multiSelectedComponentIds = [comp.id];
			}
		} else {
			clearSelection();
		}
	}
</script>

<!-- Main Canvas Structure -->
<div class="flex h-full w-full flex-col bg-gray-50 dark:bg-gray-900" bind:this={containerRef}>
	<!-- Top Toolbar -->
	<CanvasToolbar
		{units}
		{enableSnap}
		{showGuides}
		pageFormat={$canvasViewStore.pageFormat}
		on:toggleUnits={toggleUnits}
		on:toggleSnap={toggleSnap}
		on:toggleGuides={toggleGuides}
		on:updatePageFormat={(e) => updatePageFormat(e.detail)}
		on:resetZoom={resetZoomAndCenter}
		on:zoomIn={handleZoomIn}
		on:zoomOut={handleZoomOut}
		on:autoPosition={autoPosition}
	/>

	<!-- Alignment Toolbar (conditional) -->
	{#if multiSelectedComponentIds.length > 1}
		<ToolbarAlignment
			on:align={(e) => alignComponents(e.detail)}
			on:distribute={(e) => distributeComponents(e.detail)}
		/>
	{/if}

	<!-- Main Canvas Area (Rulers + Viewport) -->
	<div
		role="group"
		aria-label="Canvas Area"
		class="relative flex-1 overflow-hidden"
		on:contextmenu={handleContextMenu}
	>
		<!-- Horizontal Ruler -->
		<div
			class="absolute top-0 right-0 z-20 h-8 overflow-hidden"
			style="left: {RULER_SIZE}px; height: {RULER_SIZE}px;"
			aria-hidden="true"
		>
			<CanvasRuler
				direction="horizontal"
				scale={$canvasViewStore.scale}
				offset={$canvasViewStore.offsetX}
				viewLength={viewportWidth}
				{units}
				{showGuides}
				guides={verticalGuides}
				mousePos={mouseX_Viewport}
				on:startGuideMove={onStartGuideMove}
				on:removeGuide={removeGuide}
			/>
		</div>

		<!-- Vertical Ruler -->
		<div
			class="absolute bottom-0 left-0 z-20 w-8 overflow-hidden"
			style="top: {RULER_SIZE}px; width: {RULER_SIZE}px;"
			aria-hidden="true"
		>
			<CanvasRuler
				direction="vertical"
				scale={$canvasViewStore.scale}
				offset={$canvasViewStore.offsetY}
				viewLength={viewportHeight}
				{units}
				{showGuides}
				guides={horizontalGuides}
				mousePos={mouseY_Viewport}
				on:startGuideMove={onStartGuideMove}
				on:removeGuide={removeGuide}
			/>
		</div>

		<!-- Corner Box (between rulers) -->
		<div
			class="absolute top-0 left-0 z-20 border-r border-b border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800"
			style="width: {RULER_SIZE}px; height: {RULER_SIZE}px;"
			aria-hidden="true"
		></div>

		<!-- Canvas Viewport (Scrollable and Zoomable Area) -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- Keyboard interactions handled globally or via tabindex focus -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			bind:this={viewportRef}
			class="absolute inset-0 overflow-auto bg-gray-100 focus:outline-none dark:bg-gray-800"
			style="top: {RULER_SIZE}px; left: {RULER_SIZE}px;"
			on:wheel={handleWheel}
			tabindex="0"
			role="region"
			aria-label="Canvas Viewport"
		>
			<!-- The actual canvas content area -->
			<CanvasViewport
				bind:this={canvasViewportInstance}
				canvasWidth={$canvasViewStore.width}
				canvasHeight={$canvasViewStore.height}
				canvasScale={$canvasViewStore.scale}
				canvasOffsetX={$canvasViewStore.offsetX}
				canvasOffsetY={$canvasViewStore.offsetY}
				{enableSnap}
				{gridSize}
				{showGuides}
				{horizontalGuides}
				{verticalGuides}
				{selectionBox}
				{selectedComponentId}
				{multiSelectedComponentIds}
				on:startSelectionBox={onStartSelectionBox}
				on:canvasClick={handleCanvasClick}
				on:startPan={onStartPan}
				on:startGuideMove={onStartGuideMove}
				on:removeGuide={removeGuide}
				on:selectComponent={handleSelectComponent}
				on:startDrag={onStartDrag}
				on:startResize={onStartResize}
			/>
		</div>
	</div>

	<!-- Status Bar -->
	<StatusBar
		mouseX={mouseX_Canvas}
		mouseY={mouseY_Canvas}
		{units}
		{selectedComponent}
		{multiSelectedComponentIds}
		canvasScale={$canvasViewStore.scale}
	/>

	<!-- Context Menu (conditional) -->
	{#if showContextMenu}
		<ContextMenu
			x={contextMenuX}
			y={contextMenuY}
			{selectedComponent}
			{multiSelectedComponentIds}
			targetElement={contextMenuTarget}
			{horizontalGuides}
			{verticalGuides}
			on:close={closeContextMenu}
			on:duplicate={duplicateSelected}
			on:delete={deleteSelected}
			on:removeGuide={removeGuide}
			on:properties={() => console.log('Properties action triggered')}
		/>
	{/if}
</div>

<style>
	/* Apply grab/grabbing cursor globally when panning */
	:global(body.panning) {
		cursor: grabbing !important;
	}
	/* Ensure children inherit cursor during pan */
	:global(body.panning *) {
		cursor: grabbing !important;
	}
</style>
