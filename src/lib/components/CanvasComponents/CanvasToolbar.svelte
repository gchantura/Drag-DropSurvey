<!-- src/lib/components/CanvasComponents/CanvasToolbar.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		canvasViewStore,
		standardSizes,
		type StandardSizeName
	} from '$lib/stores/canvasStore.ts';
	import { get } from 'svelte/store';
	const { units, enableSnap, showGuides } = $props<{
		units: 'cm' | 'inches' | 'px';
		enableSnap: boolean;
		showGuides: boolean;
	}>();
	let currentWidth = $state(get(canvasViewStore).width);
	let currentHeight = $state(get(canvasViewStore).height);
	let selectedSizeName = $state<StandardSizeName | 'Custom'>('Custom');
	const dispatch = createEventDispatcher<{
		toggleUnits: void;
		toggleSnap: void;
		toggleGuides: void;
		updateCanvasSize: { width: number; height: number };
	}>();
	function determineSelectedSizeName(width: number, height: number): StandardSizeName | 'Custom' {
		for (const [name, size] of Object.entries(standardSizes)) {
			if (name !== 'Custom' && size.width === width && size.height === height) {
				return name as StandardSizeName;
			}
		}
		return 'Custom';
	}
	$effect(() => {
		const state = get(canvasViewStore);
		currentWidth = state.width;
		currentHeight = state.height;
		selectedSizeName = determineSelectedSizeName(state.width, state.height);
	});
	function handleManualSizeChange() {
		const width = Number(currentWidth) || 100;
		const height = Number(currentHeight) || 100;
		dispatch('updateCanvasSize', { width, height });
	}
	function handleStandardSizeChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newSizeName = target.value as StandardSizeName | 'Custom';
		selectedSizeName = newSizeName;
		if (newSizeName !== 'Custom') {
			const size = standardSizes[newSizeName];
			if (size) {
				dispatch('updateCanvasSize', { width: size.width, height: size.height });
			}
		}
	}
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
	<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
		<select
			class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400"
			value={selectedSizeName}
			onchange={handleStandardSizeChange}
			aria-label="Select canvas size preset"
		>
			{#each Object.entries(standardSizes) as [name, size]}
				{#if name !== 'Custom'}
					<option value={name}>{name} ({size.width}×{size.height})</option>
				{/if}
			{/each} <option value="Custom">Custom Size</option>
		</select>
		<div class="flex items-center gap-1">
			<label for="canvas-width" class="text-sm dark:text-gray-300">W:</label>
			<input
				type="number"
				id="canvas-width"
				bind:value={currentWidth}
				onchange={handleManualSizeChange}
				onblur={handleManualSizeChange}
				min="100"
				class="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-600"
				aria-label="Canvas Width (px)"
				disabled={selectedSizeName !== 'Custom'}
			/>
		</div>
		<div class="flex items-center gap-1">
			<label for="canvas-height" class="text-sm dark:text-gray-300">H:</label>
			<input
				type="number"
				id="canvas-height"
				bind:value={currentHeight}
				onchange={handleManualSizeChange}
				onblur={handleManualSizeChange}
				min="100"
				class="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-600"
				aria-label="Canvas Height (px)"
				disabled={selectedSizeName !== 'Custom'}
			/> <span class="text-sm dark:text-gray-400">px</span>
		</div>
	</div>
</div>
