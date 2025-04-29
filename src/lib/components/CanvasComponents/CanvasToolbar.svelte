<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const { units, enableSnap, showGuides } = $props<{
		units: 'cm' | 'inches' | 'px';
		enableSnap: boolean;
		showGuides: boolean;
	}>();

	const dispatch = createEventDispatcher<{
		toggleUnits: void;
		toggleSnap: void;
		toggleGuides: void;
	}>();
</script>

<div
	class="flex flex-wrap items-center justify-between gap-y-2 border-b border-gray-300 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800"
>
	<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			onclick={() => dispatch('toggleUnits')}
			title="Toggle measurement units"
		>
			Units: {units}
		</button>
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			onclick={() => dispatch('toggleSnap')}
			title="Toggle snapping to grid and guides (Ctrl+G)"
		>
			{enableSnap ? '⊙ Snap On' : '○ Snap Off'}
		</button>
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			onclick={() => dispatch('toggleGuides')}
			title="Toggle visibility of guides"
		>
			{showGuides ? '⊣⊢ Guides On' : '―― Guides Off'}
		</button>
	</div>
	<!-- Removed canvas size controls div -->
	<!--
	<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
		... size controls ...
	</div>
	-->
</div>
