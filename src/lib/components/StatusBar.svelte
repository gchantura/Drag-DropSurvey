<script lang="ts">
	import type { SurveyComponent } from '$lib/types/survey.ts';

	export let mouseX: number = 0;
	export let mouseY: number = 0;
	export let units: 'cm' | 'inches' | 'px' = 'cm';
	export let selectedComponent: SurveyComponent | null = null;
	export let multiSelectedComponents: string[] = [];
	export let canvasScale: number = 1;

	// Constants for unit conversion
	const DPI = 96; // Standard screen DPI
	const CM_PER_INCH = 2.54;
	const PIXEL_PER_CM = DPI / CM_PER_INCH;
	const PIXEL_PER_INCH = DPI;

	$: unitMultiplier = units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 1;
</script>

<div class="flex items-center justify-between border-t border-gray-300 bg-gray-100 p-1 text-xs">
	<div>
		{mouseX.toFixed(0)}px, {mouseY.toFixed(0)}px |
		{(mouseX / unitMultiplier).toFixed(2)}{units}
	</div>
	<div>
		{#if selectedComponent}
			Selected: {selectedComponent.type} ({selectedComponent.width} × {selectedComponent.height}px)
		{:else if multiSelectedComponents.length > 1}
			{multiSelectedComponents.length} items selected
		{:else}
			No selection
		{/if}
	</div>
	<div>Zoom: {Math.round(canvasScale * 100)}%</div>
</div>
