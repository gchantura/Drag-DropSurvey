<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent } from '$lib/types/types.ts';
	import {
		canvasViewStore,
		PIXEL_PER_CM,
		PIXEL_PER_INCH,
		standardSizes,
		type StandardSizeName
	} from '$lib/stores/canvasStore.ts';
	import { get } from 'svelte/store';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ExpandOutline, SortHorizontalOutline } from 'flowbite-svelte-icons';

	// Existing properties using $props()
	const { mouseX, mouseY, units, selectedComponent, multiSelectedComponentIds, canvasScale } =
		$props<{
			mouseX: number;
			mouseY: number;
			units: 'cm' | 'inches' | 'px';
			selectedComponent: SurveyComponent | null;
			multiSelectedComponentIds: string[];
			canvasScale: number;
		}>();

	const dispatch = createEventDispatcher<{ resetZoom: void }>();

	const zoomPresets = [25, 50, 75, 100, 150, 200, 300, 400];

	// Converted reactive statements ($:) to $derived
	const unitMultiplier = $derived(
		units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 1
	);
	const displayUnits = $derived(units === 'px' ? 'px' : units);

	// Correctly display zoom percentage using $derived
	const displayZoomPercent = $derived(Math.round(canvasScale * 100));

	// Fixed status text based on selection state using $derived - removed the arrow function
	const statusText = $derived(
		selectedComponent && multiSelectedComponentIds.length <= 1
			? (() => {
					const widthPx = selectedComponent.width ?? 0;
					const heightPx = selectedComponent.height ?? 0;
					const widthUnit = (widthPx / unitMultiplier).toFixed(1);
					const heightUnit = (heightPx / unitMultiplier).toFixed(1);
					return `Selected: ${selectedComponent.type} (${widthPx}×${heightPx}px | ${widthUnit}×${heightUnit}${displayUnits})`;
				})()
			: multiSelectedComponentIds.length > 1
				? `${multiSelectedComponentIds.length} items selected`
				: 'No selection'
	);

	// New state for canvas size controls
	// Accessing store value with get() is correct here for initial state and inside $effect
	let currentWidth = $state(get(canvasViewStore).width);
	let currentHeight = $state(get(canvasViewStore).height);
	let selectedSizeName = $state<StandardSizeName | 'Custom'>('Custom');

	// Function to determine the standard size name based on dimensions
	function determineSelectedSizeName(width: number, height: number): StandardSizeName | 'Custom' {
		for (const [name, size] of Object.entries(standardSizes)) {
			if (name !== 'Custom' && size.width === width && size.height === height) {
				return name as StandardSizeName;
			}
		}
		return 'Custom';
	}

	// Effect to sync internal state with canvasViewStore changes
	$effect(() => {
		const state = get(canvasViewStore); // Accessing store value here is correct
		currentWidth = state.width;
		currentHeight = state.height;
		selectedSizeName = determineSelectedSizeName(state.width, state.height);
	});

	// Handlers for size changes
	function handleManualSizeChange() {
		const width = Number(currentWidth) || 100;
		const height = Number(currentHeight) || 100;

		if (width >= 100 && height >= 100) {
			canvasViewStore.setCanvasDimensions(width, height);
		} else {
			const state = get(canvasViewStore);
			currentWidth = state.width;
			currentHeight = state.height;
			console.warn('Invalid canvas dimensions entered (must be >= 100px)');
		}
	}

	function handleStandardSizeChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newSizeName = target.value as StandardSizeName | 'Custom';
		selectedSizeName = newSizeName;

		if (newSizeName !== 'Custom') {
			const size = standardSizes[newSizeName];
			if (size) {
				canvasViewStore.setCanvasDimensions(size.width, size.height);
			}
		}
	}

	// Zoom control handlers
	function handleZoomPreset(presetPercent: number) {
		canvasViewStore.setCanvasScale(presetPercent / 100);
	}

	function handleResetZoom() {
		dispatch('resetZoom');
	}
