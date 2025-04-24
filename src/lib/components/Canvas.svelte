<!-- src/lib/components/Canvas.svelte -->
<script lang="ts">
	import {
		componentsStore,
		updateComponent,
		deleteComponent,
		duplicateComponent,
		loadSurvey
	} from '$lib/stores/surveyStore.ts';
	import {
		canvasViewStore,
		PIXEL_PER_CM,
		PIXEL_PER_INCH,
		RULER_SIZE,
		SNAP_THRESHOLD,
		ZOOM_SENSITIVITY
	} from '$lib/stores/canvasStore.ts';
	import { onMount, tick, onDestroy } from 'svelte';
	import type {
		SurveyComponent as SurveyComponentType,
		SelectionBox,
		DraggingGuide
	} from '$lib/types/survey.ts';

	// Child Components
	import CanvasToolbar from '$lib/components/CanvasComponents/CanvasToolbar.svelte';
	import ToolbarAlignment from '$lib/components/CanvasComponents/ToolbarAlignment.svelte';
	import CanvasRuler from '$lib/components/CanvasComponents/CanvasRuler.svelte';
	import CanvasViewport from '$lib/components/CanvasComponents/CanvasViewport.svelte';
	import ContextMenu from '$lib/components/CanvasComponents/ContextMenu.svelte';
	import StatusBar from '$lib/components/CanvasComponents/StatusBar.svelte';

	// --- Component Props ---
	export let selectedComponent: SurveyComponentType | null = null;
	export let units: 'cm' | 'inches' | 'px' = 'cm';

	// --- LOCAL State ---
	let viewportWidth = 0;
	let viewportHeight = 0;
	let containerRef: HTMLDivElement;
	let viewportWrapperRef: HTMLDivElement; // Ref to the div containing CanvasViewport

	let mouseX_Viewport = 0;
	let mouseY_Viewport = 0;
	let mouseX_Canvas = 0;
	let mouseY_Canvas = 0;
	let isDragging = false;
	let isResizing = false;
	let isPanning = false;
	let isSelecting = false;
	let spacebarHeld = false; // NEW: For spacebar panning
	let startX = 0;
	let startY = 0;
	let startOffsetX_Interaction = 0;
	let startOffsetY_Interaction = 0;
	let activeComponentId: string | null = null;
	let lastClickTime = 0;
	let dragInitialPositions = new Map<string, { x: number; y: number }>();

	let multiSelectedComponentIds: string[] = [];
	let selectionBox: SelectionBox = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };

	let horizontalGuides: number[] = [100, 200];
	let verticalGuides: number[] = [100, 300];
	let showGuides = true;
	let draggingGuide: DraggingGuide = null;

	let enableSnap = true;
	let gridSize = getGridSize();

	let showContextMenu = false;
	let contextMenuX = 0;
	let contextMenuY = 0;
	let contextMenuTarget: EventTarget | null = null;

	// --- Computed Values ---
	$: selectedComponentId = selectedComponent ? selectedComponent.id : null;

	// --- Functions ---

	function getGridSize(): number {
		switch (units) {
			case 'cm':
				return PIXEL_PER_CM / 2;
			case 'inches':
				return PIXEL_PER_INCH / 4;
			case 'px':
				return 10;
			default:
				return PIXEL_PER_CM / 2;
		}
	}

	function updatePageFormat(newFormat: string): void {
		canvasViewStore.setPageFormat(newFormat);
		gridSize = getGridSize();
	}

	function snapToGrid(value: number): number {
		if (!enableSnap || gridSize <= 0 || isNaN(value)) return value;
		return Math.round(value / gridSize) * gridSize;
	}

	function snapToGuides(value: number, direction: 'horizontal' | 'vertical'): number {
		if (!enableSnap || !showGuides || isNaN(value)) return value;
		const guides = direction === 'horizontal' ? verticalGuides : horizontalGuides;
		const currentScale = $canvasViewStore.scale;
		for (const guide of guides) {
			if (Math.abs(value - guide) * currentScale < SNAP_THRESHOLD) {
				return guide;
			}
		}
		return value;
	}

	function calculateViewportMousePos(clientX: number, clientY: number): { x: number; y: number } {
		if (!viewportWrapperRef) return { x: 0, y: 0 };
		const viewportRect = viewportWrapperRef.getBoundingClientRect();
		return {
			x: clientX - viewportRect.left,
			y: clientY - viewportRect.top
		};
	}

	function calculateCanvasMousePos(clientX: number, clientY: number): { x: number; y: number } {
		if (!viewportWrapperRef) return { x: 0, y: 0 };
		const { x: mouseX_VP, y: mouseY_VP } = calculateViewportMousePos(clientX, clientY);
		const { offsetX, offsetY, scale } = $canvasViewStore;
		return {
			x: (mouseX_VP - offsetX) / scale,
			y: (mouseY_VP - offsetY) / scale
		};
	}

	// --- Interaction Logic ---

	/** Starts panning interaction */
	function startPanInteraction(event: MouseEvent) {
		if (isPanning) return; // Already panning
		isPanning = true;
		startX = event.clientX;
		startY = event.clientY;
		startOffsetX_Interaction = $canvasViewStore.offsetX;
		startOffsetY_Interaction = $canvasViewStore.offsetY;
		document.body.classList.add('panning');
		closeContextMenu();
	}

	/** Starts selection box interaction */
	function startSelectionInteraction(event: MouseEvent) {
		if (isSelecting || spacebarHeld) return; // Don't start if already selecting or space panning
		const { x, y } = calculateCanvasMousePos(event.clientX, event.clientY);
		isSelecting = true;
		selectionBox = { active: true, startX: x, startY: y, endX: x, endY: y };

		if (!event.shiftKey) {
			clearSelection();
		}
		closeContextMenu();
	}

	// --- Event Handlers ---

	function handleMouseMove(e: MouseEvent): void {
		const currentScale = $canvasViewStore.scale;
		const { x: vpX, y: vpY } = calculateViewportMousePos(e.clientX, e.clientY);
		mouseX_Viewport = vpX;
		mouseY_Viewport = vpY;
		const { x: currentCanvasX, y: currentCanvasY } = calculateCanvasMousePos(e.clientX, e.clientY);
		mouseX_Canvas = currentCanvasX;
		mouseY_Canvas = currentCanvasY;

		// Panning Canvas (Middle mouse OR Space + Left Drag)
		if (isPanning) {
			const dx_viewport = e.clientX - startX;
			const dy_viewport = e.clientY - startY;
			canvasViewStore.setCanvasOffset(
				startOffsetX_Interaction + dx_viewport,
				startOffsetY_Interaction + dy_viewport
			);
		}
		// Dragging Components
		else if (isDragging && activeComponentId) {
			const dx_canvas = (e.clientX - startX) / currentScale;
			const dy_canvas = (e.clientY - startY) / currentScale;
			multiSelectedComponentIds.forEach((id) => {
				const initialPos = dragInitialPositions.get(id);
				if (initialPos) {
					let newX = initialPos.x + dx_canvas;
					let newY = initialPos.y + dy_canvas;
					newX = snapToGuides(newX, 'horizontal');
					newY = snapToGuides(newY, 'vertical');
					newX = snapToGrid(newX);
					newY = snapToGrid(newY);
					updateComponent(id, { x: newX, y: newY });
				}
			});
		}
		// Resizing Component
		else if (isResizing && activeComponentId) {
			const component = $componentsStore.find((c) => c.id === activeComponentId);
			if (!component || component.startX === undefined || component.startY === undefined) return;

			const dx_canvas = (e.clientX - startX) / currentScale;
			const dy_canvas = (e.clientY - startY) / currentScale;
			const minWidth = 20;
			const minHeight = 20;

			// Calculate potential new dimensions based on stored start size + delta
			let newWidth = component.startX + dx_canvas;
			let newHeight = component.startY + dy_canvas;

			// Apply snapping and minimum size constraints
			newWidth = snapToGrid(Math.max(minWidth, newWidth));
			newHeight = snapToGrid(Math.max(minHeight, newHeight));

			updateComponent(activeComponentId, { width: newWidth, height: newHeight });
		}
		// Dragging Guide
		else if (draggingGuide) {
			const { scale, offsetX, offsetY } = $canvasViewStore;
			const guideCanvasPos =
				draggingGuide.direction === 'horizontal'
					? (mouseY_Viewport - offsetY) / scale
					: (mouseX_Viewport - offsetX) / scale;

			if (draggingGuide.direction === 'horizontal') {
				horizontalGuides[draggingGuide.index] = snapToGrid(
					snapToGuides(guideCanvasPos, 'vertical')
				); // Snap guide to grid and other guides
				horizontalGuides = [...horizontalGuides];
			} else {
				verticalGuides[draggingGuide.index] = snapToGrid(
					snapToGuides(guideCanvasPos, 'horizontal')
				); // Snap guide to grid and other guides
				verticalGuides = [...verticalGuides];
			}
		}
		// Dragging Selection Box
		else if (selectionBox.active) {
			selectionBox.endX = currentCanvasX;
			selectionBox.endY = currentCanvasY;
			selectionBox = { ...selectionBox };
			updateSelectionFromBox();
		}
	}

	function handleMouseUp(e: MouseEvent): void {
		if (isPanning) {
			isPanning = false;
			document.body.classList.remove('panning');
		}
		if (isDragging) isDragging = false;
		if (isResizing) isResizing = false;
		if (isSelecting) isSelecting = false; // Reset flag
		if (draggingGuide) draggingGuide = null;

		// Selection box remains visible until next click/action, but interaction stops
		if (selectionBox.active && e.button === 0) {
			// Finalize selection on mouse up if we were dragging a box
			updateSelectionFromBox(); // Ensure final update
			// Keep box active=true conceptually, but isSelecting=false prevents further updates on move
			// selectionBox.active = false; // Deactivate immediately if preferred
		}

		activeComponentId = null;
		dragInitialPositions.clear();
	}

	function handleMouseLeave(e: MouseEvent): void {
		if (
			e.relatedTarget === null &&
			(isDragging || isResizing || isPanning || isSelecting || draggingGuide)
		) {
			handleMouseUp(e);
		}
	}

	function handleWheel(e: WheelEvent): void {
		// Prevent wheel handling if context menu is open
		if (showContextMenu) {
			return;
		}

		// Zoom (Ctrl/Meta + Wheel)
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			const delta = -e.deltaY * ZOOM_SENSITIVITY;
			if (viewportWrapperRef) {
				const { x: mouseX_VP, y: mouseY_VP } = calculateViewportMousePos(e.clientX, e.clientY);
				canvasViewStore.adjustZoom(delta, mouseX_VP, mouseY_VP);
			}
		}
		// Pan (Default Wheel or Shift + Wheel)
		else if (viewportWrapperRef) {
			e.preventDefault(); // Prevent page scroll only when panning canvas
			// Read current transform from the store
			const { offsetX, offsetY } = $canvasViewStore;
			// Pan amount - adjust sensitivity if needed
			const panX = e.shiftKey ? -e.deltaY : -e.deltaX; // Shift+Wheel pans X, normal wheel pans Y
			const panY = e.shiftKey ? -e.deltaX : -e.deltaY; // (adjust if browser behaves differently)

			// Use requestAnimationFrame for smoother panning updates? Optional.
			canvasViewStore.setCanvasOffset(offsetX + panX, offsetY + panY);
		}
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			closeContextMenu();
			if (isSelecting) isSelecting = false;
			if (selectionBox.active) selectionBox = { ...selectionBox, active: false };
			if (draggingGuide) draggingGuide = null; // Cancel guide drag
			// clearSelection(); // Optional: Clear selection on Escape
		}

		// Handle Spacebar for panning activation
		if (e.key === ' ' && !spacebarHeld) {
			// Prevent spacebar triggering buttons/etc. if focus is on them
			if (
				!(
					e.target instanceof HTMLButtonElement ||
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLSelectElement ||
					e.target instanceof HTMLTextAreaElement
				)
			) {
				e.preventDefault(); // Prevent page scroll down
			}
			spacebarHeld = true;
			document.body.classList.add('space-panning-possible');
			return; // Don't process other shortcuts while holding space
		}

		if (
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement ||
			e.target instanceof HTMLSelectElement ||
			(e.target as HTMLElement).closest('.allow-input')
		) {
			return; // Don't interfere with typing
		}

		// --- Other Shortcuts (only if spacebar not held) ---
		if (spacebarHeld) return;

		let dx = 0,
			dy = 0;
		const step = e.shiftKey ? 10 : 1;
		let needsUpdate = false;

		switch (e.key) {
			case 'ArrowUp':
				dy = -step;
				needsUpdate = true;
				break;
			case 'ArrowDown':
				dy = step;
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
					e.preventDefault();
					deleteSelected();
				}
				break;
			case 'd':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					duplicateSelected();
				}
				break;
			case 'a':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					selectAllComponents();
				}
				break;
			case 'g':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					toggleSnap();
				}
				break;
			case 'h':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					toggleGuides();
				}
				break;
			case '=':
			case '+':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					handleZoomIn();
				}
				break; // Zoom In
			case '-':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					handleZoomOut();
				}
				break; // Zoom Out
			case '0':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					resetZoomAndCenter();
				}
				break; // Reset Zoom (Ctrl+0)
			default:
				return;
		}

		if (needsUpdate && multiSelectedComponentIds.length > 0) {
			e.preventDefault();
			multiSelectedComponentIds.forEach((id) => {
				const comp = $componentsStore.find((c) => c.id === id);
				if (comp) {
					let newX = comp.x + dx;
					let newY = comp.y + dy;
					// Optional: Snap after keyboard move
					// newX = snapToGrid(newX); newY = snapToGrid(newY);
					updateComponent(id, { x: newX, y: newY });
				}
			});
			if (selectedComponent && multiSelectedComponentIds.includes(selectedComponent.id)) {
				selectedComponent = $componentsStore.find((c) => c.id === selectedComponent?.id) || null;
			}
		}
	}

	// Add Key Up handler for Spacebar
	function handleKeyUp(e: KeyboardEvent): void {
		if (e.key === ' ') {
			spacebarHeld = false;
			document.body.classList.remove('space-panning-possible');
			// If panning was active via spacebar, stop it on key release
			if (isPanning && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
				// Check no modifiers held
				isPanning = false;
				document.body.classList.remove('panning');
			}
		}
	}

	function handleContextMenu(e: MouseEvent): void {
		// Prevent context menu during active interactions like drag/pan/resize/select
		if (isDragging || isPanning || isResizing || isSelecting || draggingGuide) {
			return;
		}
		e.preventDefault();
		showContextMenu = true;
		contextMenuX = e.clientX;
		contextMenuY = e.clientY;
		contextMenuTarget = e.target;
	}

	function closeContextMenu(): void {
		if (showContextMenu) {
			showContextMenu = false;
			contextMenuTarget = null;
		}
	}

	// --- Component/Guide Interaction Callbacks ---

	function onStartDrag(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; component: SurveyComponentType };
		// If spacebar held, initiate panning instead of dragging
		if (spacebarHeld) {
			startPanInteraction(detail.event);
			detail.event.stopPropagation(); // Prevent component drag logic
			detail.event.preventDefault();
			return;
		}
		// --- Original Drag Logic ---
		if (detail.event.button !== 0) return;
		isDragging = true;
		activeComponentId = detail.component.id;
		startX = detail.event.clientX;
		startY = detail.event.clientY;
		// Selection logic (unchanged)
		if (detail.event.shiftKey) {
			if (multiSelectedComponentIds.includes(detail.component.id)) {
				multiSelectedComponentIds = multiSelectedComponentIds.filter(
					(id) => id !== detail.component.id
				);
				if (selectedComponent?.id === detail.component.id) {
					selectedComponent =
						multiSelectedComponentIds.length > 0
							? $componentsStore.find((c) => c.id === multiSelectedComponentIds[0]) || null
							: null;
				}
			} else {
				multiSelectedComponentIds = [...multiSelectedComponentIds, detail.component.id];
				selectedComponent = detail.component;
			}
		} else {
			if (!multiSelectedComponentIds.includes(detail.component.id)) {
				selectedComponent = detail.component;
				multiSelectedComponentIds = [detail.component.id];
			} else if (multiSelectedComponentIds.length > 1) {
				selectedComponent = detail.component;
			}
		}
		dragInitialPositions.clear();
		multiSelectedComponentIds.forEach((id) => {
			const comp = $componentsStore.find((c) => c.id === id);
			if (comp) dragInitialPositions.set(id, { x: comp.x, y: comp.y });
		});
		detail.event.preventDefault();
		closeContextMenu();
	}

	function onStartResize(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; component: SurveyComponentType };
		// Prevent resize if spacebar held (should trigger pan instead)
		if (spacebarHeld || detail.event.button !== 0) return;

		isResizing = true;
		activeComponentId = detail.component.id;
		startX = detail.event.clientX;
		startY = detail.event.clientY;
		updateComponent(detail.component.id, {
			startX: detail.component.width,
			startY: detail.component.height
		});
		selectedComponent = detail.component;
		multiSelectedComponentIds = [detail.component.id];
		detail.event.stopPropagation();
		detail.event.preventDefault();
		closeContextMenu();
	}

	function handleCanvasClick(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent }; // Don't need x/y from event now
		const currentTime = Date.now();

		// Double-click detection removed (now handled by ruler)
		// if (currentTime - lastClickTime < 300) { ... }
		lastClickTime = currentTime;

		if (!isDragging && !isResizing && !isSelecting && !detail.event.shiftKey && !spacebarHeld) {
			clearSelection();
			// Also clear selection box visually if it was left over
			if (selectionBox.active) {
				selectionBox = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };
			}
		}
		closeContextMenu();
	}

	function handleSelectComponent(e: CustomEvent): void {
		// Prevent selection changes if spacebar is held (pan is active)
		if (spacebarHeld) return;

		const component = e.detail.component as SurveyComponentType;
		const event = e.detail.event as MouseEvent;
		if (!isDragging && !isResizing) {
			if (event.shiftKey) {
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
				if (
					!multiSelectedComponentIds.includes(component.id) ||
					multiSelectedComponentIds.length > 1
				) {
					selectedComponent = component;
					multiSelectedComponentIds = [component.id];
				}
			}
		}
		closeContextMenu();
	}

	function onStartSelectionBox(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent }; // Don't need x/y
		// Check spacebar held handled in CanvasViewport now
		startSelectionInteraction(detail.event);
	}

	function updateSelectionFromBox(): void {
		if (!selectionBox.active) return;
		const minX = Math.min(selectionBox.startX, selectionBox.endX);
		const maxX = Math.max(selectionBox.startX, selectionBox.endX);
		const minY = Math.min(selectionBox.startY, selectionBox.endY);
		const maxY = Math.max(selectionBox.startY, selectionBox.endY);

		const newlySelectedIds = $componentsStore
			.filter(
				(comp) =>
					comp.x + comp.width / 2 > minX &&
					comp.x + comp.width / 2 < maxX &&
					comp.y + comp.height / 2 > minY &&
					comp.y + comp.height / 2 < maxY
			)
			.map((comp) => comp.id);

		// Simple override selection, add shiftKey logic if additive box selection is needed
		multiSelectedComponentIds = newlySelectedIds;
		selectedComponent =
			multiSelectedComponentIds.length > 0
				? $componentsStore.find((c) => c.id === multiSelectedComponentIds[0]) || null
				: null;
	}

	function onStartPan(e: CustomEvent): void {
		// Middle mouse pan OR space+drag pan now calls startPanInteraction directly
		const event = e.detail as MouseEvent;
		startPanInteraction(event);
		event.preventDefault(); // Prevent default middle-mouse scroll or space+drag scroll
	}

	function onStartGuideMove(e: CustomEvent): void {
		// Prevent guide move if spacebar held (should pan instead)
		if (spacebarHeld) {
			// Cast needed if type inference isn't perfect
			const detail = e.detail as { event: MouseEvent };
			startPanInteraction(detail.event);
			detail.event?.stopPropagation(); // Use optional chaining if event might be missing
			detail.event?.preventDefault();
			return;
		}
		const detail = e.detail as {
			direction: 'horizontal' | 'vertical';
			index: number;
			event: MouseEvent;
		};
		draggingGuide = { direction: detail.direction, index: detail.index }; // Store guide info
		// startX/Y not strictly needed here if mouse move calculation is absolute based on current mouse pos
		closeContextMenu();
	}

	// NEW Handler for guide creation from ruler dblclick
	function handleAddGuide(
		e: CustomEvent<{ direction: 'horizontal' | 'vertical'; position: number }>
	) {
		const { direction: rulerDirection, position } = e.detail; // Rename to avoid confusion
		const snappedPosition = snapToGrid(position); // Snap new guide to grid

		// --- UPDATED LOGIC ---
		if (rulerDirection === 'horizontal') {
			// Horizontal Ruler Clicked -> Create VERTICAL Guide at this X position
			if (!verticalGuides.includes(snappedPosition)) {
				// Optional: Prevent duplicates
				verticalGuides = [...verticalGuides, snappedPosition].sort((a, b) => a - b);
			}
		} else {
			// rulerDirection === 'vertical'
			// Vertical Ruler Clicked -> Create HORIZONTAL Guide at this Y position
			if (!horizontalGuides.includes(snappedPosition)) {
				// Optional: Prevent duplicates
				horizontalGuides = [...horizontalGuides, snappedPosition].sort((a, b) => a - b);
			}
		}
		// --- END UPDATED LOGIC ---
	}

	// Adjusted for event detail from CanvasGuide
	function handleRemoveGuide(
		e: CustomEvent<{ direction: 'horizontal' | 'vertical'; index: number }>
	): void {
		const { direction, index } = e.detail;
		if (direction === 'horizontal') {
			if (index >= 0 && index < horizontalGuides.length) {
				horizontalGuides.splice(index, 1);
				horizontalGuides = [...horizontalGuides];
			}
		} else {
			if (index >= 0 && index < verticalGuides.length) {
				verticalGuides.splice(index, 1);
				verticalGuides = [...verticalGuides];
			}
		}
		closeContextMenu();
	}

	// --- Actions ---

	function clearSelection(): void {
		selectedComponent = null;
		multiSelectedComponentIds = [];
	}

	function selectAllComponents(): void {
		multiSelectedComponentIds = $componentsStore.map((comp) => comp.id);
		selectedComponent = multiSelectedComponentIds.length > 0 ? $componentsStore[0] : null;
		closeContextMenu();
	}

	function resetZoomAndCenter(): void {
		if (viewportWrapperRef) {
			// Recalculate viewport dimensions before resetting
			viewportWidth = viewportWrapperRef.clientWidth;
			viewportHeight = viewportWrapperRef.clientHeight;
			canvasViewStore.resetZoom(viewportWidth, viewportHeight);
		} else {
			// Fallback if ref not ready
			canvasViewStore.setCanvasTransform(1, 0, 0);
		}
	}

	function handleZoomIn(): void {
		canvasViewStore.zoomIn();
	}
	function handleZoomOut(): void {
		canvasViewStore.zoomOut();
	}

	function duplicateSelected(): void {
		if (multiSelectedComponentIds.length === 0) return;
		const newIds: string[] = [];
		multiSelectedComponentIds.forEach((id) => {
			const newId = duplicateComponent(id);
			if (newId) newIds.push(newId);
		});
		tick().then(() => {
			multiSelectedComponentIds = newIds;
			selectedComponent =
				newIds.length > 0 ? $componentsStore.find((c) => c.id === newIds[0]) || null : null;
		});
		closeContextMenu();
	}

	function deleteSelected(): void {
		if (multiSelectedComponentIds.length > 0) {
			multiSelectedComponentIds.forEach((id) => deleteComponent(id));
			clearSelection();
		}
		closeContextMenu();
	}

	function toggleUnits(): void {
		const unitOrder: Array<'cm' | 'inches' | 'px'> = ['cm', 'inches', 'px'];
		const currentIndex = unitOrder.indexOf(units);
		units = unitOrder[(currentIndex + 1) % unitOrder.length];
		gridSize = getGridSize();
	}

	function toggleSnap(): void {
		enableSnap = !enableSnap;
	}
	function toggleGuides(): void {
		showGuides = !showGuides;
	}

	function autoPosition(): void {
		/* ... (unchanged) ... */
		const components = $componentsStore;
		if (components.length < 1) return;
		const PADDING = 20;
		const GAP = 15;
		let currentX = PADDING;
		let currentY = PADDING;
		let maxRowHeight = 0;
		const currentCanvasWidth = $canvasViewStore.width;
		const sortedComponents = [...components].sort((a, b) => a.y - b.y || a.x - b.x);
		sortedComponents.forEach((component) => {
			if (currentX + component.width + PADDING > currentCanvasWidth && currentX > PADDING) {
				currentX = PADDING;
				currentY += maxRowHeight + GAP;
				maxRowHeight = 0;
			}
			updateComponent(component.id, { x: currentX, y: currentY });
			maxRowHeight = Math.max(maxRowHeight, component.height);
			currentX += component.width + GAP;
		});
	}

	function alignComponents(
		alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
	): void {
		/* ... (unchanged) ... */
		if (multiSelectedComponentIds.length <= 1) return;
		const selectedComps = $componentsStore.filter((c) => multiSelectedComponentIds.includes(c.id));
		if (selectedComps.length <= 1) return;
		const primary =
			selectedComponent && multiSelectedComponentIds.includes(selectedComponent.id)
				? selectedComponent
				: selectedComps[0];
		let targetX: number | undefined, targetY: number | undefined;
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
		selectedComps.forEach((comp) => {
			if (comp.id === primary.id) return;
			let newX = comp.x,
				newY = comp.y;
			if (targetX !== undefined) {
				if (alignment === 'left') newX = targetX;
				else if (alignment === 'center') newX = targetX - comp.width / 2;
				else if (alignment === 'right') newX = targetX - comp.width;
			}
			if (targetY !== undefined) {
				if (alignment === 'top') newY = targetY;
				else if (alignment === 'middle') newY = targetY - comp.height / 2;
				else if (alignment === 'bottom') newY = targetY - comp.height;
			}
			updateComponent(comp.id, { x: Math.round(newX), y: Math.round(newY) });
		});
	}

	function distributeComponents(direction: 'horizontal' | 'vertical'): void {
		/* ... (unchanged, check logic carefully) ... */
		if (multiSelectedComponentIds.length <= 2) return;
		const selectedComps = $componentsStore
			.filter((c) => multiSelectedComponentIds.includes(c.id))
			.map((c) => ({ ...c }));
		if (selectedComps.length <= 2) return;

		if (direction === 'horizontal') {
			selectedComps.sort((a, b) => a.x - b.x);
			const first = selectedComps[0];
			const last = selectedComps[selectedComps.length - 1];
			const totalRange = last.x + last.width - first.x;
			const totalWidth = selectedComps.reduce((sum, comp) => sum + comp.width, 0);
			const totalSpacing = Math.max(0, totalRange - totalWidth);
			const gap = selectedComps.length > 1 ? totalSpacing / (selectedComps.length - 1) : 0;
			let currentX = first.x;
			selectedComps.forEach((comp, index) => {
				// Use index to avoid modifying the first one based on itself
				if (index > 0) {
					// Start positioning from the second component
					currentX += selectedComps[index - 1].width + gap; // Position based on previous component's end + gap
					updateComponent(comp.id, { x: Math.round(currentX) });
				}
				// For the first component, its initial position is the anchor.
			});
		} else {
			// Vertical
			selectedComps.sort((a, b) => a.y - b.y);
			const first = selectedComps[0];
			const last = selectedComps[selectedComps.length - 1];
			const totalRange = last.y + last.height - first.y;
			const totalHeight = selectedComps.reduce((sum, comp) => sum + comp.height, 0);
			const totalSpacing = Math.max(0, totalRange - totalHeight);
			const gap = selectedComps.length > 1 ? totalSpacing / (selectedComps.length - 1) : 0;
			let currentY = first.y;
			selectedComps.forEach((comp, index) => {
				if (index > 0) {
					currentY += selectedComps[index - 1].height + gap;
					updateComponent(comp.id, { y: Math.round(currentY) });
				}
			});
		}
	}

	// --- Lifecycle ---
	onMount(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === viewportWrapperRef) {
					viewportWidth = entry.contentRect.width;
					viewportHeight = entry.contentRect.height;
				}
			}
		});
		if (viewportWrapperRef) {
			resizeObserver.observe(viewportWrapperRef);
			viewportWidth = viewportWrapperRef.clientWidth;
			viewportHeight = viewportWrapperRef.clientHeight;
			// Optional: Center on mount after dimensions known
			// tick().then(() => { resetZoomAndCenter(); });
		}

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('mouseleave', handleMouseLeave);
		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('keyup', handleKeyUp); // Add keyup listener

		loadSurvey();

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('keyup', handleKeyUp); // Remove keyup listener
			document.body.classList.remove('panning', 'space-panning-possible');
		};
	});

	// --- External Control ---
	export function setSelectedComponent(comp: SurveyComponentType | null): void {
		/* ... (unchanged) ... */
		if (comp) {
			selectedComponent = comp;
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
		class:space-panning={spacebarHeld}
	>
		<!-- Horizontal Ruler -->
		<div
			class="absolute top-0 right-0 z-20"
			style="left: {RULER_SIZE}px; height: {RULER_SIZE}px;"
			aria-hidden="true"
		>
			<CanvasRuler
				direction="horizontal"
				scale={$canvasViewStore.scale}
				offset={$canvasViewStore.offsetX}
				viewLength={viewportWidth}
				{units}
				mousePos={mouseX_Viewport}
				on:addGuide={handleAddGuide}
			/>
		</div>

		<!-- Vertical Ruler -->
		<div
			class="absolute bottom-0 left-0 z-20"
			style="top: {RULER_SIZE}px; width: {RULER_SIZE}px;"
			aria-hidden="true"
		>
			<CanvasRuler
				direction="vertical"
				scale={$canvasViewStore.scale}
				offset={$canvasViewStore.offsetY}
				viewLength={viewportHeight}
				{units}
				mousePos={mouseY_Viewport}
				on:addGuide={handleAddGuide}
			/>
		</div>

		<!-- Corner Box -->
		<div
			class="absolute top-0 left-0 z-20 border-r border-b border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800"
			style="width: {RULER_SIZE}px; height: {RULER_SIZE}px;"
			aria-hidden="true"
		></div>

		<!-- Canvas Viewport Wrapper (for scroll/wheel/size observation) -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			bind:this={viewportWrapperRef}
			class="canvas-viewport-wrapper absolute overflow-hidden bg-gray-200 focus:outline-none dark:bg-gray-700"
			style="top: {RULER_SIZE}px; left: {RULER_SIZE}px; bottom: 0; right: 0;"
			on:wheel={handleWheel}
			tabindex="0"
			role="region"
			aria-label="Canvas Viewport"
		>
			<!-- The actual canvas content area -->
			<CanvasViewport
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
				{spacebarHeld}
				on:startSelectionBox={onStartSelectionBox}
				on:canvasClick={handleCanvasClick}
				on:startPan={onStartPan}
				on:startGuideMove={onStartGuideMove}
				on:removeGuide={handleRemoveGuide}
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

	<!-- Context Menu -->
	{#if showContextMenu}
		<ContextMenu
			x={contextMenuX}
			y={contextMenuY}
			{selectedComponent}
			{multiSelectedComponentIds}
			targetElement={contextMenuTarget}
			on:close={closeContextMenu}
			on:duplicate={duplicateSelected}
			on:delete={deleteSelected}
			on:removeGuide={handleRemoveGuide}
			on:properties={() => console.log('Properties action triggered')}
			on:selectAll={selectAllComponents}
			on:autoPosition={autoPosition}
		/>
	{/if}
</div>

<style>
	/* Apply grab/grabbing cursor globally when panning */
	:global(body.panning),
	:global(body.panning *) {
		cursor: grabbing !important;
	}

	/* Apply grab cursor when spacebar is held over the canvas area */
	.canvas-viewport-wrapper:has(+ :global(body.space-panning-possible)) {
		cursor: grab;
	}
	/* More specific rule for space+drag */
	:global(body.space-panning-possible) .canvas-viewport-wrapper {
		cursor: grab;
	}

	/* Ensure wrapper fills space */
	.canvas-viewport-wrapper {
		/* Positioned absolute by style */
	}
</style>
