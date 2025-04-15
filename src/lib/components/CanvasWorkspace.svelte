<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SurveyComponent from './SurveyComponent.svelte';
	import CanvasRuler from './CanvasRuler.svelte';
	import CanvasGuide from './CanvasGuide.svelte';
	import CanvasGrid from './CanvasGrid.svelte';
	import SelectionBox from './SelectionBox.svelte';
	import type { SurveyComponent as SurveyComponentType } from '$lib/types/survey.ts';

	// Props
	export let componentsStore: SurveyComponentType[] = [];
	export let selectedComponent: SurveyComponentType | null = null;
	export let multiSelectedComponents: string[] = [];
	export let units: 'cm' | 'inches' | 'px' = 'cm';
	export let canvasWidth: number = 800;
	export let canvasHeight: number = 1100;
	export let canvasScale: number = 1;
	export let canvasOffsetX: number = 0;
	export let canvasOffsetY: number = 0;
	export let enableSnap: boolean = true;
	export let gridSize: number = 10;
	export let showGuides: boolean = true;
	export let horizontalGuides: number[] = [];
	export let verticalGuides: number[] = [];

	// Mouse tracking
	export let mouseX: number = 0;
	export let mouseY: number = 0;

	// Element references
	let canvasRef: HTMLDivElement;

	// Mouse operations flags
	let isDragging = false;
	let isResizing = false;
	let isPanning = false;
	let startX = 0;
	let startY = 0;
	let startLeft = 0;
	let startTop = 0;
	let startWidth = 0;
	let startHeight = 0;
	let activeComponentId: string | null = null;
	let lastClickTime = 0;

	// Selection box
	let selectionBox = {
		active: false,
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0
	};

	// Guide dragging
	let draggingGuide: { direction: 'horizontal' | 'vertical'; index: number } | null = null;

	// Constants for unit conversion
	const DPI = 96; // Standard screen DPI
	const CM_PER_INCH = 2.54;
	const PIXEL_PER_CM = DPI / CM_PER_INCH;
	const PIXEL_PER_INCH = DPI;

	const dispatch = createEventDispatcher<{
		updateComponent: { id: string; changes: Partial<SurveyComponentType> };
		selectComponent: { component: SurveyComponentType | null };
		updateMultiSelection: { ids: string[] };
		contextMenu: { x: number; y: number };
		removeGuide: { direction: 'horizontal' | 'vertical'; index: number };
		doubleClickGuide: { direction: 'horizontal' | 'vertical'; position: number };
		wheel: { event: WheelEvent };
		updateMousePosition: { x: number; y: number };
	}>();

	function snapToGrid(value: number): number {
		if (!enableSnap) return value;
		return Math.round(value / gridSize) * gridSize;
	}

	function snapToGuides(value: number, direction: 'horizontal' | 'vertical'): number {
		if (!enableSnap || !showGuides) return value;

		const snapThreshold = 5;
		const guides = direction === 'horizontal' ? verticalGuides : horizontalGuides;

		for (const guide of guides) {
			if (Math.abs(value - guide) < snapThreshold) {
				return guide;
			}
		}

		return value;
	}

	function handleMouseMove(e: MouseEvent) {
		// Update mouse position for rulers
		const rect = canvasRef?.getBoundingClientRect();
		if (rect) {
			mouseX = (e.clientX - rect.left) / canvasScale;
			mouseY = (e.clientY - rect.top) / canvasScale;

			dispatch('updateMousePosition', { x: mouseX, y: mouseY });
		}

		if (isDragging && activeComponentId) {
			const dx = (e.clientX - startX) / canvasScale;
			const dy = (e.clientY - startY) / canvasScale;

			// Move all selected components
			multiSelectedComponents.forEach((id) => {
				const comp = componentsStore.find((c) => c.id === id);
				if (comp) {
					let newX = snapToGrid(comp.startX + dx);
					let newY = snapToGrid(comp.startY + dy);

					// Snap to guides
					newX = snapToGuides(newX, 'horizontal');
					newY = snapToGuides(newY, 'vertical');

					dispatch('updateComponent', { id, changes: { x: newX, y: newY } });
				}
			});
		} else if (isResizing && activeComponentId) {
			const dx = (e.clientX - startX) / canvasScale;
			const dy = (e.clientY - startY) / canvasScale;

			// Ensure minimum size
			const newWidth = snapToGrid(Math.max(50, startWidth + dx));
			const newHeight = snapToGrid(Math.max(50, startHeight + dy));

			dispatch('updateComponent', {
				id: activeComponentId,
				changes: { width: newWidth, height: newHeight }
			});
		} else if (isPanning) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			canvasOffsetX += dx;
			canvasOffsetY += dy;
			startX = e.clientX;
			startY = e.clientY;
		} else if (draggingGuide) {
			if (draggingGuide.direction === 'horizontal') {
				horizontalGuides[draggingGuide.index] = snapToGrid(mouseY);
				horizontalGuides = [...horizontalGuides]; // Trigger reactivity
			} else {
				verticalGuides[draggingGuide.index] = snapToGrid(mouseX);
				verticalGuides = [...verticalGuides]; // Trigger reactivity
			}
		} else if (selectionBox.active) {
			selectionBox.endX = mouseX;
			selectionBox.endY = mouseY;

			// Select components that intersect with the selection box
			const minX = Math.min(selectionBox.startX, selectionBox.endX);
			const maxX = Math.max(selectionBox.startX, selectionBox.endX);
			const minY = Math.min(selectionBox.startY, selectionBox.endY);
			const maxY = Math.max(selectionBox.startY, selectionBox.endY);

			const newSelection = componentsStore
				.filter((comp) => {
					return (
						comp.x < maxX &&
						comp.x + comp.width > minX &&
						comp.y < maxY &&
						comp.y + comp.height > minY
					);
				})
				.map((comp) => comp.id);

			dispatch('updateMultiSelection', { ids: newSelection });

			if (newSelection.length > 0) {
				const firstComp = componentsStore.find((c) => c.id === newSelection[0]) || null;
				dispatch('selectComponent', { component: firstComp });
			} else {
				dispatch('selectComponent', { component: null });
			}
		}
	}

	function onStartDrag(e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>) {
		const { event, component } = e.detail;

		isDragging = true;
		activeComponentId = component.id;

		// Add to multi-select if shift is pressed, otherwise clear and select just this one
		if (event.shiftKey) {
			if (!multiSelectedComponents.includes(component.id)) {
				dispatch('updateMultiSelection', {
					ids: [...multiSelectedComponents, component.id]
				});
			}
		} else {
			dispatch('updateMultiSelection', { ids: [component.id] });
		}

		dispatch('selectComponent', { component });
		startX = event.clientX;
		startY = event.clientY;
		startLeft = component.x;
		startTop = component.y;

		// Store initial positions for all selected components
		multiSelectedComponents.forEach((id) => {
			const comp = componentsStore.find((c) => c.id === id);
			if (comp) {
				comp.startX = comp.x;
				comp.startY = comp.y;
			}
		});

		event.preventDefault();
	}

	function onStartResize(e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>) {
		const { event, component } = e.detail;

		isResizing = true;
		activeComponentId = component.id;
		dispatch('selectComponent', { component });
		dispatch('updateMultiSelection', { ids: [component.id] }); // Clear multi-select when resizing
		startX = event.clientX;
		startY = event.clientY;
		startWidth = component.width;
		startHeight = component.height;
		event.preventDefault();
	}

	function startSelectionBox(e: MouseEvent) {
		// Only start selection box if we're not clicking on a component or guide
		if (!activeComponentId && !draggingGuide && e.button === 0) {
			selectionBox.active = true;
			selectionBox.startX = mouseX;
			selectionBox.startY = mouseY;
			selectionBox.endX = mouseX;
			selectionBox.endY = mouseY;
		}
	}

	function endMouseOperation(e: MouseEvent) {
		isDragging = false;
		isResizing = false;
		activeComponentId = null;
		draggingGuide = null;

		if (isPanning) {
			isPanning = false;
		}

		if (selectionBox.active) {
			selectionBox.active = false;
		}
	}

	function startPan(e: MouseEvent) {
		if (e.button === 1 || (e.button === 0 && e.altKey)) {
			// Middle mouse button or Alt+Left click
			isPanning = true;
			startX = e.clientX;
			startY = e.clientY;
			e.preventDefault();
		}
	}

	function handleCanvasClick(e: MouseEvent) {
		// Double click to add a guide
		const currentTime = Date.now();
		if (currentTime - lastClickTime < 300 && e.target === e.currentTarget) {
			if (e.offsetY < 30) {
				// Add vertical guide
				dispatch('doubleClickGuide', {
					direction: 'vertical',
					position: snapToGrid(mouseX)
				});
			} else if (e.offsetX < 30) {
				// Add horizontal guide
				dispatch('doubleClickGuide', {
					direction: 'horizontal',
					position: snapToGrid(mouseY)
				});
			}
		}
		lastClickTime = currentTime;

		// Clear selection if clicking on empty canvas area
		if (e.target === e.currentTarget && !selectionBox.active) {
			dispatch('selectComponent', { component: null });
			dispatch('updateMultiSelection', { ids: [] });
		}
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
		dispatch('contextMenu', { x: e.clientX, y: e.clientY });
	}

	function onStartGuideMove(
		e: CustomEvent<{ direction: 'horizontal' | 'vertical'; index: number }>
	) {
		draggingGuide = e.detail;
	}

	function handleWheel(e: WheelEvent) {
		dispatch('wheel', { event: e });
	}
