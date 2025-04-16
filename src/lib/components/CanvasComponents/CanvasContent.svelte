<!-- src/lib/components/CanvasComponents/CanvasContent.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { componentsStore } from '$lib/stores/surveyStore.ts';
	import type {
		SurveyComponent as SurveyComponentType,
		SelectionBox, // Now correctly imported if survey.ts exports it
		DraggingGuide // Now correctly imported if survey.ts exports it
	} from '$lib/types/survey.ts';
	import CanvasGuide from './CanvasGuide.svelte'; // Assuming it's in the same subdir
	import SurveyComponent from '$lib/components/SurveyComponent.svelte'; // Adjusted Path: ../ goes up one level

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
	export let mouseX: number = 0;
	export let mouseY: number = 0;

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

	function handleMouseDown(e: MouseEvent) {
		// Only dispatch if clicking directly on the background, not on a component or guide
		const target = e.target as HTMLElement;
		if (target === e.currentTarget) {
			if (e.button === 1 || (e.button === 0 && e.altKey)) {
				// Middle mouse button or Alt+Left click for panning
				dispatch('startPan', e);
			} else if (e.button === 0) {
				// Left click for selection box
				dispatch('startSelectionBox', { event: e, x: mouseX, y: mouseY });
			}
		}
	}

	function handleClick(e: MouseEvent) {
		// Dispatch click for potential actions like adding guides or clearing selection
		if (e.target === e.currentTarget) {
			dispatch('canvasClick', { event: e, x: mouseX, y: mouseY });
		}
	}
</script>

<div
	class="canvas-content relative border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
	style="width: {canvasWidth}px; height: {canvasHeight}px;"
	on:mousedown={handleMouseDown}
	on:click={handleClick}
	role="presentation"
>
	<!-- Background grid -->
	{#if enableSnap && gridSize > 0}
		<div class="grid-lines pointer-events-none absolute inset-0 overflow-hidden">
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
						<path
							d="M {gridSize} 0 L 0 0 0 {gridSize}"
							fill="none"
							stroke="#e5e7eb"
							stroke-width="0.5"
							class="dark:stroke-gray-700"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid)" />
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
		<!-- **** Corrected: Removed self-closing tag **** -->
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
		/* Improves rendering performance during transforms */
		will-change: transform;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	.selection-box {
		z-index: 10;
	}
</style>
