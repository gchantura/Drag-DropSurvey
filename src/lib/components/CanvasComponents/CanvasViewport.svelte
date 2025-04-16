<!-- src/lib/components/CanvasComponents/CanvasViewport.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	// Assuming types/survey.ts is correct and $lib alias works
	import type { SurveyComponent as SurveyComponentType, SelectionBox } from '$lib/types/survey.ts';
	import CanvasContent from './CanvasContent.svelte';

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
	export let selectionBox: SelectionBox;
	export let selectedComponentId: string | null;
	export let multiSelectedComponentIds: string[];

	// REMOVED: Ref export is no longer needed by parent
	// export let canvasContentRef: HTMLElement | undefined = undefined;

	const dispatch = createEventDispatcher();

	// Forward events from CanvasContent
	function forwardEvent(event: Event) {
		dispatch(event.type, (event as CustomEvent).detail);
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions used for event handling -->
<div
	class="canvas-viewport relative h-full w-full overflow-auto bg-gray-200 pt-8 pl-8 dark:bg-gray-700"
	role="region"
	aria-label="Survey canvas content area"
>
	<div
		class="canvas-transform-container"
		style="
            margin-left: {canvasOffsetX}px;
            margin-top: {canvasOffsetY}px;
            transform: scale({canvasScale});
            transform-origin: 0 0;
            width: {canvasWidth}px;
            height: {canvasHeight}px;
        "
	>
		<!-- Embed CanvasContent - REMOVED bind:this -->
		<CanvasContent
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
		background-size: cover;
	}
	.canvas-transform-container {
		position: absolute;
	}
</style>