</script>

<div class="relative h-full w-full overflow-hidden">
	<!-- Horizontal Ruler -->
	<div class="absolute top-0 right-0 left-8 z-10 h-8">
		<CanvasRuler
			direction="horizontal"
			length={canvasWidth}
			{units}
			{mouseX}
			pixelsPerUnit={units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 10}
		/>
	</div>

	<!-- Vertical Ruler -->
	<div class="absolute top-8 bottom-0 left-0 z-10 w-8">
		<CanvasRuler
			direction="vertical"
			length={canvasHeight}
			{units}
			{mouseY}
			pixelsPerUnit={units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 10}
		/>
	</div>

	<!-- Corner Square -->
	<div
		class="absolute top-0 left-0 z-10 h-8 w-8 border-r border-b border-gray-300 bg-gray-200"
	></div>

	<!-- Canvas with padding for rulers -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="relative h-full w-full overflow-auto pt-8 pl-8"
		aria-label="Survey canvas"
		on:mousemove={handleMouseMove}
		on:mouseup={endMouseOperation}
		on:mouseleave={endMouseOperation}
		on:wheel={handleWheel}
		on:contextmenu={handleContextMenu}
		role="application"
		tabindex="0"
		bind:this={canvasRef}
	>
		<div
			class="canvas-container absolute bg-gray-50"
			style="
                transform: scale({canvasScale}); 
                transform-origin: 0 0;
                margin-left: {canvasOffsetX}px; 
                margin-top: {canvasOffsetY}px;
            "
		>
			<div
				class="relative border-2 border-gray-300"
				style="width: {canvasWidth}px; height: {canvasHeight}px;"
				on:mousedown={startSelectionBox}
				on:click={handleCanvasClick}
				on:mousedown={startPan}
				role="presentation"
			>
				<!-- Background grid -->
				<CanvasGrid enabled={enableSnap} {gridSize} width={canvasWidth} height={canvasHeight} />

				<!-- Guides -->
				{#if showGuides}
					{#each horizontalGuides as guide, index}
						<CanvasGuide
							direction="horizontal"
							position={guide}
							{index}
							on:startMove={onStartGuideMove}
							on:remove={() => dispatch('removeGuide', { direction: 'horizontal', index })}
						/>
					{/each}
					{#each verticalGuides as guide, index}
						<CanvasGuide
							direction="vertical"
							position={guide}
							{index}
							on:startMove={onStartGuideMove}
							on:remove={() => dispatch('removeGuide', { direction: 'vertical', index })}
						/>
					{/each}
				{/if}

				<!-- Selection box -->
				<SelectionBox
					active={selectionBox.active}
					startX={selectionBox.startX}
					startY={selectionBox.startY}
					endX={selectionBox.endX}
					endY={selectionBox.endY}
				/>

				{#each componentsStore as component (component.id)}
					<SurveyComponent
						{component}
						isSelected={multiSelectedComponents.includes(component.id)}
						isActive={selectedComponent?.id === component.id}
						on:select={(e) => dispatch('selectComponent', { component: e.detail })}
						on:startDrag={onStartDrag}
						on:startResize={onStartResize}
					/>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.canvas-container {
		background-color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
</style>
