<!-- src/lib/components/CanvasComponents/CanvasViewport.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent as SurveyComponentType } from '$lib/types/survey.ts';
	import type { SelectionBox } from '$lib/types/survey.ts'; // Correct import
	import CanvasContent from './CanvasContent.svelte'; // Use static import

	export let canvasWidth: number;
	export let canvasHeight: number;
	export let canvasScale: number;
	export let canvasOffsetX: number;
	export let canvasOffsetY: number;

	// Pass through props needed by CanvasContent
	export let enableSnap: boolean;
	export let gridSize: number;
	export let showGuides: boolean;
	export let horizontalGuides: number[];
	export let verticalGuides: number[];
	export let selectionBox: SelectionBox; // Use imported type
	export let selectedComponentId: string | null;
	export let multiSelectedComponentIds: string[];

	// Ref for calculating relative mouse position - Use HTMLElement
	export let canvasContentRef: HTMLElement | undefined = undefined; // **** Corrected Type ****

	const dispatch = createEventDispatcher(); // Forward all events from CanvasContent

	// Forward events from CanvasContent
	// Type safety here relies on CanvasContent dispatching correctly named events
	function forwardEvent(event: Event) {
		dispatch(event.type, (event as CustomEvent).detail);
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions used for event handling -->
<div
	class="canvas-viewport relative h-full w-full overflow-auto bg-gray-200 pt-8 pl-8 dark:bg-gray-700"
	role="application"
	aria-label="Survey canvas content area"
>
	<div
		class="canvas-transform-container"
		style="
            /* Apply margin for panning */
            margin-left: {canvasOffsetX}px;
            margin-top: {canvasOffsetY}px;
            /* Use transform for scaling for better performance */
            transform: scale({canvasScale});
            transform-origin: 0 0;
            width: {canvasWidth}px; /* Set width/height here for correct scaling origin */
            height: {canvasHeight}px;
        "
	>
		<!-- Embed CanvasContent -->
		<CanvasContent
			bind:this={canvasContentRef}
			{canvasWidth}
			{canvasHeight}
			{enableSnap}
			{gridSize}
			{showGuides}
			{horizontalGuides}
			{verticalGuides}
			{selectionBox}
			{selectedComponentId}
			{multiSelectedComponentIds}
			on:startSelectionBox={forwardEvent}
			on:canvasClick={forwardEvent}
			on:startPan={forwardEvent}
			on:startGuideMove={forwardEvent}
			on:removeGuide={forwardEvent}
			on:selectComponent={forwardEvent}
			on:startDrag={forwardEvent}
			on:startResize={forwardEvent}
		/>
	</div>
</div>

<style>
	.canvas-viewport {
		/* Ensure the background covers the whole area */
		background-size: cover;
	}
	.canvas-transform-container {
		position: absolute; /* Important for correct offset and scaling */
		/* background-color: white; Let CanvasContent handle background */
	}
</style>
