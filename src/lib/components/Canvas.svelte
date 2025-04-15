<script lang="ts">
	import {
		componentsStore,
		updateComponent,
		deleteComponent,
		duplicateComponent
	} from '$lib/stores/surveyStore.ts';
	import { onMount, tick } from 'svelte';
	import type { SurveyComponent as SurveyComponentType } from '$lib/types/survey.ts';

	// Import our components
	import CanvasToolbar from './CanvasToolbar.svelte';
	import AlignmentToolbar from './AlignmentToolbar.svelte';
	import CanvasWorkspace from './CanvasWorkspace.svelte';
	import ContextMenu from './ContextMenu.svelte';
	import StatusBar from './StatusBar.svelte';

	// Canvas state
	let canvasWidth = 800;
	let canvasHeight = 1100;
	let canvasScale = 1;
	let canvasOffsetX = 50;
	let canvasOffsetY = 50;
	let pageFormat = 'A4';

	// Settings
	let units: 'cm' | 'inches' | 'px' = 'cm';
	let enableSnap = true;
	let showGuides = true;
	let gridSize = 10;

	// Selection state
	let selectedComponent: SurveyComponentType | null = null;
	let multiSelectedComponents: string[] = [];

	// Guides
	let horizontalGuides: number[] = [100, 200, 300];
	let verticalGuides: number[] = [100, 200, 300];

	// Mouse tracking
	let mouseX = 0;
	let mouseY = 0;

	// Context menu
	let contextMenu = {
		show: false,
		x: 0,
		y: 0
	};

	onMount(async () => {
		// Initialize canvas with correct dimensions based on format
		setCanvasDimensions(pageFormat);

		// Center the canvas initially
		await tick();
		centerCanvas();
	});

	function setCanvasDimensions(format: string) {
		if (format === 'A4') {
			// A4 is 210 × 297 millimeters
			const DPI = 96;
			const CM_PER_INCH = 2.54;
			const PIXEL_PER_CM = DPI / CM_PER_INCH;
			canvasWidth = Math.floor(21.0 * PIXEL_PER_CM);
			canvasHeight = Math.floor(29.7 * PIXEL_PER_CM);
		} else if (format === 'Letter') {
			// Letter is 8.5 × 11 inches
			const DPI = 96;
			canvasWidth = Math.floor(8.5 * DPI);
			canvasHeight = Math.floor(11 * DPI);
		}
		// Custom size is handled elsewhere
		pageFormat = format;
	}

	function toggleUnits() {
		// Cycle through available units
		if (units === 'cm') units = 'inches';
		else if (units === 'inches') units = 'px';
		else units = 'cm';
	}

	function toggleSnap() {
		enableSnap = !enableSnap;
	}

	function toggleGuides() {
		showGuides = !showGuides;
	}

	function changePageFormat(event: CustomEvent<{ format: string }>) {
		setCanvasDimensions(event.detail.format);
	}

	function resetView() {
		canvasScale = 1;
		centerCanvas();
	}

	function centerCanvas() {
		const container = document.querySelector('.canvas-container')?.parentElement;
		if (container) {
			canvasOffsetX = (container.clientWidth - canvasWidth * canvasScale) / 2;
			canvasOffsetY = (container.clientHeight - canvasHeight * canvasScale) / 2;

			// Ensure offsets are not negative
			canvasOffsetX = Math.max(canvasOffsetX, 50);
			canvasOffsetY = Math.max(canvasOffsetY, 50);
		}
	}

	function autoPosition() {
		// Arrange selected components in a grid
		if (multiSelectedComponents.length <= 1) return;

		const componentsToArrange = $componentsStore.filter((c) =>
			multiSelectedComponents.includes(c.id)
		);

		// Sort by position
		componentsToArrange.sort((a, b) => {
			if (Math.abs(a.y - b.y) < 50) {
				// If on same row approximately, sort by x
				return a.x - b.x;
			}
			return a.y - b.y;
		});

		// Find average dimensions
		const avgWidth =
			componentsToArrange.reduce((sum, c) => sum + c.width, 0) / componentsToArrange.length;
		const avgHeight =
			componentsToArrange.reduce((sum, c) => sum + c.height, 0) / componentsToArrange.length;

		// Calculate grid dimensions
		const cols = Math.ceil(Math.sqrt(componentsToArrange.length));
		const spacing = 20;

		// Position components in grid
		componentsToArrange.forEach((comp, index) => {
			const row = Math.floor(index / cols);
			const col = index % cols;

			const newX = comp.x + col * (avgWidth + spacing) - (comp.x % gridSize);
			const newY = comp.y + row * (avgHeight + spacing) - (comp.y % gridSize);

			updateComponent(comp.id, { x: newX, y: newY });
		});
	}

	function handleComponentUpdate(
		event: CustomEvent<{ id: string; changes: Partial<SurveyComponentType> }>
	) {
		const { id, changes } = event.detail;
		updateComponent(id, changes);
	}

	function handleComponentSelect(event: CustomEvent<{ component: SurveyComponentType | null }>) {
		selectedComponent = event.detail.component;
	}

	function handleMultiSelect(event: CustomEvent<{ ids: string[] }>) {
		multiSelectedComponents = event.detail.ids;
	}

	function handleContextMenu(event: CustomEvent<{ x: number; y: number }>) {
		// Only show context menu if something is selected
		if (selectedComponent || multiSelectedComponents.length > 0) {
			contextMenu.show = true;
			contextMenu.x = event.detail.x;
			contextMenu.y = event.detail.y;
		}
	}

	function hideContextMenu() {
		contextMenu.show = false;
	}

	function handleDuplicate() {
		multiSelectedComponents.forEach((id) => {
			duplicateComponent(id);
		});
	}

	function handleDelete() {
		multiSelectedComponents.forEach((id) => {
			deleteComponent(id);
		});
		selectedComponent = null;
		multiSelectedComponents = [];
	}

	function handleProperties() {
		// Open properties panel for selected component
		// Implementation depends on your app's architecture
		console.log('Open properties for', selectedComponent?.id);
	}

	function removeGuide(
		event: CustomEvent<{ direction: 'horizontal' | 'vertical'; index: number }>
	) {
		const { direction, index } = event.detail;

		if (direction === 'horizontal') {
			horizontalGuides = horizontalGuides.filter((_, i) => i !== index);
		} else {
			verticalGuides = verticalGuides.filter((_, i) => i !== index);
		}
	}

	function addGuide(
		event: CustomEvent<{ direction: 'horizontal' | 'vertical'; position: number }>
	) {
		const { direction, position } = event.detail;

		if (direction === 'horizontal') {
			horizontalGuides = [...horizontalGuides, position];
		} else {
			verticalGuides = [...verticalGuides, position];
		}
	}

	function handleWheel(event: CustomEvent<{ event: WheelEvent }>) {
		const { event: wheelEvent } = event.detail;

		// Zoom with Ctrl+Wheel
		if (wheelEvent.ctrlKey) {
			wheelEvent.preventDefault();

			const zoomFactor = 0.1;
			const direction = wheelEvent.deltaY > 0 ? -1 : 1;
			const newScale = Math.max(0.1, Math.min(3, canvasScale + direction * zoomFactor));

			if (newScale !== canvasScale) {
				// Zoom centered on mouse position
				const rect = (wheelEvent.currentTarget as HTMLElement).getBoundingClientRect();
				const mouseX = wheelEvent.clientX - rect.left;
				const mouseY = wheelEvent.clientY - rect.top;

				// Calculate new offsets to keep mouse position stable
				canvasOffsetX = mouseX - (mouseX - canvasOffsetX) * (newScale / canvasScale);
				canvasOffsetY = mouseY - (mouseY - canvasOffsetY) * (newScale / canvasScale);

				canvasScale = newScale;
			}
		}
	}

	function handleUpdateMousePosition(event: CustomEvent<{ x: number; y: number }>) {
		mouseX = event.detail.x;
		mouseY = event.detail.y;
	}

	function handleAlign(
		event: CustomEvent<{ direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' }>
	) {
		const { direction } = event.detail;

		if (multiSelectedComponents.length <= 1) return;

		const componentsToAlign = $componentsStore.filter((c) =>
			multiSelectedComponents.includes(c.id)
		);

		// Find boundaries of selected components
		const minX = Math.min(...componentsToAlign.map((c) => c.x));
		const maxX = Math.max(...componentsToAlign.map((c) => c.x + c.width));
		const minY = Math.min(...componentsToAlign.map((c) => c.y));
		const maxY = Math.max(...componentsToAlign.map((c) => c.y + c.height));

		componentsToAlign.forEach((comp) => {
			let changes: Partial<SurveyComponentType> = {};

			switch (direction) {
				case 'left':
					changes.x = minX;
					break;
				case 'center':
					changes.x = minX + (maxX - minX) / 2 - comp.width / 2;
					break;
				case 'right':
					changes.x = maxX - comp.width;
					break;
				case 'top':
					changes.y = minY;
					break;
				case 'middle':
					changes.y = minY + (maxY - minY) / 2 - comp.height / 2;
					break;
				case 'bottom':
					changes.y = maxY - comp.height;
					break;
			}

			updateComponent(comp.id, changes);
		});
	}

	function handleDistribute(event: CustomEvent<{ direction: 'horizontal' | 'vertical' }>) {
		const { direction } = event.detail;

		if (multiSelectedComponents.length <= 2) return;

		const componentsToDistribute = $componentsStore
			.filter((c) => multiSelectedComponents.includes(c.id))
			.sort((a, b) => (direction === 'horizontal' ? a.x - b.x : a.y - b.y));

		if (direction === 'horizontal') {
			const firstX = componentsToDistribute[0].x;
			const lastX = componentsToDistribute[componentsToDistribute.length - 1].x;
			const totalWidth = lastX - firstX;
			const spacing = totalWidth / (componentsToDistribute.length - 1);

			componentsToDistribute.forEach((comp, index) => {
				if (index > 0 && index < componentsToDistribute.length - 1) {
					updateComponent(comp.id, { x: firstX + spacing * index });
				}
			});
		} else {
			const firstY = componentsToDistribute[0].y;
			const lastY = componentsToDistribute[componentsToDistribute.length - 1].y;
			const totalHeight = lastY - firstY;
			const spacing = totalHeight / (componentsToDistribute.length - 1);

			componentsToDistribute.forEach((comp, index) => {
				if (index > 0 && index < componentsToDistribute.length - 1) {
					updateComponent(comp.id, { y: firstY + spacing * index });
				}
			});
		}
	}
</script>

<div class="flex h-full flex-col">
	<!-- Top toolbar -->
	<CanvasToolbar
		{units}
		{enableSnap}
		{showGuides}
		{pageFormat}
		{canvasScale}
		on:toggleUnits={toggleUnits}
		on:toggleSnap={toggleSnap}
		on:toggleGuides={toggleGuides}
		on:changePageFormat={changePageFormat}
		on:resetView={resetView}
		on:autoPosition={autoPosition}
	/>

	<!-- Alignment toolbar (shown when multiple items selected) -->
	<AlignmentToolbar
		visible={multiSelectedComponents.length > 1}
		on:align={handleAlign}
		on:distribute={handleDistribute}
	/>

	<!-- Main canvas area -->
	<div class="relative flex-1 overflow-hidden">
		<CanvasWorkspace
			componentsStore={$componentsStore}
			{selectedComponent}
			{multiSelectedComponents}
			{units}
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
			{mouseX}
			{mouseY}
			on:updateComponent={handleComponentUpdate}
			on:selectComponent={handleComponentSelect}
			on:updateMultiSelection={handleMultiSelect}
			on:contextMenu={handleContextMenu}
			on:removeGuide={removeGuide}
			on:doubleClickGuide={addGuide}
			on:wheel={handleWheel}
			on:updateMousePosition={handleUpdateMousePosition}
		/>

		<!-- Context menu -->
		<ContextMenu
			show={contextMenu.show}
			x={contextMenu.x}
			y={contextMenu.y}
			on:duplicate={handleDuplicate}
			on:properties={handleProperties}
			on:delete={handleDelete}
			on:hide={hideContextMenu}
		/>
	</div>

	<!-- Status bar -->
	<StatusBar
		{mouseX}
		{mouseY}
		{units}
		{selectedComponent}
		{multiSelectedComponents}
		{canvasScale}
	/>
</div>
