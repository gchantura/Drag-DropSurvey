<!-- src/lib/components/CanvasComponents/CanvasGuide.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let direction: 'horizontal' | 'vertical';
	export let position: number;
	export let index: number;
	export let canvasWidth: number = 0; // Needed for vertical guide width
	export let canvasHeight: number = 0; // Needed for horizontal guide height

	const dispatch = createEventDispatcher<{
		startMove: { direction: 'horizontal' | 'vertical'; index: number };
		remove: void; // Simple remove event
	}>();

	const isHorizontal = direction === 'horizontal';

	function startDrag(event: MouseEvent) {
		if (event.button !== 0) return; // Only react to left click
		dispatch('startMove', { direction, index });
		event.preventDefault();
		event.stopPropagation(); // Prevent canvas background click
	}

	function handleContextMenu(event: MouseEvent) {
		dispatch('remove');
		event.preventDefault(); // Prevent browser context menu
		event.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	role="separator"
	aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
	aria-label={`Draggable ${direction} guide at ${position.toFixed(0)}px`}
	class="guide group absolute cursor-move"
	class:guide-h={isHorizontal}
	class:guide-v={!isHorizontal}
	style={isHorizontal
		? `top: ${position}px; left: 0px; height: 1px; width: ${canvasWidth}px;`
		: `left: ${position}px; top: 0px; width: 1px; height: ${canvasHeight}px;`}
	on:mousedown={startDrag}
	on:contextmenu={handleContextMenu}
	title="Drag to move, Right-click to remove"
>
	<!-- The visible line -->
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div
		class="guide-line absolute bg-blue-500 group-hover:bg-blue-600 dark:bg-blue-400 dark:group-hover:bg-blue-300"
		class:h-full={!isHorizontal}
		class:w-full={isHorizontal}
		class:w-px={!isHorizontal}
		class:h-px={isHorizontal}
	/>
	<!-- Interaction area (slightly larger) -->
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div
		class="interaction-area absolute {isHorizontal
			? 'inset-x-0 h-2 -translate-y-1/2'
			: 'inset-y-0 w-2 -translate-x-1/2'}"
	/>
</div>

<style>
	.guide {
		z-index: 15; /* Above grid, below components being dragged? */
		pointer-events: auto; /* Enable pointer events */
	}

	.guide-line {
		transition: background-color 0.1s ease-in-out;
		pointer-events: none; /* Line itself doesn't capture events */
	}

	.interaction-area {
		/* background-color: rgba(255, 0, 0, 0.1); */ /* Uncomment to debug hit area */
	}

	/* Ensure the line is pixel-perfect */
	.h-px {
		height: 1px;
	}
	.w-px {
		width: 1px;
	}

	.bg-blue-500 {
		background-color: #3b82f6;
	}
</style>
