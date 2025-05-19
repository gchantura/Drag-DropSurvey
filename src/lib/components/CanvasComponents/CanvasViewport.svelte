<!-- src/lib/components/CanvasComponents/CanvasViewport.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent as SurveyComponentType, SelectionBox } from '$lib/types/types.ts';
	import CanvasContent from './CanvasContent.svelte';
	import CanvasGuide from './CanvasGuide.svelte';

	export let canvasWidth: number;
	export let canvasHeight: number;
	export let canvasScale: number;
	export let canvasOffsetX: number;
	export let canvasOffsetY: number;
	export let enableSnap: boolean;
	export let gridSize: number;
	export let showGuides: boolean;
	export let horizontalGuides: number[];
	export let verticalGuides: number[];
	export let selectionBox: SelectionBox;
	export let selectedComponentId: string | null;
	export let multiSelectedComponentIds: string[];
	export let spacebarHeld: boolean = false;

	type EventMap = {
		startSelectionBox: { event: MouseEvent };
		startPan: MouseEvent;
		selectComponent: { event: MouseEvent; component: SurveyComponentType };
		startDrag: { event: MouseEvent; component: SurveyComponentType };
		startResize: { event: MouseEvent; component: SurveyComponentType };
		startGuideMove: { direction: 'horizontal' | 'vertical'; index: number; event: MouseEvent };
		removeGuide: { direction: 'horizontal' | 'vertical'; index: number };
		guideContextMenu: {
			direction: 'horizontal' | 'vertical';
			index: number;
			position: number;
			event: MouseEvent;
		};
		clearSelection: void; // Event to signal background click
	};
	const dispatch = createEventDispatcher<EventMap>();

	function forwardEventFromContent(event: Event) {
		dispatch((event as CustomEvent).type as keyof EventMap, (event as CustomEvent).detail);
	}
	function forwardGuideMove(event: CustomEvent) {
		dispatch('startGuideMove', event.detail);
	}
	function forwardGuideRemove(event: CustomEvent) {
		dispatch('removeGuide', event.detail);
	}
	function forwardGuideContextMenu(event: CustomEvent) {
		dispatch('guideContextMenu', event.detail);
	}

	function handleMouseDown(event: MouseEvent): void {
		if ((spacebarHeld && event.button === 0) || event.button === 1) {
			dispatch('startPan', event);
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		// Start selection box ONLY if clicking directly on this background element
		if (event.target === event.currentTarget && event.button === 0) {
			dispatch('startSelectionBox', { event });
			// Do NOT stop propagation - allow mouseup to potentially trigger clearSelection
		}
	}

	// Click handler ONLY for this background div
	function handleBackgroundClick(event: MouseEvent): void {
		// Dispatch clearSelection ONLY if it's a direct left click on background
		// Parent (Canvas) will check interaction states before actually clearing
		if (!spacebarHeld && event.button === 0 && event.target === event.currentTarget) {
			dispatch('clearSelection');
		}
		// Allow propagation for global listeners (like context menu close)
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div
	class="canvas-viewport-background absolute inset-0"
	onmousedown={handleMouseDown}
	onclick={handleBackgroundClick}
>
	<div
		class="canvas-transform-container"
		style:width="{canvasWidth}px"
		style:height="{canvasHeight}px"
		style:transform="translate({canvasOffsetX}px, {canvasOffsetY}px) scale({canvasScale})"
		style:transform-origin="0 0"
	>
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
				on:guideContextMenu={forwardGuideContextMenu}
				on:select={() => {}}
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
				on:guideContextMenu={forwardGuideContextMenu}
				on:select={() => {}}
			/>
		{/each}
	{/if}
</div>

<style>
	.canvas-viewport-background {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	.canvas-transform-container {
		position: absolute;
		top: 0;
		left: 0;
		will-change: transform;
		overflow: visible;
	}
</style>
