<!-- src/lib/components/Canvas.svelte -->
<script lang="ts">
	import {
		componentsStore,
		updateComponent,
		deleteComponent,
		duplicateComponent
	} from '$lib/stores/surveyStore.ts'; // USE $lib alias
	import { onMount, tick, onDestroy } from 'svelte';
	import type {
		SurveyComponent as SurveyComponentType,
		SelectionBox,
		DraggingGuide
	} from '$lib/types/survey.ts'; // USE $lib alias

	// Adjust import paths based on your subfolder structure
	// Assuming child components are in './CanvasComponents/' relative to Canvas.svelte
	import CanvasToolbar from '$lib/components/CanvasComponents/CanvasToolbar.svelte';
	import AlignmentToolbar from '$lib/components/CanvasComponents/AlignmentToolbar.svelte';
	import CanvasRuler from '$lib/components/CanvasComponents/CanvasRuler.svelte';
	import CanvasViewport from '$lib/components/CanvasComponents/CanvasViewport.svelte';
	import ContextMenu from '$lib/components/CanvasComponents/ContextMenu.svelte';
	import StatusBar from '$lib/components/CanvasComponents/StatusBar.svelte';

	// Type needed for the component instance reference
	import type { SvelteComponent } from 'svelte';

	export let selectedComponent: SurveyComponentType | null = null;
	export let units: 'cm' | 'inches' | 'px' = 'cm';

	// --- Constants ---
	const DPI = 96;
	const CM_PER_INCH = 2.54;
	const PIXEL_PER_CM = DPI / CM_PER_INCH;
	const PIXEL_PER_INCH = DPI;
	const MIN_ZOOM = 0.1;
	const MAX_ZOOM = 5;
	const ZOOM_SENSITIVITY = 0.001;
	const RULER_SIZE = 32; // px
	const SNAP_THRESHOLD = 5; // px

	// --- Canvas & Viewport State ---
	let canvasWidth = 800;
	let canvasHeight = 1100;
	let canvasScale = 1;
	let canvasOffsetX = 0;
	let canvasOffsetY = 0;
	let viewportWidth = 0;
	let viewportHeight = 0;
	let containerRef: HTMLDivElement;
	let viewportRef: HTMLDivElement; // Ref to the scrollable div element
	let canvasViewportInstance: SvelteComponent | undefined = undefined; // Ref to CanvasViewport instance

	// --- Page Settings ---
	let pageFormat = 'A4';
	const pageSizes = {
		A4: { width: (210 * PIXEL_PER_CM) / 10, height: (297 * PIXEL_PER_CM) / 10 },
		Letter: { width: 8.5 * PIXEL_PER_INCH, height: 11 * PIXEL_PER_INCH },
		Custom: { width: canvasWidth, height: canvasHeight }
	};

	// --- Interaction State ---
	let mouseX_Viewport = 0;
	let mouseY_Viewport = 0;
	let mouseX_Canvas = 0;
	let mouseY_Canvas = 0;
	let isDragging = false;
	let isResizing = false;
	let isPanning = false;
	let isSelecting = false;
	let startX = 0;
	let startY = 0;
	let startOffsetX = 0;
	let startOffsetY = 0;
	let activeComponentId: string | null = null;
	let lastClickTime = 0;
	let dragInitialPositions = new Map<string, { x: number; y: number }>();

	// --- Selection State ---
	let multiSelectedComponentIds: string[] = [];
	let selectionBox: SelectionBox = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };

	// --- Guides State ---
	let horizontalGuides: number[] = [100, 200];
	let verticalGuides: number[] = [100, 300];
	let showGuides = true;
	let draggingGuide: DraggingGuide = null;

	// --- Snapping State ---
	let enableSnap = true;
	let gridSize = getGridSize();

	// --- Context Menu State ---
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

	function updatePageFormat(newFormat: string = pageFormat): void {
		pageFormat = newFormat;
		if (pageFormat !== 'Custom') {
			const size = pageSizes[pageFormat as keyof typeof pageSizes];
			if (size) {
				canvasWidth = size.width;
				canvasHeight = size.height;
			}
		} else {
			pageSizes.Custom.width = canvasWidth;
			pageSizes.Custom.height = canvasHeight;
		}
		gridSize = getGridSize();
	}

	function snapToGrid(value: number): number {
		if (!enableSnap || gridSize <= 0) return value;
		return Math.round(value / gridSize) * gridSize;
	}

	function snapToGuides(value: number, direction: 'horizontal' | 'vertical'): number {
		if (!enableSnap || !showGuides) return value;
		const guides = direction === 'horizontal' ? verticalGuides : horizontalGuides;
		for (const guide of guides) {
			if (Math.abs(value - guide) < SNAP_THRESHOLD / canvasScale) {
				return guide;
			}
		}
		return value;
	}

	function calculateCanvasMousePos(clientX: number, clientY: number): { x: number; y: number } {
		if (!viewportRef) return { x: 0, y: 0 };
		const viewportRect = viewportRef.getBoundingClientRect();
		const mouseX_VP = clientX - viewportRect.left;
		const mouseY_VP = clientY - viewportRect.top;
		return {
			x: (mouseX_VP - canvasOffsetX) / canvasScale,
			y: (mouseY_VP - canvasOffsetY) / canvasScale
		};
	}

	// --- Event Handlers ---

	function handleMouseMove(e: MouseEvent): void {
		if (viewportRef) {
			const viewportRect = viewportRef.getBoundingClientRect();
			mouseX_Viewport = e.clientX - viewportRect.left;
			mouseY_Viewport = e.clientY - viewportRect.top;
		}

		const { x: currentCanvasX, y: currentCanvasY } = calculateCanvasMousePos(e.clientX, e.clientY);
		mouseX_Canvas = currentCanvasX;
		mouseY_Canvas = currentCanvasY;

		if (isDragging && activeComponentId) {
			const dx = (e.clientX - startX) / canvasScale;
			const dy = (e.clientY - startY) / canvasScale;
			multiSelectedComponentIds.forEach((id) => {
				const initialPos = dragInitialPositions.get(id);
				if (initialPos) {
					let newX = snapToGrid(initialPos.x + dx);
					let newY = snapToGrid(initialPos.y + dy);
					newX = snapToGuides(newX, 'horizontal');
					newY = snapToGuides(newY, 'vertical');
					updateComponent(id, { x: newX, y: newY });
				}
			});
		} else if (isResizing && activeComponentId) {
			const component = $componentsStore.find((c) => c.id === activeComponentId);
			if (!component || component.startX === undefined || component.startY === undefined) return;
			const dx = (e.clientX - startX) / canvasScale;
			const dy = (e.clientY - startY) / canvasScale;
			const minWidth = 50;
			const minHeight = 50;
			const newWidth = snapToGrid(Math.max(minWidth, component.startX + dx));
			const newHeight = snapToGrid(Math.max(minHeight, component.startY + dy));
			updateComponent(activeComponentId, { width: newWidth, height: newHeight });
		} else if (isPanning) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			canvasOffsetX = startOffsetX + dx;
			canvasOffsetY = startOffsetY + dy;
		} else if (draggingGuide) {
			if (draggingGuide.direction === 'horizontal') {
				horizontalGuides[draggingGuide.index] = snapToGrid(mouseY_Canvas);
				horizontalGuides = [...horizontalGuides];
			} else {
				verticalGuides[draggingGuide.index] = snapToGrid(mouseX_Canvas);
				verticalGuides = [...verticalGuides];
			}
		} else if (selectionBox.active) {
			isSelecting = true;
			selectionBox.endX = mouseX_Canvas;
			selectionBox.endY = mouseY_Canvas;
			selectionBox = { ...selectionBox };
			updateSelectionFromBox();
		}
	}

	function handleMouseUp(e: MouseEvent): void {
		if (isDragging) isDragging = false;
		if (isResizing) isResizing = false;
		if (isPanning) {
			isPanning = false;
			document.body.style.cursor = 'default';
		}
		if (isSelecting) isSelecting = false;
		if (draggingGuide) draggingGuide = null;
		if (selectionBox.active) selectionBox.active = false;
		activeComponentId = null;
		dragInitialPositions.clear();
	}

	function handleMouseLeave(e: MouseEvent): void {
		if (
			e.relatedTarget === null &&
			(isDragging || isResizing || isPanning || selectionBox.active)
		) {
			handleMouseUp(e);
		}
	}

	function handleWheel(e: WheelEvent): void {
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			const delta = -e.deltaY * ZOOM_SENSITIVITY;
			const zoomFactor = Math.exp(delta);
			const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, canvasScale * zoomFactor));

			if (newScale !== canvasScale && viewportRef) {
				const viewportRect = viewportRef.getBoundingClientRect();
				const mouseX_VP = e.clientX - viewportRect.left;
				const mouseY_VP = e.clientY - viewportRect.top;
				const mouseX_C = (mouseX_VP - canvasOffsetX) / canvasScale;
				const mouseY_C = (mouseY_VP - canvasOffsetY) / canvasScale;
				const newOffsetX = mouseX_VP - mouseX_C * newScale;
				const newOffsetY = mouseY_VP - mouseY_C * newScale;
				canvasScale = newScale;
				canvasOffsetX = newOffsetX;
				canvasOffsetY = newOffsetY;
			}
		} else if (viewportRef) {
			// Allow natural scrolling
			if (e.shiftKey) {
				/* Let browser handle horizontal */
			} else {
				/* Let browser handle vertical */
			}
		}
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement ||
			e.target instanceof HTMLSelectElement ||
			(e.target as HTMLElement).closest('.allow-input')
		) {
			return;
		}

		let dx = 0;
		const dy = 0;
		const step = e.shiftKey ? 10 : 1;
		let update = false;

		switch (e.key) {
			case 'ArrowUp':
				update = true;
				break;
			case 'ArrowDown':
				const dy = step;
				update = true;
				break;
			case 'ArrowLeft':
				dx = -step;
				update = true;
				break;
			case 'ArrowRight':
				dx = step;
				update = true;
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
			case 'Escape':
				clearSelection();
				closeContextMenu();
				break;
			default:
				return;
		}

		if (update && multiSelectedComponentIds.length > 0) {
			e.preventDefault();
			multiSelectedComponentIds.forEach((id) => {
				const comp = $componentsStore.find((c) => c.id === id);
				if (comp) {
					updateComponent(id, { x: comp.x + dx, y: comp.y + dy });
				}
			});
			if (selectedComponent) {
				selectedComponent = $componentsStore.find((c) => c.id === selectedComponent?.id) || null;
			}
		}
	}

	function handleContextMenu(e: MouseEvent): void {
		e.preventDefault();
		showContextMenu = true;
		contextMenuX = e.clientX;
		contextMenuY = e.clientY;
		contextMenuTarget = e.target;
	}

	function closeContextMenu(): void {
		showContextMenu = false;
		contextMenuTarget = null;
	}

	// --- Component/Guide Interaction Callbacks ---

	function onStartDrag(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; component: SurveyComponentType };
		const { event, component } = detail;
		if (event.button !== 0) return;
		isDragging = true;
		activeComponentId = component.id;
		startX = event.clientX;
		startY = event.clientY;

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
			if (!multiSelectedComponentIds.includes(component.id)) {
				selectedComponent = component;
				multiSelectedComponentIds = [component.id];
			} else {
				selectedComponent = component;
			}
		}
		dragInitialPositions.clear();
		multiSelectedComponentIds.forEach((id) => {
			const comp = $componentsStore.find((c) => c.id === id);
			if (comp) {
				dragInitialPositions.set(id, { x: comp.x, y: comp.y });
			}
		});
		event.preventDefault();
	}

	function onStartResize(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; component: SurveyComponentType };
		const { event, component } = detail;
		if (event.button !== 0) return;
		isResizing = true;
		activeComponentId = component.id;
		startX = event.clientX;
		startY = event.clientY;
		updateComponent(component.id, { startX: component.width, startY: component.height });
		selectedComponent = component;
		multiSelectedComponentIds = [component.id];
		event.stopPropagation();
		event.preventDefault();
	}

	function handleCanvasClick(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; x: number; y: number };
		const { event, x, y } = detail;
		const currentTime = Date.now();
		if (currentTime - lastClickTime < 300) {
			// Double click
			const guideAreaThreshold = 10;
			if (y < guideAreaThreshold) {
				verticalGuides = [...verticalGuides, snapToGrid(x)];
			} else if (x < guideAreaThreshold) {
				horizontalGuides = [...horizontalGuides, snapToGrid(y)];
			}
		}
		lastClickTime = currentTime;
		if (!isDragging && !isResizing && !isSelecting && !event.shiftKey) {
			clearSelection();
		}
		closeContextMenu();
	}

	function handleSelectComponent(e: CustomEvent): void {
		const component = e.detail as SurveyComponentType;
		if (!isDragging && !isResizing) {
			if (!multiSelectedComponentIds.includes(component.id)) {
				selectedComponent = component;
				multiSelectedComponentIds = [component.id];
			} else {
				selectedComponent = component;
			}
		}
	}

	function onStartSelectionBox(e: CustomEvent): void {
		const detail = e.detail as { event: MouseEvent; x: number; y: number };
		const { event, x, y } = detail;
		if (event.button !== 0 || isDragging || isResizing || draggingGuide) return;
		isSelecting = true;
		selectionBox.active = true;
		selectionBox.startX = x;
		selectionBox.startY = y;
		selectionBox.endX = x;
		selectionBox.endY = y;
		selectionBox = { ...selectionBox };
		if (!event.shiftKey) {
			clearSelection();
		}
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
					comp.x < maxX &&
					comp.x + comp.width > minX &&
					comp.y < maxY &&
					comp.y + comp.height > minY
			)
			.map((comp) => comp.id);
		multiSelectedComponentIds = newlySelectedIds;
		selectedComponent =
			multiSelectedComponentIds.length > 0
				? $componentsStore.find((c) => c.id === multiSelectedComponentIds[0]) || null
				: null;
	}

	function onStartPan(e: CustomEvent): void {
		const event = e.detail as MouseEvent;
		isPanning = true;
		startX = event.clientX;
		startY = event.clientY;
		startOffsetX = canvasOffsetX;
		startOffsetY = canvasOffsetY;
		event.preventDefault();
		document.body.style.cursor = 'grabbing';
	}

	function onStartGuideMove(e: CustomEvent): void {
		draggingGuide = e.detail as { direction: 'horizontal' | 'vertical'; index: number };
	}

	function removeGuide(e: CustomEvent): void {
		const detail = e.detail as { direction: 'horizontal' | 'vertical'; index: number };
		const { direction, index } = detail;
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
	}

	function resetZoomAndCenter(): void {
		canvasScale = 1;
		if (viewportRef) {
			const viewWidth = viewportRef.clientWidth;
			const viewHeight = viewportRef.clientHeight;
			const contentWidth = canvasWidth;
			const contentHeight = canvasHeight;
			canvasOffsetX = Math.max(0, (viewWidth - contentWidth) / 2);
			canvasOffsetY = Math.max(0, (viewHeight - contentHeight) / 2);
		} else {
			canvasOffsetX = 0;
			canvasOffsetY = 0;
		}
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
		const components = $componentsStore;
		if (components.length < 1) return;
		const PADDING = 20;
		const GAP = 20;
		let currentX = PADDING;
		let currentY = PADDING;
		let maxRowHeight = 0;
		components.forEach((component) => {
			if (currentX + component.width + PADDING > canvasWidth) {
				// Check against canvasWidth
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
		if (multiSelectedComponentIds.length <= 1) return;
		const selectedComps = $componentsStore.filter((c) => multiSelectedComponentIds.includes(c.id));
		if (selectedComps.length <= 1) return;
		let targetX: number | undefined;
		let targetY: number | undefined;
		const primary =
			selectedComponent && multiSelectedComponentIds.includes(selectedComponent.id)
				? selectedComponent
				: selectedComps[0];
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
			let newX = comp.x;
			let newY = comp.y;
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
			if (selectedComps.length <= 1) return;
			const totalSpacing = Math.max(0, totalRange - totalWidth);
			const gap = totalSpacing / (selectedComps.length - 1);
			let currentX = first.x;
			selectedComps.forEach((comp) => {
				updateComponent(comp.id, { x: Math.round(currentX) });
				currentX += comp.width + gap;
			});
		} else {
			// Vertical
			selectedComps.sort((a, b) => a.y - b.y);
			const first = selectedComps[0];
			const last = selectedComps[selectedComps.length - 1];
			const totalRange = last.y + last.height - first.y;
			const totalHeight = selectedComps.reduce((sum, comp) => sum + comp.height, 0);
			if (selectedComps.length <= 1) return;
			const totalSpacing = Math.max(0, totalRange - totalHeight);
			const gap = totalSpacing / (selectedComps.length - 1);
			let currentY = first.y;
			selectedComps.forEach((comp) => {
				updateComponent(comp.id, { y: Math.round(currentY) });
				currentY += comp.height + gap;
			});
		}
	}

	// --- Lifecycle ---
	onMount(() => {
		updatePageFormat();
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === viewportRef) {
					viewportWidth = entry.contentRect.width;
					viewportHeight = entry.contentRect.height;
				}
			}
		});
		if (viewportRef) {
			resizeObserver.observe(viewportRef);
			viewportWidth = viewportRef.clientWidth;
			viewportHeight = viewportRef.clientHeight;
		}
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('mouseleave', handleMouseLeave);
		window.addEventListener('keydown', handleKeydown);
		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('keydown', handleKeydown);
			document.body.style.cursor = 'default';
		};
	});

	// --- Two-way binding ---
	export function setSelectedComponent(comp: SurveyComponentType | null): void {
		if (comp) {
			selectedComponent = comp;
			multiSelectedComponentIds = [comp.id];
		} else {
			clearSelection();
		}
	}
