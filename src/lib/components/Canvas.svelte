<!-- src/lib/components/Canvas.svelte -->
<script lang="ts">
	import { get } from 'svelte/store';
	import domtoimage from 'dom-to-image-more';
	import {
		selectedComponentIds,
		primarySelectedComponentId,
		canAlign,
		alignSelectedComponents,
		clearSelectionState,
		selectAllComponentsState
	} from '$lib/stores/alignmentStore.ts';
	import { canDistribute, distributeSelectedComponents } from '$lib/stores/distributionStore.ts';
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
	import { browser } from '$app/environment';
	import CanvasToolbar from '$lib/components/CanvasComponents/CanvasToolbar.svelte';
	import ToolbarAlign from '$lib/components/CanvasComponents/ToolbarAlignment.svelte';
	import ToolbarDistribute from '$lib/components/CanvasComponents/ToolbarDistribute.svelte';
	import CanvasRuler from '$lib/components/CanvasComponents/CanvasRuler.svelte';
	import CanvasViewport from '$lib/components/CanvasComponents/CanvasViewport.svelte';
	import ContextMenu from '$lib/components/CanvasComponents/ContextMenu.svelte';
	import StatusBar from '$lib/components/CanvasComponents/StatusBar.svelte';

	type GuideInfo = { direction: 'horizontal' | 'vertical'; index: number; position: number };

	export let selectedComponent: SurveyComponentType | null = null;
	export let units: 'cm' | 'inches' | 'px' = 'cm';

	let viewportWidth = 0;
	let viewportHeight = 0;
	let containerRef: HTMLDivElement;
	let viewportWrapperRef: HTMLDivElement;
	let mouseX_Viewport = 0;
	let mouseY_Viewport = 0;
	let mouseX_Canvas = 0;
	let mouseY_Canvas = 0;
	let isDragging = false;
	let isResizing = false;
	let isPanning = false;
	let isSelecting = false;
	let spacebarHeld = false;
	let startX = 0;
	let startY = 0;
	let startOffsetX_Interaction = 0;
	let startOffsetY_Interaction = 0;
	let activeComponentId_Interaction: string | null = null;
	let dragInitialPositions = new Map<string, { x: number; y: number }>();
	let dragThresholdMet = false;
	const DRAG_THRESHOLD = 5;
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
	let contextMenuGuideInfo: GuideInfo | null = null;

	$: selectedComponentId = $primarySelectedComponentId;
	$: multiSelectedComponentIds = $selectedComponentIds;

	function showAlert(message: string, color: string = 'blue', duration: number = 3000): void {
		console.log(`ALERT (${color}): ${message}`);
	}

	export async function exportCanvasAsImage(format: 'png' | 'jpeg'): Promise<void> {
		// console.log(`Canvas: exportCanvasAsImage (${format}) using dom-to-image-more`);
		if (!viewportWrapperRef) {
			showAlert('Export failed: Viewport not ready.', 'red');
			return;
		}
		const targetElement = viewportWrapperRef.querySelector(
			'#canvas-content-capture-area'
		) as HTMLElement;
		// console.log('Canvas: Target Element Found:', targetElement);
		if (!targetElement) {
			showAlert('Export failed: Target element not found.', 'red');
			return;
		}

		// Find grid element
		const gridElement = targetElement.querySelector('.canvas-grid-container') as HTMLElement | null;
		const originalGridDisplay = gridElement ? gridElement.style.display : '';

		const originalSelection = get(selectedComponentIds);
		const originalPrimary = get(primarySelectedComponentId);
		// console.log('Canvas: Clearing selection and hiding grid before export.');
		clearSelectionState();
		selectionBox = { ...selectionBox, active: false };
		if (gridElement) gridElement.style.display = 'none'; // Hide grid
		await tick();

		const options = {
			quality: format === 'jpeg' ? 0.95 : 1.0,
			bgcolor: '#ffffff',
			width: targetElement.offsetWidth,
			height: targetElement.offsetHeight
		};
		// console.log('Canvas: dom-to-image options:', options);

		try {
			let dataUrl: string;
			// console.log(`Canvas: Calling domtoimage.${format === 'jpeg' ? 'toJpeg' : 'toPng'}...`);
			if (format === 'jpeg') {
				dataUrl = await domtoimage.toJpeg(targetElement, options);
			} else {
				dataUrl = await domtoimage.toPng(targetElement, options);
			}
			// console.log('Canvas: dom-to-image call succeeded.');
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = `survey-canvas-${Date.now()}.${format}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			// console.log('Canvas: Download triggered.');
			showAlert(`Canvas exported as ${format.toUpperCase()}.`, 'green');
		} catch (error) {
			console.error(`Canvas: Error during dom-to-image call (${format}):`, error);
			showAlert('Export failed. See console for details.', 'red');
		} finally {
			// console.log('Canvas: Restoring selection state and grid.');
			if (gridElement) gridElement.style.display = originalGridDisplay; // Restore grid display
			selectedComponentIds.set(originalSelection);
			primarySelectedComponentId.set(originalPrimary);
			await tick();
			// console.log('Canvas: Selection state and grid restored.');
		}
	}

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
	function updateCanvasSize(detail: { width: number; height: number }): void {
		canvasViewStore.setCanvasDimensions(detail.width, detail.height);
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
		return { x: clientX - viewportRect.left, y: clientY - viewportRect.top };
	}
	function calculateCanvasMousePos(clientX: number, clientY: number): { x: number; y: number } {
		if (!viewportWrapperRef) return { x: 0, y: 0 };
		const { x: mouseX_VP, y: mouseY_VP } = calculateViewportMousePos(clientX, clientY);
		const { offsetX, offsetY, scale } = $canvasViewStore;
		return { x: (mouseX_VP - offsetX) / scale, y: (mouseY_VP - offsetY) / scale };
	}
	function startPanInteraction(event: MouseEvent): void {
		if (isPanning) return;
		isPanning = true;
		startX = event.clientX;
		startY = event.clientY;
		startOffsetX_Interaction = $canvasViewStore.offsetX;
		startOffsetY_Interaction = $canvasViewStore.offsetY;
		document.body.style.cursor = 'grabbing';
		closeContextMenu();
	}
	function startSelectionInteraction(event: MouseEvent): void {
		if (isSelecting || spacebarHeld || event.button !== 0) return;
		const { x: canvasStartX, y: canvasStartY } = calculateCanvasMousePos(
			event.clientX,
			event.clientY
		);
		isSelecting = true;
		dragThresholdMet = false;
		startX = event.clientX;
		startY = event.clientY;
		selectionBox = {
			active: true,
			startX: canvasStartX,
			startY: canvasStartY,
			endX: canvasStartX,
			endY: canvasStartY
		};
		if (!event.shiftKey) {
			clearSelectionState();
		}
		closeContextMenu();
	}
	function handleMouseMove(e: MouseEvent): void {
		const currentScale = $canvasViewStore.scale;
		const { x: vpX, y: vpY } = calculateViewportMousePos(e.clientX, e.clientY);
		mouseX_Viewport = vpX;
		mouseY_Viewport = vpY;
		const { x: currentCanvasX, y: currentCanvasY } = calculateCanvasMousePos(e.clientX, e.clientY);
		mouseX_Canvas = currentCanvasX;
		mouseY_Canvas = currentCanvasY;
		if (!dragThresholdMet && (isDragging || isResizing || isSelecting || draggingGuide)) {
			const dx = Math.abs(e.clientX - startX);
			const dy = Math.abs(e.clientY - startY);
			if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
				dragThresholdMet = true;
			}
		}
		if (isPanning) {
			const dx_viewport = e.clientX - startX;
			const dy_viewport = e.clientY - startY;
			canvasViewStore.setCanvasOffset(
				startOffsetX_Interaction + dx_viewport,
				startOffsetY_Interaction + dy_viewport
			);
		} else if (isDragging && activeComponentId_Interaction && dragThresholdMet) {
			const dx_canvas = (e.clientX - startX) / currentScale;
			const dy_canvas = (e.clientY - startY) / currentScale;
			const currentSelectedIds = get(selectedComponentIds);
			currentSelectedIds.forEach((id) => {
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
		} else if (isResizing && activeComponentId_Interaction && dragThresholdMet) {
			const component = $componentsStore.find((c) => c.id === activeComponentId_Interaction);
			if (!component || component.startX === undefined || component.startY === undefined) return;
			const dx_canvas = (e.clientX - startX) / currentScale;
			const dy_canvas = (e.clientY - startY) / currentScale;
			const minWidth = 20;
			const minHeight = 20;
			let newWidth = component.startX + dx_canvas;
			let newHeight = component.startY + dy_canvas;
			newWidth = snapToGrid(Math.max(minWidth, newWidth));
			newHeight = snapToGrid(Math.max(minHeight, newHeight));
			updateComponent(activeComponentId_Interaction, { width: newWidth, height: newHeight });
		} else if (draggingGuide && dragThresholdMet) {
			const { scale, offsetX, offsetY } = $canvasViewStore;
			const guideCanvasPos =
				draggingGuide.direction === 'horizontal'
					? (mouseY_Viewport - offsetY) / scale
					: (mouseX_Viewport - offsetX) / scale;
			if (draggingGuide.direction === 'horizontal') {
				horizontalGuides[draggingGuide.index] = snapToGrid(
					snapToGuides(guideCanvasPos, 'vertical')
				);
				horizontalGuides = [...horizontalGuides];
			} else {
				verticalGuides[draggingGuide.index] = snapToGrid(
					snapToGuides(guideCanvasPos, 'horizontal')
				);
				verticalGuides = [...verticalGuides];
			}
		} else if (isSelecting && dragThresholdMet) {
			selectionBox.endX = currentCanvasX;
			selectionBox.endY = currentCanvasY;
			selectionBox = { ...selectionBox, active: true };
			updateSelectionFromBox();
		}
	}

	// *** UPDATED handleMouseUp ***
	function handleMouseUp(e: MouseEvent): void {
		const wasPanning = isPanning;
		const wasDragging = isDragging && dragThresholdMet;
		const wasResizing = isResizing && dragThresholdMet;
		const wasSelecting = isSelecting && dragThresholdMet;
		const wasDraggingGuide = !!draggingGuide && dragThresholdMet;
		const wasInteraction =
			wasPanning || wasDragging || wasResizing || wasSelecting || wasDraggingGuide;

		// Apply final snap for drag/resize if interaction occurred
		if (wasDragging && activeComponentId_Interaction) {
			const currentSelectedIds = get(selectedComponentIds);
			currentSelectedIds.forEach((id) => {
				const comp = $componentsStore.find((c) => c.id === id);
				if (comp) {
					// Calculate final position based on last mouse move (already snapped in handleMouseMove)
					// Or recalculate based on final mouse position and snap again
					const finalCanvasPos = calculateCanvasMousePos(e.clientX, e.clientY);
					const dx_canvas = (e.clientX - startX) / $canvasViewStore.scale;
					const dy_canvas = (e.clientY - startY) / $canvasViewStore.scale;
					const initialPos = dragInitialPositions.get(id);
					if (initialPos) {
						let finalX = initialPos.x + dx_canvas;
						let finalY = initialPos.y + dy_canvas;
						finalX = snapToGuides(finalX, 'horizontal');
						finalY = snapToGuides(finalY, 'vertical');
						finalX = snapToGrid(finalX);
						finalY = snapToGrid(finalY);
						updateComponent(id, { x: finalX, y: finalY });
					}
				}
			});
		} else if (wasResizing && activeComponentId_Interaction) {
			const component = $componentsStore.find((c) => c.id === activeComponentId_Interaction);
			if (component && component.startX !== undefined && component.startY !== undefined) {
				const dx_canvas = (e.clientX - startX) / $canvasViewStore.scale;
				const dy_canvas = (e.clientY - startY) / $canvasViewStore.scale;
				const minWidth = 20;
				const minHeight = 20;
				let finalWidth = component.startX + dx_canvas;
				let finalHeight = component.startY + dy_canvas;
				finalWidth = snapToGrid(Math.max(minWidth, finalWidth));
				finalHeight = snapToGrid(Math.max(minHeight, finalHeight));
				updateComponent(activeComponentId_Interaction, { width: finalWidth, height: finalHeight });
			}
		}

		// Reset states AFTER applying final snap
		if (isPanning) {
			isPanning = false;
			document.body.style.cursor = '';
		}
		if (isDragging) isDragging = false;
		if (isResizing) isResizing = false;
		if (draggingGuide) draggingGuide = null;
		if (isSelecting) {
			isSelecting = false;
			if (dragThresholdMet) selectionBox = { ...selectionBox, active: false };
		}
		activeComponentId_Interaction = null;
		dragInitialPositions.clear();
		dragThresholdMet = false;
	}
	// *** End UPDATED handleMouseUp ***

	function handleMouseLeave(e: MouseEvent): void {
		if (
			e.relatedTarget === null &&
			(isDragging || isResizing || isPanning || isSelecting || draggingGuide)
		) {
			handleMouseUp(e);
		}
	}
	function handleWheel(e: WheelEvent): void {
		if (showContextMenu) return;
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			const delta = -e.deltaY * ZOOM_SENSITIVITY;
			if (viewportWrapperRef) {
				const { x: mouseX_VP, y: mouseY_VP } = calculateViewportMousePos(e.clientX, e.clientY);
				canvasViewStore.adjustZoom(delta, mouseX_VP, mouseY_VP);
			}
		} else if (viewportWrapperRef) {
			e.preventDefault();
			const { offsetX, offsetY } = $canvasViewStore;
			const panX = e.shiftKey ? -e.deltaY : -e.deltaX;
			const panY = e.shiftKey ? -e.deltaX : -e.deltaY;
			canvasViewStore.setCanvasOffset(offsetX + panX, offsetY + panY);
		}
	}
	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			closeContextMenu();
			if (isSelecting) {
				isSelecting = false;
				selectionBox = { ...selectionBox, active: false };
			}
			if (isDragging || isResizing || isPanning || draggingGuide) {
				isDragging = false;
				isResizing = false;
				isPanning = false;
				draggingGuide = null;
				activeComponentId_Interaction = null;
				dragInitialPositions.clear();
				dragThresholdMet = false;
				document.body.style.cursor = '';
				if (viewportWrapperRef) viewportWrapperRef.style.cursor = '';
			}
			clearSelectionState();
			selectionBox = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };
			return;
		}
		if (e.key === ' ' && !spacebarHeld) {
			if (
				!(
					e.target instanceof HTMLButtonElement ||
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLSelectElement ||
					e.target instanceof HTMLTextAreaElement
				)
			) {
				e.preventDefault();
			}
			spacebarHeld = true;
			if (viewportWrapperRef) viewportWrapperRef.style.cursor = 'grab';
			return;
		}
		if (
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement ||
			e.target instanceof HTMLSelectElement ||
			(e.target as HTMLElement).closest('.allow-input')
		) {
			return;
		}
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
				if ($selectedComponentIds.length > 0) {
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
				break;
			case '-':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					handleZoomOut();
				}
				break;
			case '0':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					resetZoomAndCenter();
				}
				break;
			default:
				return;
		}
		if (needsUpdate && $selectedComponentIds.length > 0) {
			e.preventDefault();
			$selectedComponentIds.forEach((id) => {
				const comp = $componentsStore.find((c) => c.id === id);
				if (comp) {
					let newX = comp.x + dx;
					let newY = comp.y + dy;
					updateComponent(id, { x: newX, y: newY });
				}
			});
		}
	}
	function handleKeyUp(e: KeyboardEvent): void {
		if (e.key === ' ') {
			spacebarHeld = false;
			if (viewportWrapperRef) viewportWrapperRef.style.cursor = '';
			if (isPanning && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
				isPanning = false;
				document.body.style.cursor = '';
			}
		}
	}
	function handleContextMenu(event: MouseEvent): void {
		const targetElement = event.target as Element;
		if (
			isDragging ||
			isPanning ||
			isResizing ||
			isSelecting ||
			draggingGuide ||
			targetElement.closest('.ruler-container') ||
			targetElement.closest('.guide')
		) {
			return;
		}
		event.preventDefault();
		contextMenuGuideInfo = null;
		showContextMenu = true;
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
		const componentElement = targetElement.closest('.component');
		if (componentElement instanceof HTMLElement) {
			const componentId = componentElement.dataset.componentId;
			if (componentId && !$selectedComponentIds.includes(componentId) && !event.shiftKey) {
				selectedComponentIds.set([componentId]);
				primarySelectedComponentId.set(componentId);
			}
		}
	}
	function handleRulerContextMenu(
		e: CustomEvent<{ direction: 'horizontal' | 'vertical'; position: number; event: MouseEvent }>
	): void {
		const { direction: rulerDirection, position: canvasClickPos, event } = e.detail;
		event.preventDefault();
		const GUIDE_CLICK_THRESHOLD_PX = 5;
		const { scale, offsetX, offsetY } = $canvasViewStore;
		let closestGuideInfo: GuideInfo | null = null;
		let minDistance = GUIDE_CLICK_THRESHOLD_PX;
		if (rulerDirection === 'horizontal') {
			const screenClickX = event.offsetX;
			verticalGuides.forEach((guidePos, index) => {
				const guideScreenX = guidePos * scale + offsetX;
				const distance = Math.abs(guideScreenX - screenClickX);
				if (distance < minDistance) {
					minDistance = distance;
					closestGuideInfo = { direction: 'vertical', index, position: guidePos };
				}
			});
		} else {
			const screenClickY = event.offsetY;
			horizontalGuides.forEach((guidePos, index) => {
				const guideScreenY = guidePos * scale + offsetY;
				const distance = Math.abs(guideScreenY - screenClickY);
				if (distance < minDistance) {
					minDistance = distance;
					closestGuideInfo = { direction: 'horizontal', index, position: guidePos };
				}
			});
		}
		contextMenuGuideInfo = closestGuideInfo;
		showContextMenu = true;
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
		closeContextMenu();
		tick().then(() => {
			showContextMenu = true;
			contextMenuX = event.clientX;
			contextMenuY = event.clientY;
		});
	}
	function handleGuideContextMenu(
		e: CustomEvent<{
			direction: 'horizontal' | 'vertical';
			index: number;
			position: number;
			event: MouseEvent;
		}>
	): void {
		const { direction, index, position, event } = e.detail;
		event.preventDefault();
		contextMenuGuideInfo = { direction, index, position };
		showContextMenu = true;
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
		closeContextMenu();
		tick().then(() => {
			showContextMenu = true;
			contextMenuX = event.clientX;
			contextMenuY = event.clientY;
		});
	}
	function closeContextMenu(): void {
		if (showContextMenu) {
			showContextMenu = false;
			contextMenuGuideInfo = null;
		}
	}
	function handleDeleteGuide(e: CustomEvent<GuideInfo>): void {
		const { direction, index } = e.detail;
		handleRemoveGuide({ detail: { direction, index } } as CustomEvent<{
			direction: 'horizontal' | 'vertical';
			index: number;
		}>);
		closeContextMenu();
	}
	function handleSetGuidePosition(e: CustomEvent<GuideInfo>): void {
		const { direction, index, position } = e.detail;
		const currentPos = position.toFixed(1);
		const newPositionStr = prompt(
			`Set new position for ${direction} guide (current: ${currentPos}px):`,
			`${currentPos}`
		);
		closeContextMenu();
		if (newPositionStr !== null) {
			const newPosition = parseFloat(newPositionStr);
			if (!isNaN(newPosition)) {
				const snappedNewPosition = snapToGrid(newPosition);
				if (direction === 'horizontal') {
					if (index >= 0 && index < horizontalGuides.length) {
						horizontalGuides[index] = snappedNewPosition;
						horizontalGuides.sort((a, b) => a - b);
						horizontalGuides = [...horizontalGuides];
					}
				} else {
					if (index >= 0 && index < verticalGuides.length) {
						verticalGuides[index] = snappedNewPosition;
						verticalGuides.sort((a, b) => a - b);
						verticalGuides = [...verticalGuides];
					}
				}
			} else {
				alert('Invalid position entered. Please enter a number.');
			}
		}
	}
	function handleClearSelection(): void {
		if (
			!isDragging &&
			!isResizing &&
			!isSelecting &&
			!isPanning &&
			!spacebarHeld &&
			!dragThresholdMet
		) {
			clearSelectionState();
			selectionBox = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };
		}
		closeContextMenu();
	}
	function handleSelectComponent(
		e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>
	): void {
		const { component, event } = e.detail;
		if (isDragging || isResizing || isSelecting || spacebarHeld || dragThresholdMet) return;
		let currentSelection = get(selectedComponentIds);
		let newSelection: string[];
		let newPrimaryId: string | null = null;
		const clickedId = component.id;
		if (event.shiftKey) {
			if (currentSelection.includes(clickedId)) {
				newSelection = currentSelection.filter((id) => id !== clickedId);
				if (get(primarySelectedComponentId) === clickedId) {
					newPrimaryId = newSelection.length > 0 ? newSelection[0] : null;
				} else {
					newPrimaryId = get(primarySelectedComponentId);
				}
			} else {
				newSelection = [...currentSelection, clickedId];
				newPrimaryId = clickedId;
			}
		} else {
			newSelection = [clickedId];
			newPrimaryId = clickedId;
		}
		selectedComponentIds.set(newSelection);
		primarySelectedComponentId.set(newPrimaryId);
		closeContextMenu();
	}
	function onStartSelectionBox(e: CustomEvent<{ event: MouseEvent }>): void {
		const { event } = e.detail;
		startSelectionInteraction(event);
	}
	function onStartDrag(
		e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>
	): void {
		const { event, component } = e.detail;
		if (spacebarHeld || event.button !== 0) return;
		let currentSelection = get(selectedComponentIds);
		const clickedId = component.id;
		if (!event.shiftKey) {
			if (!currentSelection.includes(clickedId)) {
				selectedComponentIds.set([clickedId]);
				primarySelectedComponentId.set(clickedId);
			} else {
				primarySelectedComponentId.set(clickedId);
			}
		} else {
			if (currentSelection.includes(clickedId)) {
				const newSelection = currentSelection.filter((id) => id !== clickedId);
				selectedComponentIds.set(newSelection);
				if (get(primarySelectedComponentId) === clickedId) {
					primarySelectedComponentId.set(newSelection.length > 0 ? newSelection[0] : null);
				}
			} else {
				const newSelection = [...currentSelection, clickedId];
				selectedComponentIds.set(newSelection);
				primarySelectedComponentId.set(clickedId);
			}
		}
		isDragging = true;
		activeComponentId_Interaction = component.id;
		startX = event.clientX;
		startY = event.clientY;
		dragThresholdMet = false;
		dragInitialPositions.clear();
		const finalSelectionForDrag = get(selectedComponentIds);
		finalSelectionForDrag.forEach((id) => {
			const comp = $componentsStore.find((c) => c.id === id);
			if (comp) dragInitialPositions.set(id, { x: comp.x, y: comp.y });
		});
		event.preventDefault();
		event.stopPropagation();
		closeContextMenu();
	}
	function onStartResize(
		e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>
	): void {
		const { event, component } = e.detail;
		if (spacebarHeld || event.button !== 0) return;
		isResizing = true;
		activeComponentId_Interaction = component.id;
		startX = event.clientX;
		startY = event.clientY;
		dragThresholdMet = false;
		updateComponent(component.id, { startX: component.width, startY: component.height });
		selectedComponentIds.set([component.id]);
		primarySelectedComponentId.set(component.id);
		event.stopPropagation();
		event.preventDefault();
		closeContextMenu();
	}
	function updateSelectionFromBox(): void {
		if (!selectionBox.active || !isSelecting) return;
		const minX = Math.min(selectionBox.startX, selectionBox.endX);
		const maxX = Math.max(selectionBox.startX, selectionBox.endX);
		const minY = Math.min(selectionBox.startY, selectionBox.endY);
		const maxY = Math.max(selectionBox.startY, selectionBox.endY);
		const newlySelectedIds = $componentsStore
			.filter((comp) => {
				const centerX = comp.x + comp.width / 2;
				const centerY = comp.y + comp.height / 2;
				return centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY;
			})
			.map((comp) => comp.id);
		selectedComponentIds.set(newlySelectedIds);
		primarySelectedComponentId.set(newlySelectedIds.length > 0 ? newlySelectedIds[0] : null);
	}
	function onStartPan(e: CustomEvent<MouseEvent>): void {
		const event = e.detail;
		startPanInteraction(event);
		event.preventDefault();
	}
	function onStartGuideMove(
		e: CustomEvent<{ direction: 'horizontal' | 'vertical'; index: number; event: MouseEvent }>
	): void {
		const { event, direction, index } = e.detail;
		if (spacebarHeld) {
			startPanInteraction(event);
			event?.stopPropagation();
			event?.preventDefault();
			return;
		}
		draggingGuide = { direction, index };
		dragThresholdMet = false;
		startX = event.clientX;
		startY = event.clientY;
		closeContextMenu();
	}
	function handleAddGuide(
		e: CustomEvent<{ direction: 'horizontal' | 'vertical'; position: number }>
	): void {
		const { direction: rulerDirection, position } = e.detail;
		const snappedPosition = snapToGrid(position);
		if (rulerDirection === 'horizontal') {
			if (!verticalGuides.includes(snappedPosition)) {
				verticalGuides = [...verticalGuides, snappedPosition].sort((a, b) => a - b);
			}
		} else {
			if (!horizontalGuides.includes(snappedPosition)) {
				horizontalGuides = [...horizontalGuides, snappedPosition].sort((a, b) => a - b);
			}
		}
	}
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
	function selectAllComponents(): void {
		selectAllComponentsState();
		closeContextMenu();
	}
	function resetZoomAndCenter(): void {
		if (viewportWrapperRef) {
			viewportWidth = viewportWrapperRef.clientWidth;
			viewportHeight = viewportWrapperRef.clientHeight;
			canvasViewStore.resetZoom(viewportWidth, viewportHeight);
		} else {
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
		const idsToDup = get(selectedComponentIds);
		if (idsToDup.length === 0) return;
		const newIds: string[] = [];
		idsToDup.forEach((id) => {
			const newId = duplicateComponent(id);
			if (newId) newIds.push(newId);
		});
		tick().then(() => {
			selectedComponentIds.set(newIds);
			primarySelectedComponentId.set(newIds.length > 0 ? newIds[0] : null);
		});
		closeContextMenu();
	}
	function deleteSelected(): void {
		const idsToDelete = get(selectedComponentIds);
		if (idsToDelete.length > 0) {
			idsToDelete.forEach((id) => deleteComponent(id));
			clearSelectionState();
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
		closeContextMenu();
	}
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
			tick().then(resetZoomAndCenter);
		}
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('mouseleave', handleMouseLeave);
		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('click', closeContextMenu);
		loadSurvey();
		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('click', closeContextMenu);
			document.body.style.cursor = '';
		};
	});
	export function setPrimarySelection(compId: string | null): void {
		if (compId) {
			selectedComponentIds.set([compId]);
			primarySelectedComponentId.set(compId);
		} else {
			clearSelectionState();
		}
	}
</script>

<div class="flex h-full w-full flex-col bg-gray-50 dark:bg-gray-900" bind:this={containerRef}>
	<CanvasToolbar
		{units}
		{enableSnap}
		{showGuides}
		on:toggleUnits={toggleUnits}
		on:toggleSnap={toggleSnap}
		on:toggleGuides={toggleGuides}
		on:updateCanvasSize={(e) => updateCanvasSize(e.detail)}
	/>
	<div
		class="flex items-center justify-center gap-x-6 border-b border-gray-300 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800"
	>
		<ToolbarAlign enabled={$canAlign} on:align={(event) => alignSelectedComponents(event.detail)} />
		<ToolbarDistribute
			enabled={$canDistribute}
			on:distribute={(event) => distributeSelectedComponents(event.detail)}
		/>
	</div>
	<div
		role="group"
		aria-label="Canvas Area"
		class="relative flex-1 overflow-hidden"
		oncontextmenu={handleContextMenu}
	>
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
				on:rulerContextMenu={handleRulerContextMenu}
			/>
		</div>
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
				on:rulerContextMenu={handleRulerContextMenu}
			/>
		</div>
		<div
			class="absolute top-0 left-0 z-20 border-r border-b border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800"
			style="width: {RULER_SIZE}px; height: {RULER_SIZE}px;"
			aria-hidden="true"
		></div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			bind:this={viewportWrapperRef}
			class="canvas-viewport-wrapper absolute overflow-hidden bg-gray-200 focus:outline-none dark:bg-gray-700"
			style="top: {RULER_SIZE}px; left: {RULER_SIZE}px; bottom: 0; right: 0;"
			style:cursor={spacebarHeld ? 'grab' : isPanning ? 'grabbing' : 'default'}
			onwheel={handleWheel}
			tabindex="0"
			role="region"
			aria-label="Canvas Viewport"
		>
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
				selectedComponentId={$primarySelectedComponentId}
				multiSelectedComponentIds={$selectedComponentIds}
				{spacebarHeld}
				on:startSelectionBox={onStartSelectionBox}
				on:clearSelection={handleClearSelection}
				on:startPan={onStartPan}
				on:startGuideMove={onStartGuideMove}
				on:removeGuide={handleRemoveGuide}
				on:guideContextMenu={handleGuideContextMenu}
				on:selectComponent={handleSelectComponent}
				on:startDrag={onStartDrag}
				on:startResize={onStartResize}
			/>
		</div>
	</div>
	<StatusBar
		mouseX={mouseX_Canvas}
		mouseY={mouseY_Canvas}
		{units}
		{selectedComponent}
		multiSelectedComponentIds={$selectedComponentIds}
		canvasScale={$canvasViewStore.scale}
		on:resetZoom={resetZoomAndCenter}
	/>
	{#if showContextMenu}
		<ContextMenu
			x={contextMenuX}
			y={contextMenuY}
			{selectedComponent}
			{contextMenuGuideInfo}
			on:close={closeContextMenu}
			on:duplicate={duplicateSelected}
			on:delete={deleteSelected}
			on:deleteGuide={handleDeleteGuide}
			on:setPositionGuide={handleSetGuidePosition}
			on:properties={() => console.log('Properties action triggered')}
			on:selectAll={selectAllComponents}
			on:autoPosition={autoPosition}
		/>
	{/if}
</div>

<style>
	.canvas-viewport-wrapper {
	}
</style>
