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
	} from '$lib/stores/designStore.ts';
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
	} from '$lib/types/types.ts';

	// Import our consolidated utilities
	import {
		createDragHandler,
		createPanHandler,
		calculateMousePosition
	} from '$lib/utils/event-handlers.ts';
	import {
		snapToGrid,
		snapToGuides,
		getComponentsInSelectionBox,
		calculateCanvasMousePosition,
		getGridSize
	} from '$lib/utils/canvas-utils.ts';
	import { debounce, throttle } from '$lib/utils/performance.ts';

	import CanvasToolbar from '$lib/components/CanvasComponents/CanvasToolbar.svelte';
	import ToolbarAlign from '$lib/components/CanvasComponents/ToolbarAlignment.svelte';
	import ToolbarDistribute from '$lib/components/CanvasComponents/ToolbarDistribute.svelte';
	import CanvasRuler from '$lib/components/CanvasComponents/CanvasRuler.svelte';
	import CanvasViewport from '$lib/components/CanvasComponents/CanvasViewport.svelte';
	import ContextMenu from '$lib/components/CanvasComponents/ContextMenu.svelte';
	import StatusBar from '$lib/components/CanvasComponents/StatusBar.svelte';
	import ToolBarMiddle from '$lib/components/CanvasComponents/ToolBarMiddle/ToolBarMiddle.svelte';

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
	let gridSize = getGridSize(units, PIXEL_PER_CM, PIXEL_PER_INCH);
	let showContextMenu = false;
	let contextMenuX = 0;
	let contextMenuY = 0;
	let contextMenuGuideInfo: GuideInfo | null = null;

	let selectedComponentId: string | null;
	let multiSelectedComponentIds: string[];

	const primarySelectedComponentIdStore = primarySelectedComponentId;
	const selectedComponentIdsStore = selectedComponentIds;

	$: selectedComponentId = get(primarySelectedComponentIdStore);
	$: multiSelectedComponentIds = get(selectedComponentIdsStore);

	function showAlert(message: string, color: string = 'blue', duration: number = 3000): void {
		console.log(`ALERT (${color}): ${message}`);
	}

	export async function exportCanvasAsImage(format: 'png' | 'jpeg'): Promise<void> {
		if (!viewportWrapperRef) {
			showAlert('Export failed: Viewport not ready.', 'red');
			return;
		}
		const targetElement = viewportWrapperRef.querySelector(
			'#canvas-content-capture-area'
		) as HTMLElement;
		if (!targetElement) {
			showAlert('Export failed: Target element not found.', 'red');
			return;
		}

		const gridElement = targetElement.querySelector('.canvas-grid-container') as HTMLElement | null;
		const originalGridDisplay = gridElement ? gridElement.style.display : '';

		const originalSelection = get(selectedComponentIds);
		const originalPrimary = get(primarySelectedComponentId);
		clearSelectionState();
		selectionBox = { ...selectionBox, active: false };
		if (gridElement) gridElement.style.display = 'none';
		await tick();

		const options = {
			quality: format === 'jpeg' ? 0.95 : 1.0,
			bgcolor: '#ffffff',
			width: targetElement.offsetWidth,
			height: targetElement.offsetHeight
		};

		try {
			let dataUrl: string;
			if (format === 'jpeg') {
				dataUrl = await domtoimage.toJpeg(targetElement, options);
			} else {
				dataUrl = await domtoimage.toPng(targetElement, options);
			}
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = `survey-canvas-${Date.now()}.${format}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			showAlert(`Canvas exported as ${format.toUpperCase()}.`, 'green');
		} catch (error) {
			console.error(`Canvas: Error during dom-to-image call (${format}):`, error);
			showAlert('Export failed. See console for details.', 'red');
		} finally {
			if (gridElement) gridElement.style.display = originalGridDisplay;
			selectedComponentIds.set(originalSelection);
			primarySelectedComponentId.set(originalPrimary);
			await tick();
		}
	}

	function updateCanvasSize(detail: { width: number; height: number }): void {
		canvasViewStore.setCanvasDimensions(detail.width, detail.height);
		gridSize = getGridSize(units, PIXEL_PER_CM, PIXEL_PER_INCH);
	}

	function handleMouseMove(e: MouseEvent): void {
		const canvasState = get(canvasViewStore);
		const currentScale = canvasState.scale;
		const { x: vpX, y: vpY } = calculateMousePosition(e.clientX, e.clientY, viewportWrapperRef);
		mouseX_Viewport = vpX;
		mouseY_Viewport = vpY;
		const { x: currentCanvasX, y: currentCanvasY } = calculateCanvasMousePosition(
			e.clientX,
			e.clientY,
			viewportWrapperRef,
			canvasState.offsetX,
			canvasState.offsetY,
			canvasState.scale
		);
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
					newX = snapToGuides(newX, verticalGuides, SNAP_THRESHOLD, currentScale, enableSnap);
					newY = snapToGuides(newY, horizontalGuides, SNAP_THRESHOLD, currentScale, enableSnap);
					newX = snapToGrid(newX, gridSize, enableSnap);
					newY = snapToGrid(newY, gridSize, enableSnap);
					updateComponent(id, { x: newX, y: newY });
				}
			});
		} else if (isResizing && activeComponentId_Interaction && dragThresholdMet) {
			const components = get(componentsStore);
			const component = components.find((c) => c.id === activeComponentId_Interaction);
			if (!component || component.startX === undefined || component.startY === undefined) return;
			const dx_canvas = (e.clientX - startX) / currentScale;
			const dy_canvas = (e.clientY - startY) / currentScale;
			const minWidth = 20;
			const minHeight = 20;
			let newWidth = component.startX + dx_canvas;
			let newHeight = component.startY + dy_canvas;
			newWidth = snapToGrid(Math.max(minWidth, newWidth), gridSize, enableSnap);
			newHeight = snapToGrid(Math.max(minHeight, newHeight), gridSize, enableSnap);
			updateComponent(activeComponentId_Interaction, { width: newWidth, height: newHeight });
		} else if (draggingGuide && dragThresholdMet) {
			const canvasState = get(canvasViewStore);
			const guideCanvasPos =
				draggingGuide.direction === 'horizontal'
					? (mouseY_Viewport - canvasState.offsetY) / canvasState.scale
					: (mouseX_Viewport - canvasState.offsetX) / canvasState.scale;
			if (draggingGuide.direction === 'horizontal') {
				horizontalGuides[draggingGuide.index] = snapToGrid(
					snapToGuides(guideCanvasPos, verticalGuides, SNAP_THRESHOLD, currentScale, enableSnap),
					gridSize,
					enableSnap
				);
				horizontalGuides = [...horizontalGuides];
			} else {
				verticalGuides[draggingGuide.index] = snapToGrid(
					snapToGuides(guideCanvasPos, horizontalGuides, SNAP_THRESHOLD, currentScale, enableSnap),
					gridSize,
					enableSnap
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

	// Use throttle for mouse move to improve performance
	const throttledMouseMove = throttle(handleMouseMove, 16); // ~60fps

	function handleMouseUp(e: MouseEvent): void {
		const wasDraggingAndThresholdMet = isDragging && dragThresholdMet;
		const wasResizingAndThresholdMet = isResizing && dragThresholdMet;

		if (wasDraggingAndThresholdMet && activeComponentId_Interaction) {
			const canvasState = get(canvasViewStore);
			const currentScale = canvasState.scale;
			const dx_canvas_final = (e.clientX - startX) / currentScale;
			const dy_canvas_final = (e.clientY - startY) / currentScale;
			const currentSelectedIds = get(selectedComponentIds);

			currentSelectedIds.forEach((id) => {
				const initialPos = dragInitialPositions.get(id);
				const components = get(componentsStore);
				const comp = components.find((c) => c.id === id);
				if (initialPos && comp) {
					let finalX = initialPos.x + dx_canvas_final;
					let finalY = initialPos.y + dy_canvas_final;

					finalX = snapToGuides(finalX, verticalGuides, SNAP_THRESHOLD, currentScale, enableSnap);
					finalY = snapToGuides(finalY, horizontalGuides, SNAP_THRESHOLD, currentScale, enableSnap);
					finalX = snapToGrid(finalX, gridSize, enableSnap);
					finalY = snapToGrid(finalY, gridSize, enableSnap);
					updateComponent(id, { x: finalX, y: finalY });
				}
			});
		} else if (wasResizingAndThresholdMet && activeComponentId_Interaction) {
			const components = get(componentsStore);
			const component = components.find((c) => c.id === activeComponentId_Interaction);
			if (component && component.startX !== undefined && component.startY !== undefined) {
				const canvasState = get(canvasViewStore);
				const currentScale = canvasState.scale;
				const dx_canvas_final = (e.clientX - startX) / currentScale;
				const dy_canvas_final = (e.clientY - startY) / currentScale;

				const minWidth = 20;
				const minHeight = 20;

				let finalWidth = component.startX + dx_canvas_final;
				let finalHeight = component.startY + dy_canvas_final;

				finalWidth = snapToGrid(Math.max(minWidth, finalWidth), gridSize, enableSnap);
				finalHeight = snapToGrid(Math.max(minHeight, finalHeight), gridSize, enableSnap);
				updateComponent(activeComponentId_Interaction, { width: finalWidth, height: finalHeight });
			}
		}

		if (isPanning) {
			isPanning = false;
			document.body.style.cursor = '';
		}
		if (isDragging) isDragging = false;
		if (isResizing) isResizing = false;
		if (draggingGuide) draggingGuide = null;

		if (isSelecting) {
			isSelecting = false;
			if (dragThresholdMet) {
				selectionBox = { ...selectionBox, active: false };
			}
		}
		activeComponentId_Interaction = null;
		dragInitialPositions.clear();
		dragThresholdMet = false;
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
		if (showContextMenu || !viewportWrapperRef) return;
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			const delta = -e.deltaY * ZOOM_SENSITIVITY;
			const { x: mouseX_VP, y: mouseY_VP } = calculateMousePosition(
				e.clientX,
				e.clientY,
				viewportWrapperRef
			);
			canvasViewStore.adjustZoom(delta, mouseX_VP, mouseY_VP);
		} else if (viewportWrapperRef) {
			e.preventDefault();
			const canvasState = get(canvasViewStore);
			const panX = e.shiftKey ? -e.deltaY : -e.deltaX;
			const panY = e.shiftKey ? -e.deltaX : -e.deltaY;
			canvasViewStore.setCanvasOffset(canvasState.offsetX + panX, canvasState.offsetY + panY);
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
		switch (e.key.toLowerCase()) {
			case 'arrowup':
				dy = -step;
				needsUpdate = true;
				break;
			case 'arrowdown':
				dy = step;
				needsUpdate = true;
				break;
			case 'arrowleft':
				dx = -step;
				needsUpdate = true;
				break;
			case 'arrowright':
				dx = step;
				needsUpdate = true;
				break;
			case 'delete':
			case 'backspace':
				if (get(selectedComponentIds).length > 0) {
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
		if (needsUpdate && get(selectedComponentIds).length > 0) {
			e.preventDefault();
			get(selectedComponentIds).forEach((id) => {
				const components = get(componentsStore);
				const comp = components.find((c) => c.id === id);
				if (comp) {
					let newX = snapToGrid(comp.x + dx, gridSize, enableSnap);
					let newY = snapToGrid(comp.y + dy, gridSize, enableSnap);
					updateComponent(id, { x: newX, y: newY });
				}
			});
		}
	}

	function handleKeyUp(e: KeyboardEvent): void {
		if (e.key === ' ') {
			spacebarHeld = false;
			if (viewportWrapperRef) viewportWrapperRef.style.cursor = '';
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
			if (componentId && !get(selectedComponentIds).includes(componentId) && !event.shiftKey) {
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
		let closestGuideInfo: GuideInfo | null = null;
		let minDistance = GUIDE_CLICK_THRESHOLD_PX / get(canvasViewStore).scale;

		const guidesToSearch = rulerDirection === 'horizontal' ? verticalGuides : horizontalGuides;
		const guideActualDirection = rulerDirection === 'horizontal' ? 'vertical' : 'horizontal';

		guidesToSearch.forEach((guidePos, index) => {
			const distance = Math.abs(guidePos - canvasClickPos);
			if (distance < minDistance) {
				minDistance = distance;
				closestGuideInfo = { direction: guideActualDirection, index, position: guidePos };
			}
		});
		contextMenuGuideInfo = closestGuideInfo;
		showContextMenu = true;
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
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
	}

	function closeContextMenu(): void {
		if (showContextMenu) {
			showContextMenu = false;
			contextMenuGuideInfo = null;
		}
	}

	function handleDeleteGuide(e: CustomEvent<GuideInfo>): void {
		handleRemoveGuide({ detail: { direction: e.detail.direction, index: e.detail.index } } as any);
		closeContextMenu();
	}

	function handleSetGuidePosition(e: CustomEvent<GuideInfo>): void {
		const { direction, index, position } = e.detail;
		const currentPosFormatted = position.toFixed(
			enableSnap && gridSize > 0 ? gridSize.toString().split('.')[1]?.length || 0 : 1
		);
		closeContextMenu();

		const newPositionStr = prompt(
			`Set new position for ${direction} guide (current: ${currentPosFormatted}${units === 'px' ? 'px' : ''}):`,
			`${currentPosFormatted}`
		);

		if (newPositionStr !== null) {
			const newPosition = parseFloat(newPositionStr);
			if (!isNaN(newPosition)) {
				const snappedNewPosition = snapToGrid(newPosition, gridSize, enableSnap);
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
				showAlert('Invalid position entered. Please enter a number.', 'red');
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
		if (
			isDragging ||
			isResizing ||
			isSelecting ||
			spacebarHeld ||
			(isSelecting && dragThresholdMet)
		)
			return;
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

	function startPanInteraction(event: MouseEvent): void {
		if (isPanning) return;
		isPanning = true;
		startX = event.clientX;
		startY = event.clientY;
		const canvasState = get(canvasViewStore);
		startOffsetX_Interaction = canvasState.offsetX;
		startOffsetY_Interaction = canvasState.offsetY;
		document.body.style.cursor = 'grabbing';
		closeContextMenu();
	}

	function startSelectionInteraction(event: MouseEvent): void {
		if (isSelecting || spacebarHeld || event.button !== 0) return;
		const canvasState = get(canvasViewStore);
		const { x: canvasStartX, y: canvasStartY } = calculateCanvasMousePosition(
			event.clientX,
			event.clientY,
			viewportWrapperRef,
			canvasState.offsetX,
			canvasState.offsetY,
			canvasState.scale
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
			if (!currentSelection.includes(clickedId)) {
				selectedComponentIds.update((ids) => [...ids, clickedId]);
				primarySelectedComponentId.set(clickedId);
			} else {
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
		const components = get(componentsStore);
		finalSelectionForDrag.forEach((id) => {
			const compStoreItem = components.find((c) => c.id === id);
			if (compStoreItem) dragInitialPositions.set(id, { x: compStoreItem.x, y: compStoreItem.y });
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
		if (!selectionBox.active || !isSelecting || !dragThresholdMet) return;
		const components = get(componentsStore);
		const selectedIds = getComponentsInSelectionBox(components, selectionBox);

		selectedComponentIds.set(selectedIds);
		primarySelectedComponentId.set(selectedIds.length > 0 ? selectedIds[0] : null);
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
		const snappedPosition = snapToGrid(position, gridSize, enableSnap);
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
		gridSize = getGridSize(units, PIXEL_PER_CM, PIXEL_PER_INCH);
	}

	function toggleSnap(): void {
		enableSnap = !enableSnap;
	}

	function toggleGuides(): void {
		showGuides = !showGuides;
	}

	function autoPosition(): void {
		const components = get(componentsStore);
		if (components.length < 1) return;

		// Sort components by type to group similar components together
		const sortedComponents = [...components].sort((a, b) => {
			// Put title and introduction components first
			if (a.type === 'title') return -1;
			if (b.type === 'title') return 1;
			if (a.type === 'introduction') return -1;
			if (b.type === 'introduction') return 1;

			// Then section components
			if (a.type === 'section') return -1;
			if (b.type === 'section') return 1;

			return 0;
		});

		const PADDING = 20;
		const GAP = 15;
		let currentX = PADDING;
		let currentY = PADDING;
		let maxRowHeight = 0;
		const canvasState = get(canvasViewStore);
		const currentCanvasWidth = canvasState.width;

		// First place title and introduction at the top
		const titleComponents = sortedComponents.filter(
			(c) => c.type === 'title' || c.type === 'introduction'
		);
		titleComponents.forEach((component) => {
			updateComponent(component.id, {
				x: Math.max(PADDING, (currentCanvasWidth - component.width) / 2), // Center horizontally
				y: currentY
			});
			currentY += component.height + GAP;
		});

		// Then place sections and their related components
		const sectionComponents = sortedComponents.filter((c) => c.type === 'section');
		const otherComponents = sortedComponents.filter(
			(c) => c.type !== 'title' && c.type !== 'introduction' && c.type !== 'section'
		);

		// Place sections
		sectionComponents.forEach((section) => {
			updateComponent(section.id, { x: PADDING, y: currentY });
			currentY += section.height + GAP;

			// Place components after each section
			let sectionItemX = PADDING;
			let sectionItemY = currentY;
			let sectionMaxRowHeight = 0;

			// Take some components to place under this section
			const componentsForSection = otherComponents.splice(0, Math.min(4, otherComponents.length));

			componentsForSection.forEach((component) => {
				if (sectionItemX + component.width + PADDING > currentCanvasWidth) {
					sectionItemX = PADDING;
					sectionItemY += sectionMaxRowHeight + GAP;
					sectionMaxRowHeight = 0;
				}

				updateComponent(component.id, { x: sectionItemX, y: sectionItemY });
				sectionMaxRowHeight = Math.max(sectionMaxRowHeight, component.height);
				sectionItemX += component.width + GAP;
			});

			currentY = sectionItemY + sectionMaxRowHeight + GAP * 2;
		});

		// Place remaining components in a grid
		currentX = PADDING;

		otherComponents.forEach((component) => {
			if (currentX + component.width + PADDING > currentCanvasWidth) {
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
		window.addEventListener('mousemove', throttledMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('mouseleave', handleMouseLeave);
		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('click', closeContextMenu, true);
		loadSurvey();
		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('mousemove', throttledMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('click', closeContextMenu, true);
			document.body.style.cursor = '';
		};
	});

	export function setPrimarySelection(compId: string | null): void {
		if (compId) {
			const components = get(componentsStore);
			if (components.some((c) => c.id === compId)) {
				selectedComponentIds.set([compId]);
				primarySelectedComponentId.set(compId);
			} else {
				console.warn(`setPrimarySelection: Component with id ${compId} not found.`);
				clearSelectionState();
			}
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
		on:exportCanvas={(e) => exportCanvasAsImage(e.detail.format)}
		on:zoomIn={handleZoomIn}
		on:zoomOut={handleZoomOut}
		on:resetZoom={resetZoomAndCenter}
		on:autoPosition={autoPosition}
	/>
	<div
		class="flex items-center justify-center gap-x-6 border-b border-gray-300 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800"
	>
		<ToolbarAlign enabled={$canAlign} on:align={(event) => alignSelectedComponents(event.detail)} />
		<ToolbarDistribute
			enabled={$canDistribute}
			on:distribute={(event) => distributeSelectedComponents(event.detail)}
		/>
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			onclick={autoPosition}
			title="Auto-arrange all components"
		>
			<span class="flex items-center gap-2">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect
						x="14"
						y="3"
						width="7"
						height="7"
						rx="1"
					></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect
						x="14"
						y="14"
						width="7"
						height="7"
						rx="1"
					></rect></svg
				>
				Auto-arrange
			</span>
		</button>
	</div>

	<div
		role="group"
		aria-label="Canvas Area with Rulers and Viewport"
		class="relative flex-1 overflow-hidden"
		oncontextmenu={handleContextMenu}
	>
		<div
			class="absolute top-0 right-0 z-20"
			style:left="{RULER_SIZE}px"
			style:height="{RULER_SIZE}px"
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
		<ToolBarMiddle />
		<div
			class="absolute bottom-0 left-0 z-20"
			style:top="{RULER_SIZE}px"
			style:width="{RULER_SIZE}px"
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
			style:width="{RULER_SIZE}px"
			style:height="{RULER_SIZE}px"
			aria-hidden="true"
			title="Canvas Controls"
		></div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			bind:this={viewportWrapperRef}
			class="canvas-viewport-wrapper absolute overflow-hidden bg-gray-200 focus:outline-none dark:bg-gray-700"
			style:top="{RULER_SIZE}px"
			style:left="{RULER_SIZE}px"
			style:bottom="0"
			style:right="0"
			style:cursor={spacebarHeld ? 'grab' : isPanning ? 'grabbing' : 'default'}
			onwheel={handleWheel}
			tabindex="0"
			role="region"
			aria-label="Canvas Viewport - Interactive Area"
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
		on:zoomIn={handleZoomIn}
		on:zoomOut={handleZoomOut}
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
