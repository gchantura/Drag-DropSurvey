<!-- src/lib/components/CanvasToolbar.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import CanvasZoomToolbar from '$lib/components/CanvasComponents/CanvasZoom/CanvasZoomToolbar.svelte';
	import CanvasGrid from '$lib/components/CanvasComponents/CanvasGrid/CanvasGrid.svelte'; // Assuming this exists or remove if not used

	export let units: 'cm' | 'inches' | 'px';
	export let enableSnap: boolean;
	export let showGuides: boolean;
	export let pageFormat: string;

	const dispatch = createEventDispatcher<{
		toggleUnits: void;
		toggleSnap: void;
		toggleGuides: void;
		updatePageFormat: string;
		resetZoom: void;
		zoomIn: void;
		zoomOut: void;
		autoPosition: void;
	}>();

	function handlePageFormatChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('updatePageFormat', target.value);
	}
</script>

<div
	class="flex items-center justify-between border-b border-gray-300 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800"
>
	<div class="flex flex-wrap items-center gap-2">
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			on:click={() => dispatch('toggleUnits')}
			title="Toggle measurement units"
		>
			Units: {units}
		</button>
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			on:click={() => dispatch('toggleSnap')}
			title="Toggle snapping to grid and guides (Ctrl+G)"
		>
			{enableSnap ? '⊙ Snap On' : '○ Snap Off'}
		</button>
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			on:click={() => dispatch('toggleGuides')}
			title="Toggle visibility of guides"
		>
			{showGuides ? '⊣⊢ Guides On' : '―― Guides Off'}
		</button>
		<select
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			value={pageFormat}
			on:change={handlePageFormatChange}
			aria-label="Select page format"
		>
			<option value="A4">A4</option>
			<option value="Letter">Letter</option>
			<option value="Custom">Custom</option>
		</select>
		<!-- Removed canvasScale display as it's better handled in StatusBar or ZoomToolbar -->
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<CanvasZoomToolbar
			on:resetZoom={() => dispatch('resetZoom')}
			on:zoomIn={() => dispatch('zoomIn')}
			on:zoomOut={() => dispatch('zoomOut')}
		/>
		<CanvasGrid on:autoPosition={() => dispatch('autoPosition')} />
	</div>
</div>
