<!-- src/lib/components/StatusBar.svelte -->
<script lang="ts">
	import type { SurveyComponent } from '$lib/types/survey.ts';

	export let mouseX: number = 0; // Canvas-relative X (pixels)
	export let mouseY: number = 0; // Canvas-relative Y (pixels)
	export let units: 'cm' | 'inches' | 'px' = 'cm';
	export let selectedComponent: SurveyComponent | null = null;
	export let multiSelectedComponentIds: string[] = [];
	export let canvasScale: number = 1;

	// Constants for unit conversion (could be imported from a utils file)
	const DPI = 96;
	const CM_PER_INCH = 2.54;
	const PIXEL_PER_CM = DPI / CM_PER_INCH;
	const PIXEL_PER_INCH = DPI;

	$: unitMultiplier = units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 1;
	$: displayUnits = units === 'px' ? 'px' : units; // Show 'px' correctly

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
</script>

<div
	class="flex flex-wrap items-center justify-between gap-x-4 border-t border-gray-300 bg-gray-100 p-1 px-3 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
>
	<div class="whitespace-nowrap">
		Coord: {mouseX.toFixed(0)}, {mouseY.toFixed(0)} px | {(mouseX / unitMultiplier).toFixed(1)}, {(
			mouseY / unitMultiplier
		).toFixed(1)}
		{displayUnits}
	</div>
	<div class="flex-1 text-center">{statusText}</div>
	<div class="whitespace-nowrap">Zoom: {Math.round(canvasScale * 100)}%</div>
</div>
