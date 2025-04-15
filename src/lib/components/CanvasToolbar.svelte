<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let units: 'cm' | 'inches' | 'px';
	export let enableSnap: boolean;
	export let showGuides: boolean;
	export let pageFormat: string;
	export let canvasScale: number;

	const dispatch = createEventDispatcher<{
		toggleUnits: void;
		toggleSnap: void;
		toggleGuides: void;
		changePageFormat: { format: string };
		resetView: void;
		autoPosition: void;
	}>();

	function handlePageFormatChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		dispatch('changePageFormat', { format: select.value });
	}
</script>

<div class="flex items-center justify-between border-b border-gray-300 bg-gray-100 p-2">
	<div class="flex space-x-2">
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
			on:click={() => dispatch('toggleUnits')}
		>
			Units: {units}
		</button>
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
			on:click={() => dispatch('toggleSnap')}
		>
			{enableSnap ? '⊙ Snap On' : '○ Snap Off'}
		</button>
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
			on:click={() => dispatch('toggleGuides')}
		>
			{showGuides ? '⊣⊢ Guides On' : '―― Guides Off'}
		</button>
		<select
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
			value={pageFormat}
			on:change={handlePageFormatChange}
		>
			<option value="A4">A4</option>
			<option value="Letter">Letter</option>
			<option value="Custom">Custom</option>
		</select>
	</div>

	<div class="flex space-x-2">
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
			on:click={() => dispatch('resetView')}
		>
			Reset View (Zoom: {Math.round(canvasScale * 100)}%)
		</button>
		<button
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
			on:click={() => dispatch('autoPosition')}
		>
			Auto Position
		</button>
	</div>
</div>
