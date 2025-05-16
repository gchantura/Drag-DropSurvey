<script lang="ts">
	import type { SelectionBox, SurveyComponent as SurveyComponentType } from '../types.ts';
	import { componentsStore } from '$lib/stores/surveyStore.ts';
	import SurveyComponent from './SurveyComponent.svelte';
	export let canvasWidth: number;
	export let canvasHeight: number;
	export let enableSnap: boolean;
	export let gridSize: number;
	export let selectionBox: SelectionBox;
	export let selectedComponentId: string | null;
	export let multiSelectedComponentIds: string[];
	export let canvasScale: number = 1;
	export let canvasOffsetX: number = 0;
	export let canvasOffsetY: number = 0;

	$: components = $componentsStore; // <-- Create a reactive variable for the store value

	// Forward events from SurveyComponent to parent
	function forwardEvent(event: CustomEvent) {
		// Forward the event with the same type and detail
		dispatchEvent(event);
	}
</script>

<div
	id="canvas-content-capture-area"
	class="canvas-content-area relative bg-gray-50 dark:bg-gray-800"
	style="width: {canvasWidth}px; height: {canvasHeight}px; overflow: visible;"
	role="presentation"
>
	{#if enableSnap && gridSize > 0 && canvasScale > 0.1}
		<div
			class="canvas-grid-container grid-lines pointer-events-none absolute inset-0 overflow-hidden"
		>
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs
					><pattern
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
	{#if selectionBox.active}
		<div
			class="selection-box pointer-events-none absolute border"
			style:left="{Math.min(selectionBox.startX, selectionBox.endX)}px"
			style:top="{Math.min(selectionBox.startY, selectionBox.endY)}px"
			style:width="{Math.abs(selectionBox.endX - selectionBox.startX)}px"
			style:height="{Math.abs(selectionBox.endY - selectionBox.startY)}px"
			style:background-color="var(--selection-bg-color)"
			style:border-color="var(--selection-border-color)"
		></div>
	{/if}
	{#each components as component (component.id)}
		<SurveyComponent
			{component}
			isSelected={multiSelectedComponentIds.includes(component.id)}
			isActive={selectedComponentId === component.id}
			on:select={forwardEvent}
			on:startDrag={forwardEvent}
			on:startResize={forwardEvent}
		/>
	{/each}
	<slot />
</div>

<style>
	.canvas-content-area {
		will-change: transform;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		background-image:
			linear-gradient(rgba(100, 100, 100, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(100, 100, 100, 0.05) 1px, transparent 1px);
		background-size: 20px 20px;
	}
	.selection-box {
		z-index: 10;
		border-width: 1px;
		border-style: solid;
		background-color: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.5);
	}

	:global(.dark) .canvas-content-area {
		background-image:
			linear-gradient(rgba(200, 200, 200, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(200, 200, 200, 0.05) 1px, transparent 1px);
	}
</style>
