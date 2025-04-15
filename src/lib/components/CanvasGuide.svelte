<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let direction: 'horizontal' | 'vertical';
	export let position: number;
	export let index: number;

	const dispatch = createEventDispatcher();
	const isHorizontal = direction === 'horizontal';

	function startDrag(event: MouseEvent) {
		dispatch('startMove', { direction, index });
		event.preventDefault();
	}

	function handleContextMenu(event: MouseEvent) {
		dispatch('remove');
		event.preventDefault();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_positive_tabindex -->
<!-- svelte-ignore a11y_positive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	role="separator"
	aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
	aria-label="Draggable guide"
	tabindex="10"
	class="guide absolute cursor-move"
	class:w-full={isHorizontal}
	class:h-full={!isHorizontal}
	style={isHorizontal ? `top: ${position}px` : `left: ${position}px`}
	on:mousedown={startDrag}
	on:contextmenu={handleContextMenu}
	title="Right-click to remove guide"
>
	<div
		class="guide-line bg-blue-500"
		class:h-px={isHorizontal}
		class:w-full={isHorizontal}
		class:h-full={!isHorizontal}
		class:w-px={!isHorizontal}
	></div>

	<div
		class="handle absolute rounded bg-blue-500"
		style={isHorizontal
			? 'left: 0; top: -4px; width: 8px; height: 1px;'
			: 'top: 0; left: -4px; width: 1px; height: 8px;'}
	></div>
</div>

<style>
	.guide {
		z-index: 5;
		pointer-events: auto;
	}

	.guide:hover .guide-line {
		background-color: #3b82f6;
		box-shadow: 0 0 3px rgba(59, 130, 246, 0.5);
	}
	.bg-blue-500 {
		background-color: var(--color-blue-500) /* oklch(62.3% 0.214 259.815) */;
	}
</style>
