<!-- src/lib/components/CanvasComponents/CanvasViewport.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent as SurveyComponentType, SelectionBox } from '$lib/types/survey.ts';
	import CanvasContent from './CanvasContent.svelte';
	import CanvasGuide from './CanvasGuide.svelte'; // ADDED Import

	// --- Props ---
	export let canvasWidth: number;
	export let canvasHeight: number;
	export let canvasScale: number;
	export let canvasOffsetX: number;
	export let canvasOffsetY: number;

	export let enableSnap: boolean;
	export let gridSize: number;
	export let showGuides: boolean; // Keep, used for rendering guides here
	export let horizontalGuides: number[]; // Keep, used for rendering guides here
	export let verticalGuides: number[]; // Keep, used for rendering guides here
	export let selectionBox: SelectionBox;
	export let selectedComponentId: string | null;
	export let multiSelectedComponentIds: string[];

	export let spacebarHeld: boolean = false;

	// --- Event Dispatcher ---
	// Added guide events to the map
	type EventMap = {
		startSelectionBox: { event: MouseEvent; x: number; y: number }; // Coords need calculation in parent still
		canvasClick: { event: MouseEvent; x: number; y: number }; // Coords need calculation in parent still
		startPan: MouseEvent;
		// Component events forwarded from CanvasContent
		selectComponent: SurveyComponentType; // Assuming fixed detail type
		startDrag: { event: MouseEvent; component: SurveyComponentType };
		startResize: { event: MouseEvent; component: SurveyComponentType };
		// Guide events originating from guides rendered here
		startGuideMove: { direction: 'horizontal' | 'vertical'; index: number; event: MouseEvent };
		removeGuide: { direction: 'horizontal' | 'vertical'; index: number };
	};
	const dispatch = createEventDispatcher<EventMap>();

	// --- Functions ---
	// Generic forwarder, used for component events from CanvasContent
	function forwardEventFromContent(event: Event) {
		dispatch((event as CustomEvent).type as keyof EventMap, (event as CustomEvent).detail);
	}
	// Specific forwarders for guide events rendered here
	function forwardGuideMove(event: CustomEvent) {
		dispatch('startGuideMove', event.detail);
	}
	function forwardGuideRemove(event: CustomEvent) {
		dispatch('removeGuide', event.detail);
	}

	function handleMouseDown(event: MouseEvent) {
		// Prevent default actions and propagation check are important
		if (spacebarHeld && event.button === 0) {
			dispatch('startPan', event);
			event.preventDefault();
			event.stopPropagation(); // Prevent starting selection box if clicking bg while space held
			return;
		}
		// Only dispatch if click is DIRECTLY on this background element
		if (event.target === event.currentTarget) {
			if (event.button === 0) {
				dispatch('startSelectionBox', { event, x: 0, y: 0 }); // Parent calculates coords
				// Do not stop propagation here, allow potential component interaction below
			} else if (event.button === 1) {
				// Middle mouse starts pan
				dispatch('startPan', event);
				event.preventDefault(); // Prevent default middle-click scroll
				event.stopPropagation(); // Prevent bubbling to window scroll etc.
			}
		}
	}

	function handleClick(event: MouseEvent) {
		// Only dispatch if click is DIRECTLY on this background element
		if (!spacebarHeld && event.target === event.currentTarget && event.button === 0) {
			dispatch('canvasClick', { event, x: 0, y: 0 }); // Parent calculates coords
		}
		// Do not stop propagation here, allow bubbling for context menu etc.
	}
</script>

<!-- Container for background interactions AND static overlays like guides -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="canvas-viewport-background absolute inset-0"
	on:mousedown={handleMouseDown}
	on:click={handleClick}
>
	<!-- Transformed Container for Panning/Zooming Content -->
	<div
		class="canvas-transform-container"
		style:width="{canvasWidth}px"
		style:height="{canvasHeight}px"
		style:transform="translate({canvasOffsetX}px, {canvasOffsetY}px) scale({canvasScale})"
		style:transform-origin="0 0"
	>
		<!-- Canvas Content (Components, Grid, Selection Box) -->
		<CanvasContent
			{canvasWidth}
			{canvasHeight}
			{enableSnap}
			{gridSize}
			{selectionBox}
			{selectedComponentId}
			{multiSelectedComponentIds}
			{canvasScale}
			{canvasOffsetX}
			{canvasOffsetY}
			on:selectComponent={forwardEventFromContent}
			on:startDrag={forwardEventFromContent}
			on:startResize={forwardEventFromContent}
		/>
	</div>

	<!-- Guides - Rendered OUTSIDE transform container, relative to viewport -->
	{#if showGuides}
		{#each horizontalGuides as guidePos, index (guidePos + '-' + index)}
			<CanvasGuide
				direction="horizontal"
				position={guidePos}
				{index}
				scale={canvasScale}
				offset={canvasOffsetY}
				on:startMove={forwardGuideMove}
				on:remove={forwardGuideRemove}
				on:select={() => {
					/* Handle guide selection visual if needed */
				}}
			/>
		{/each}
		{#each verticalGuides as guidePos, index (guidePos + '-' + index)}
			<CanvasGuide
				direction="vertical"
				position={guidePos}
				{index}
				scale={canvasScale}
				offset={canvasOffsetX}
				on:startMove={forwardGuideMove}
				on:remove={forwardGuideRemove}
				on:select={() => {
					/* Handle guide selection visual if needed */
				}}
			/>
		{/each}
	{/if}
</div>

<style>
	/* Styles are mostly unchanged */
	.canvas-viewport-background {
		/* Ensure it covers the area and allows absolute positioning of children */
		position: absolute;
		inset: 0;
		overflow: hidden; /* Clip guides if they go outside the viewport */
	}
	.canvas-transform-container {
		/* Relative positioning allows z-index stacking if needed, but absolute is also fine */
		position: absolute;
		top: 0;
		left: 0;
		/* No background needed here, use CanvasContent's background */
		/* background-color: transparent; */
		will-change: transform;
		overflow: visible; /* Allow component overflow if necessary */
	}
	/* Guide styles in CanvasGuide.svelte */
</style>
