<!-- src/lib/components/CanvasComponents/CanvasContent.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { componentsStore } from '$lib/stores/surveyStore.ts';
	import type { SurveyComponent as SurveyComponentType, SelectionBox } from '$lib/types/survey.ts';
	import SurveyComponent from '$lib/components/SurveyComponent.svelte';

	// --- Props ---
	export let canvasWidth: number;
	export let canvasHeight: number;
	export let enableSnap: boolean;
	export let gridSize: number;
	export let selectionBox: SelectionBox;
	export let selectedComponentId: string | null;
	export let multiSelectedComponentIds: string[];
	export let canvasScale: number = 1; // Still needed for grid pattern
	export let canvasOffsetX: number = 0; // Still needed for grid pattern
	export let canvasOffsetY: number = 0; // Still needed for grid pattern

	// --- Event Dispatcher ---
	// Event map updated - no guide events originate here anymore
	type EventMap = {
		selectComponent: SurveyComponentType;
		startDrag: { event: MouseEvent; component: SurveyComponentType };
		startResize: { event: MouseEvent; component: SurveyComponentType };
	};
	const dispatch = createEventDispatcher<EventMap>();

	// --- Functions ---
	function forwardEvent(event: Event) {
		dispatch((event as CustomEvent).type as keyof EventMap, (event as CustomEvent).detail);
	}
</script>

<div
	class="canvas-content-area relative bg-white dark:bg-gray-800"
	style="width: {canvasWidth}px; height: {canvasHeight}px; overflow: visible;"
	role="presentation"
>
	<!-- Background grid -->
	{#if enableSnap && gridSize > 0 && canvasScale > 0.1}
		<div class="grid-lines pointer-events-none absolute inset-0 overflow-hidden">
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern
						id="gridPattern"
						width={gridSize * canvasScale}
						height={gridSize * canvasScale}
						patternUnits="userSpaceOnUse"
						x={canvasOffsetX % (gridSize * canvasScale)}
						y={canvasOffsetY % (gridSize * canvasScale)}
					>
						<path
							d="M {gridSize * canvasScale} 0 L 0 0 0 {gridSize * canvasScale}"
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

	<!-- Selection box -->
	{#if selectionBox.active}
		<div
			class="selection-box bg-opacity-20 dark:bg-opacity-30 pointer-events-none absolute border border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900"
			style:left="{Math.min(selectionBox.startX, selectionBox.endX)}px"
			style:top="{Math.min(selectionBox.startY, selectionBox.endY)}px"
			style:width="{Math.abs(selectionBox.endX - selectionBox.startX)}px"
			style:height="{Math.abs(selectionBox.endY - selectionBox.startY)}px"
		></div>
	{/if}

	<!-- Survey Components -->
	{#each $componentsStore as component (component.id)}
		<SurveyComponent
			{component}
			isSelected={multiSelectedComponentIds.includes(component.id)}
			isActive={selectedComponentId === component.id}
			on:select={forwardEvent}
			on:startDrag={forwardEvent}
			on:startResize={forwardEvent}
		/>
	{/each}
</div>

<style>
	.canvas-content-area {
		will-change: transform;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	.selection-box {
		z-index: 10;
	}
</style>
