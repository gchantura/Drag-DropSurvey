<!-- src/lib/components/CanvasComponents/CanvasContent.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { componentsStore } from '$lib/stores/surveyStore.ts';
	// Assuming types/survey.ts is correct and $lib alias works
	import type {
		SurveyComponent as SurveyComponentType,
		SelectionBox,
		DraggingGuide
	} from '$lib/types/survey.ts';
	import CanvasGuide from './CanvasGuide.svelte';
	// Use $lib alias for consistency if SurveyComponent is directly in components
	import SurveyComponent from '$lib/components/SurveyComponent.svelte';

	export let canvasWidth: number;
	export let canvasHeight: number;
	export let enableSnap: boolean;
	export let gridSize: number;
	export let showGuides: boolean;
	export let horizontalGuides: number[];
	export let verticalGuides: number[];
	export let selectionBox: SelectionBox;
	export let selectedComponentId: string | null;
	export let multiSelectedComponentIds: string[];

	// Mouse position relative to the *unscaled* canvas content
	// These props might not be needed if Canvas.svelte calculates internally
	// export let mouseX: number = 0;
	// export let mouseY: number = 0;

	// Define explicit event map for better type checking
	type EventMap = {
		startSelectionBox: { event: MouseEvent; x: number; y: number };
		canvasClick: { event: MouseEvent; x: number; y: number };
		startPan: MouseEvent;
		startGuideMove: { direction: 'horizontal' | 'vertical'; index: number };
		removeGuide: { direction: 'horizontal' | 'vertical'; index: number };
		selectComponent: SurveyComponentType;
		startDrag: { event: MouseEvent; component: SurveyComponentType };
		startResize: { event: MouseEvent; component: SurveyComponentType };
	};
	const dispatch = createEventDispatcher<EventMap>();

	// Need mouse position *relative to this element* for dispatching
	let localMouseX = 0;
	let localMouseY = 0;
	function updateLocalMouse(event: MouseEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		localMouseX = event.clientX - rect.left;
		localMouseY = event.clientY - rect.top;
	}

	function handleMouseDown(e: MouseEvent) {
		updateLocalMouse(e); // Update local coords based on this event
		const target = e.target as HTMLElement;
		if (target === e.currentTarget) {
			if (e.button === 1 || (e.button === 0 && e.altKey)) {
				dispatch('startPan', e);
			} else if (e.button === 0) {
				// Dispatch coords relative to this element (unscaled)
				dispatch('startSelectionBox', { event: e, x: localMouseX, y: localMouseY });
			}
		}
	}

	function handleClick(e: MouseEvent) {
		updateLocalMouse(e);
		if (e.target === e.currentTarget) {
			// Dispatch coords relative to this element (unscaled)
			dispatch('canvasClick', { event: e, x: localMouseX, y: localMouseY });
		}
	}
</script>

<div
	class="canvas-content relative border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
	style="width: {canvasWidth}px; height: {canvasHeight}px;"
	on:mousedown={handleMouseDown}
	on:click={handleClick}
	on:mousemove={updateLocalMouse}
	role="presentation"
>
	<!-- Background grid -->
	{#if enableSnap && gridSize > 0}
		<div class="grid-lines pointer-events-none absolute inset-0 overflow-hidden">
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern
						id="gridPattern"
						width={gridSize}
						height={gridSize}
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M {gridSize} 0 L 0 0 0 {gridSize}"
							fill="none"
							stroke="#e5e7eb"
							stroke-width="0.5"
							class="dark:stroke-gray-700"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#gridPattern)" />
			</svg>
		</div>
	{/if}

	<!-- Guides -->
	{#if showGuides}
		{#each horizontalGuides as guide, index}
			<CanvasGuide
				direction="horizontal"
				position={guide}
				{index}
				{canvasWidth}
				{canvasHeight}
				on:startMove={(e) => dispatch('startGuideMove', e.detail)}
				on:remove={() => dispatch('removeGuide', { direction: 'horizontal', index })}
			/>
		{/each}
		{#each verticalGuides as guide, index}
			<CanvasGuide
				direction="vertical"
				position={guide}
				{index}
				{canvasWidth}
				{canvasHeight}
				on:startMove={(e) => dispatch('startGuideMove', e.detail)}
				on:remove={() => dispatch('removeGuide', { direction: 'vertical', index })}
			/>
		{/each}
	{/if}

	<!-- Selection box -->
	{#if selectionBox.active}
		<div
			class="selection-box bg-opacity-20 dark:bg-opacity-30 pointer-events-none absolute border-2 border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900"
			style="
                left: {Math.min(selectionBox.startX, selectionBox.endX)}px;
                top: {Math.min(selectionBox.startY, selectionBox.endY)}px;
                width: {Math.abs(selectionBox.endX - selectionBox.startX)}px;
                height: {Math.abs(selectionBox.endY - selectionBox.startY)}px;
            "
		></div>
	{/if}

	<!-- Survey Components -->
	{#each $componentsStore as component (component.id)}
		<SurveyComponent
			{component}
			isSelected={multiSelectedComponentIds.includes(component.id)}
			isActive={selectedComponentId === component.id}
			on:select={(e) => dispatch('selectComponent', e.detail)}
			on:startDrag={(e) => dispatch('startDrag', e.detail)}
			on:startResize={(e) => dispatch('startResize', e.detail)}
		/>
	{/each}
</div>

<style>
	.canvas-content {
		will-change: transform;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	.selection-box {
		z-index: 10;
	}
</style>
