<!-- src/lib/components/StatusBar.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';
	import { canvasViewStore, PIXEL_PER_CM, PIXEL_PER_INCH } from '$lib/stores/canvasStore.ts';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ExpandOutline } from 'flowbite-svelte-icons';
	export let mouseX: number = 0;
	export let mouseY: number = 0;
	export let units: 'cm' | 'inches' | 'px' = 'cm';
	export let selectedComponent: SurveyComponent | null = null;
	export let multiSelectedComponentIds: string[] = [];
	export let canvasScale: number = 1;
	const dispatch = createEventDispatcher<{ resetZoom: void }>();
	const zoomPresets = [25, 50, 75, 100, 150, 200, 300, 400];
	$: unitMultiplier = units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 1;
	$: displayUnits = units === 'px' ? 'px' : units;
	$: displayZoomPercent = Math.round(canvasScale * 100);
	$: statusText = (() => {
		if (selectedComponent && multiSelectedComponentIds.length <= 1) {
			const widthPx = selectedComponent.width ?? 0;
			const heightPx = selectedComponent.height ?? 0;
			const widthUnit = (widthPx / unitMultiplier).toFixed(1);
			const heightUnit = (heightPx / unitMultiplier).toFixed(1);
			return `Selected: ${selectedComponent.type} (${widthPx}×${heightPx}px | ${widthUnit}×${heightUnit}${displayUnits})`;
		} else if (multiSelectedComponentIds.length > 1) {
			return `${multiSelectedComponentIds.length} items selected`;
		} else {
			return 'No selection';
		}
	})();
	function handleZoomPreset(presetPercent: number) {
		canvasViewStore.setCanvasScale(presetPercent / 100);
	}
	function handleResetZoom() {
		dispatch('resetZoom');
	}
</script>

<div
	class="relative flex flex-wrap items-center justify-between gap-x-4 border-t border-gray-300 bg-gray-100 p-1 px-3 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
>
	<div class="whitespace-nowrap">
		Coord: {mouseX.toFixed(0)}, {mouseY.toFixed(0)} px | {(mouseX / unitMultiplier).toFixed(1)}, {(
			mouseY / unitMultiplier
		).toFixed(1)}
		{displayUnits}
	</div>
	<div class="flex-1 text-center">{statusText}</div>
	<div class="relative flex items-center gap-1 whitespace-nowrap">
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