</script>

<div class="flex h-full w-full flex-col bg-gray-50 dark:bg-gray-900" bind:this={containerRef}>
	<!-- Toolbars -->
	<CanvasToolbar
		{units}
		{enableSnap}
		{showGuides}
		{pageFormat}
		{canvasScale}
		on:toggleUnits={toggleUnits}
		on:toggleSnap={toggleSnap}
		on:toggleGuides={toggleGuides}
		on:updatePageFormat={(e) => updatePageFormat(e.detail)}
		on:resetZoom={resetZoomAndCenter}
		on:autoPosition={autoPosition}
	/>

	{#if multiSelectedComponentIds.length > 1}
		<AlignmentToolbar
			on:align={(e) => alignComponents(e.detail)}
			on:distribute={(e) => distributeComponents(e.detail)}
		/>
	{/if}

	<!-- Main Area: Rulers + Viewport -->
	<!-- Added role="group" and aria-label for accessibility -->
	<div
		role="group"
		aria-label="Canvas Area"
		class="relative flex-1 overflow-hidden"
		on:contextmenu={handleContextMenu}
	>
		<!-- Horizontal Ruler -->
		<div
			class="absolute top-0 right-0 z-20 h-8"
			style="left: {RULER_SIZE}px; height: {RULER_SIZE}px;"
		>
			<CanvasRuler
				direction="horizontal"
				scale={canvasScale}
				offset={canvasOffsetX}
				viewLength={viewportWidth}
				{units}
				mousePos={mouseX_Viewport}
			/>
		</div>

		<!-- Vertical Ruler -->
		<div
			class="absolute bottom-0 left-0 z-20 w-8"
			style="top: {RULER_SIZE}px; width: {RULER_SIZE}px;"
		>
			<CanvasRuler
				direction="vertical"
				scale={canvasScale}
				offset={canvasOffsetY}
				viewLength={viewportHeight}
				{units}
				mousePos={mouseY_Viewport}
			/>
		</div>

		<!-- Corner Box -->
		<div
			class="absolute top-0 left-0 z-20 border-r border-b border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800"
			style="width: {RULER_SIZE}px; height: {RULER_SIZE}px;"
		></div>

		<!-- Canvas Viewport (Scrollable Area) -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- Added role and label to justify tabindex -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			bind:this={viewportRef}
			class="absolute inset-0 overflow-auto focus:outline-none"
			style="top: {RULER_SIZE}px; left: {RULER_SIZE}px;"
			on:wheel={handleWheel}
			tabindex="0"
			role="region"
			aria-label="Canvas Viewport"
		>
			<CanvasViewport
				bind:this={canvasViewportInstance}
				{canvasWidth}
				{canvasHeight}
				{canvasScale}
				{canvasOffsetX}
				{canvasOffsetY}
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
		{canvasScale}
	/>

	<!-- Context Menu -->
	{#if showContextMenu}
		<ContextMenu
			x={contextMenuX}
			y={contextMenuY}
			targetElement={contextMenuTarget}
			on:close={closeContextMenu}
			on:duplicate={duplicateSelected}
			on:delete={deleteSelected}
			on:properties={() => console.log('Properties action clicked')}
		/>
	{/if}
</div>

<style>
	:global(body.panning) {
		cursor: grabbing !important;
	}
</style>
