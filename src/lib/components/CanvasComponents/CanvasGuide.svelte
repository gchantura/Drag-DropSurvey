<!-- src/lib/components/CanvasComponents/CanvasGuide.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let direction: 'horizontal' | 'vertical';
	export let position: number;
	export let index: number;
	export let selected: boolean = false;
	export let scale: number = 1;
	export let offset: number = 0;
	const dispatch = createEventDispatcher<{
		startMove: { direction: 'horizontal' | 'vertical'; index: number; event: MouseEvent };
		remove: { direction: 'horizontal' | 'vertical'; index: number };
		select: { index: number };
		guideContextMenu: {
			direction: 'horizontal' | 'vertical';
			index: number;
			position: number;
			event: MouseEvent;
		};
		toggleVisibility: { direction: 'horizontal' | 'vertical'; index: number };
	}>();
	const isHorizontal = direction === 'horizontal';
	let screenPosition: number;
	let displayPosition: number;
	$: screenPosition = position * scale + offset;
	$: displayPosition = Math.round(position);
	function startDrag(event: MouseEvent) {
		if (event.button !== 0) return;
		dispatch('startMove', { direction, index, event });
		dispatch('select', { index });
		event.preventDefault();
		event.stopPropagation();
	}
	function handleContextMenu(event: MouseEvent) {
		dispatch('guideContextMenu', { direction, index, position, event });
		event.preventDefault();
		event.stopPropagation();
	}
	function handleClick(event: MouseEvent) {
		if (event.button !== 0) return;
		dispatch('select', { index });
		event.stopPropagation();
	}
	function handleToggleVisibility(event: MouseEvent) {
		dispatch('toggleVisibility', { direction, index });
		event.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_no_static_element_interactions a11y_click_events_have_key_events -->
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
	onmousedown={startDrag}
	onclick={handleClick}
	oncontextmenu={handleContextMenu}
	title="Drag to move, Right-click for options"
>
	<div
		class="guide-line absolute bg-blue-500 group-hover:bg-blue-600 dark:bg-blue-400 dark:group-hover:bg-blue-300"
		class:h-full={!isHorizontal}
		class:w-full={isHorizontal}
		class:w-px={!isHorizontal}
		class:h-px={isHorizontal}
	></div>
	<div
		class="guide-label absolute flex items-center gap-1 rounded border border-blue-500 bg-white px-1 py-0.5 text-xs text-blue-500 opacity-0 shadow-sm group-hover:opacity-100 dark:border-blue-400 dark:bg-gray-800 dark:text-blue-300"
		class:opacity-100={selected}
		style={isHorizontal
			? 'left: 4px; top: -20px; transform: translateY(-100%);'
			: 'left: 4px; top: 4px;'}
	>
		<span>{displayPosition}px</span>
		<button
			class="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
			title="Toggle guide visibility"
			onclick={handleToggleVisibility}
			aria-label="Toggle guide visibility"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="10"
				height="10"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
				<circle cx="12" cy="12" r="3"></circle>
			</svg>
		</button>
	</div>
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
		z-index: 15;
		pointer-events: auto;
		width: 100%;
		height: 100%;
	}
	.guide-h {
		height: 1px !important;
	}
	.guide-v {
		width: 1px !important;
	}
	.guide-line {
		transition: background-color 0.1s ease-in-out;
		pointer-events: none;
	}
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
		white-space: nowrap;
	}
	.selected .guide-line {
		background-color: #2563eb !important;
	}
	.selected .guide-label {
		opacity: 1;
	}
	.bg-blue-500 {
		background-color: #3b82f6;
	}
</style>
