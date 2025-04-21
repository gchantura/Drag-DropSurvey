<!-- src/lib/components/CanvasComponents/CanvasGuide.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let direction: 'horizontal' | 'vertical';
	export let position: number;
	export let index: number;
	export let canvasWidth: number = 0; // Needed for vertical guide width
	export let canvasHeight: number = 0; // Needed for horizontal guide height
	export let selected: boolean = false; // NEW: Track selected state

	const dispatch = createEventDispatcher<{
		startMove: { direction: 'horizontal' | 'vertical'; index: number };
		remove: void; // Simple remove event
		select: { index: number }; // NEW: Selection event
	}>();

	const isHorizontal = direction === 'horizontal';

	function startDrag(event: MouseEvent) {
		if (event.button !== 0) return; // Only react to left click
		dispatch('startMove', { direction, index });
		dispatch('select', { index }); // NEW: Select when drag starts
		event.preventDefault();
		event.stopPropagation(); // Prevent canvas background click
	}

	function handleContextMenu(event: MouseEvent) {
		dispatch('remove');
		event.preventDefault(); // Prevent browser context menu
		event.stopPropagation();
	}

	function handleClick(event: MouseEvent) {
		if (event.button !== 0) return; // Only react to left click
		dispatch('select', { index });
		event.stopPropagation();
	}

	// Position formatted for label display
	$: displayPosition = Math.round(position);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	role="separator"
	aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
	aria-label={`Draggable ${direction} guide at ${position.toFixed(0)}px`}
	class="guide group absolute cursor-move"
	class:guide-h={isHorizontal}
	class:guide-v={!isHorizontal}
	class:selected
	style={isHorizontal
		? `top: ${position}px; left: 0px; height: 1px; width: ${canvasWidth}px;`
		: `left: ${position}px; top: 0px; width: 1px; height: ${canvasHeight}px;`}
	on:mousedown={startDrag}
	on:click={handleClick}
	on:contextmenu={handleContextMenu}
	title="Drag to move, Right-click to remove"
>
	<!-- The visible line -->
	<div
		class="guide-line absolute bg-blue-500 group-hover:bg-blue-600 dark:bg-blue-400 dark:group-hover:bg-blue-300"
		class:h-full={!isHorizontal}
		class:w-full={isHorizontal}
		class:w-px={!isHorizontal}
		class:h-px={isHorizontal}
	></div>

	<!-- Position label - only shown on hover or when selected -->
	<div
		class="guide-label absolute rounded border border-blue-500 bg-white px-1 py-0.5 text-xs text-blue-500 opacity-0 shadow-sm group-hover:opacity-100"
		class:opacity-100={selected}
		style={isHorizontal ? 'left: 4px; top: -20px;' : 'left: 4px; top: 4px;'}
	>
		{displayPosition}px
	</div>

	<!-- Interaction area (slightly larger) -->
	<div
		class="interaction-area absolute"
		class:inset-x-0={isHorizontal}
		class:h-2={isHorizontal}
		class:-translate-y-1={isHorizontal}
		class:inset-y-0={!isHorizontal}
		class:w-2={!isHorizontal}
		class:-translate-x-1={!isHorizontal}
	></div>
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

	.guide-label {
		transition: opacity 0.15s ease-in-out;
		pointer-events: none;
		z-index: 2;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	/* Selected state styling */
	.selected .guide-line {
		background-color: #2563eb !important; /* blue-600 */
	}

	.bg-blue-500 {
		background-color: #3b82f6;
	}
</style>