</script>

<div
	class="relative grid grid-cols-12 items-center border-t border-gray-300 bg-gray-100 p-1 px-3 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
>
	<!-- Coordinate Display (Fixed width - takes 3/12 of space) -->
	<div class="col-span-3 flex h-6 items-center truncate whitespace-nowrap">
		Coord: {mouseX.toFixed(0)}, {mouseY.toFixed(0)} px | {(mouseX / unitMultiplier).toFixed(0)}, {(
			mouseY / unitMultiplier
		).toFixed(0)}
		{displayUnits}
	</div>

	<!-- Canvas Size Controls (Fixed width - takes 4/12 of space) -->
	<div
		class="col-span-4 flex h-6 items-center justify-center gap-x-2 text-black dark:text-gray-300"
	>
		<SortHorizontalOutline class="h-3 w-3 flex-shrink-0 dark:text-gray-400" />
		<!-- svelte-ignore event_directive_deprecated -->
		<select
			class="flex-shrink-0 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs hover:bg-gray-50 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400"
			value={selectedSizeName}
			on:change={handleStandardSizeChange}
			aria-label="Select canvas size preset"
		>
			{#each Object.entries(standardSizes) as [name, size]}
				{#if name !== 'Custom'}
					<option value={name}>{name} ({size.width}×{size.height})</option>
				{/if}
			{/each}
			<!-- Explicitly add the Custom option at the end -->
			<option value="Custom">Custom Size</option>
		</select>

		{#if selectedSizeName === 'Custom'}
			<div class="flex flex-shrink-0 items-center gap-0.5">
				<label for="canvas-width" class="text-xs dark:text-gray-300">W:</label>
				<!-- svelte-ignore event_directive_deprecated -->
				<input
					type="number"
					id="canvas-width"
					bind:value={currentWidth}
					on:change={handleManualSizeChange}
					on:blur={handleManualSizeChange}
					min="100"
					class="w-16 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-400 dark:focus:ring-blue-400"
					aria-label="Canvas Width (px)"
				/>
			</div>
			<div class="flex flex-shrink-0 items-center gap-0.5">
				<label for="canvas-height" class="text-xs dark:text-gray-300">H:</label>
				<!-- svelte-ignore event_directive_deprecated -->
				<input
					type="number"
					id="canvas-height"
					bind:value={currentHeight}
					on:change={handleManualSizeChange}
					on:blur={handleManualSizeChange}
					min="100"
					class="w-16 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-400 dark:focus:ring-blue-400"
					aria-label="Canvas Height (px)"
				/>
				<span class="text-xs dark:text-gray-400">px</span>
			</div>
		{:else}
			<div class="text-xs">
				{standardSizes[selectedSizeName].width} × {standardSizes[selectedSizeName].height} px
			</div>
		{/if}
	</div>

	<!-- Middle Status Text (Fixed width - takes 3/12 of space) -->
	<div
		class="col-span-3 flex h-6 items-center justify-center truncate text-center"
		title={statusText}
	>
		{statusText}
	</div>

	<!-- Zoom Controls (Fixed width - takes 2/12 of space) -->
	<div class="col-span-2 flex h-6 items-center justify-end gap-1 whitespace-nowrap">
		<Button size="xs" class="min-w-[50px] !p-1.5 !px-2 text-center">{displayZoomPercent}%</Button>
		<Dropdown class="z-50 text-sm whitespace-nowrap" placement="top-start">
			{#each zoomPresets as preset}
				<DropdownItem on:click={() => handleZoomPreset(preset)}>{preset}%</DropdownItem>
			{/each}
		</Dropdown>
		<Button
			size="xs"
			class="!p-1"
			title="Reset Zoom & Position (Ctrl+0)"
			on:click={handleResetZoom}
		>
			<ExpandOutline class="h-3 w-3" />
		</Button>
	</div>
</div>
