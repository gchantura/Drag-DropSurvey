<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import IconGrid from '$lib/components/icons/grid/grid/grid.svg?raw';

	const dispatch = createEventDispatcher<{
		autoPosition: void;
	}>();
</script>

<button
	class="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
	on:click={() => dispatch('autoPosition')}
	title="Automatically arrange components (Grid)"
>
	<span class="inline-block h-4 w-4 [&>svg]:h-full [&>svg]:w-full">
		{@html IconGrid}
	</span>
	<span>Grid</span>
</button>
