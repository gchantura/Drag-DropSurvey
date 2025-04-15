<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let direction: 'horizontal' | 'vertical';
	export let position: number;
	export let index: number;

	const dispatch = createEventDispatcher();

	function startDrag(event: MouseEvent) {
		dispatch('startMove', { direction, index });
		event.preventDefault();
	}

	function handleContextMenu(event: MouseEvent) {
		dispatch('remove');
		event.preventDefault();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="guide absolute {direction === 'horizontal' ? 'w-full' : 'h-full'} cursor-move"
	style="{direction === 'horizontal' ? 'top' : 'left'}: {position}px;"
	on:mousedown={startDrag}
	on:contextmenu={handleContextMenu}
	title="Right-click to remove guide"
>
	<div
		class="guide-line {direction === 'horizontal' ? 'h-px w-full' : 'h-full w-px'} bg-blue-500"
	></div>

	<!-- Handle -->
	<div
		class="handle absolute rounded bg-blue-500"
		style="{direction === 'horizontal'
			? 'left: 0; top'
			: 'top: 0; left'}: -4px; width: {direction === 'horizontal'
			? '8px'
			: '1px'}; height: {direction === 'horizontal' ? '1px' : '8px'};"
	></div>
</div>

<style>
	.guide {
		z-index: 5;
		pointer-events: auto; /* Allow interactions */
	}

	.guide:hover .guide-line {
		background-color: #3b82f6; /* blue-500 */
		box-shadow: 0 0 3px rgba(59, 130, 246, 0.5);
	}
</style>
