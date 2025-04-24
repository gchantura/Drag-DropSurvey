<!-- src/lib/components/CanvasComponents/CanvasGuide.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let direction: 'horizontal' | 'vertical';
	export let position: number; // Position is in CANVAS coordinates
	export let index: number;
	export let selected: boolean = false; // Track selected state (useful if guides become selectable later)
	export let scale: number = 1; // Needed for label display relative to canvas origin? No, label is screen relative.
	export let offset: number = 0; // Needed to position the guide div correctly relative to the viewport origin

	const dispatch = createEventDispatcher<{
		startMove: { direction: 'horizontal' | 'vertical'; index: number; event: MouseEvent }; // Pass event
		remove: { direction: 'horizontal' | 'vertical'; index: number }; // Pass identifying info
		select: { index: number }; // Selection event
	}>();

	const isHorizontal = direction === 'horizontal';

	// Calculate SCREEN position for the div based on canvas position, scale, and offset
	$: screenPosition = position * scale + offset;

	function startDrag(event: MouseEvent) {
		if (event.button !== 0) return; // Only react to left click
		// Pass the original mouse event for coordinate tracking in the parent
		dispatch('startMove', { direction, index, event });
		dispatch('select', { index }); // Select when drag starts
		event.preventDefault();
		event.stopPropagation(); // Prevent canvas background click/pan
	}

	function handleContextMenu(event: MouseEvent) {
		// Dispatch with details needed by parent to identify which guide to remove
		dispatch('remove', { direction, index });
		event.preventDefault(); // Prevent browser context menu
		event.stopPropagation();
	}

	function handleClick(event: MouseEvent) {
		if (event.button !== 0) return; // Only react to left click
		dispatch('select', { index });
		event.stopPropagation();
	}

	// Position formatted for label display (always show integer pixels)
	$: displayPosition = Math.round(position);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	role="separator"
	aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
	aria-label={`Draggable ${direction} guide at ${displayPosition}px`}
	class="guide group absolute cursor-move"
	class:guide-h={isHorizontal}
	class:guide-v={!isHorizontal}
	class:selected
	style={isHorizontal
		? `top: ${screenPosition}px; left: 0px; height: 1px; width: 100%;`
		: `left: ${screenPosition}px; top: 0px; width: 1px; height: 100%;`}
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
	<!-- Position label relative to the guide line itself -->
	<div
		class="guide-label absolute rounded border border-blue-500 bg-white px-1 py-0.5 text-xs text-blue-500 opacity-0 shadow-sm group-hover:opacity-100 dark:border-blue-400 dark:bg-gray-800 dark:text-blue-300"
		class:opacity-100={selected}
		style={isHorizontal
			? 'left: 4px; top: -20px; transform: translateY(-100%);' // Adjust vertical offset above line
			: 'left: 4px; top: 4px;'}
	>
		{displayPosition}px
	</div>

	<!-- Interaction area (slightly larger) -->
	<div
		class="interaction-area absolute"
		class:inset-x-0={isHorizontal}
		class:h-3={isHorizontal}
		class:-translate-y-1.5={isHorizontal}
		class:inset-y-0={!isHorizontal}
		class:w-3={!isHorizontal}
		class:-translate-x-1.5={!isHorizontal}
	></div>
</div>

<style>
	.guide {
		z-index: 15; /* Above grid, below components being dragged? */
		pointer-events: auto; /* Enable pointer events */
		/* Ensure guides span the transformed container, not the viewport */
		width: 100%;
		height: 100%;
	}
	/* Override width/height based on direction */
	.guide-h {
		height: 1px !important;
	}
	.guide-v {
		width: 1px !important;
	}

	.guide-line {
		transition: background-color 0.1s ease-in-out;
		pointer-events: none; /* Line itself doesn't capture events */
	}

	.interaction-area {
		/* background-color: rgba(255, 0, 0, 0.1); // Uncomment to debug hit area */
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
		white-space: nowrap; /* Prevent label wrapping */
	}

	/* Selected state styling */
	.selected .guide-line {
		background-color: #2563eb !important; /* blue-600 */
	}
	.selected .guide-label {
		opacity: 1;
	}

	/* Use explicit Tailwind colors if purging/not available */
	.bg-blue-500 {
		background-color: #3b82f6;
	}
</style>
