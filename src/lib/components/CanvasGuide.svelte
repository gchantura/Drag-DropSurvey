<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let direction: 'horizontal' | 'vertical';
	export let position: number;
	export let index: number;

	const dispatch = createEventDispatcher();

	function handleMouseDown(e: MouseEvent) {
		if (e.button === 0) {
			// Left click
			dispatch('startMove', { direction, index });
			e.preventDefault();
		}
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
		dispatch('remove', { direction, index });
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="guide absolute {direction === 'horizontal'
		? 'h-px w-full bg-blue-500'
		: 'h-full w-px bg-blue-500'} cursor-move"
	style="{direction === 'horizontal' ? 'top' : 'left'}: {position}px;"
	on:mousedown={handleMouseDown}
	on:contextmenu={handleContextMenu}
>
	<div
		class="{direction === 'horizontal'
			? 'absolute -top-3 left-0 h-6 w-6'
			: 'absolute top-0 -left-3 h-6 w-6'} flex items-center justify-center"
	>
		<div class="h-3 w-3 rounded-full bg-blue-500"></div>
	</div>
</div>

<style>
	.guide {
		pointer-events: all;
		opacity: 0.7;
		z-index: 5;
	}

	.guide:hover {
		opacity: 1;
	}
</style>
