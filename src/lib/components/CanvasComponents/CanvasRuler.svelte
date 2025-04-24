<!-- src/lib/components/CanvasComponents/CanvasRuler.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let direction: 'horizontal' | 'vertical';
	export let scale: number = 1;
	export let offset: number = 0;
	export let viewLength: number;
	export let units: 'cm' | 'inches' | 'px';
	export let mousePos: number = 0; // Relative to viewport edge
	// Removed showGuides/guides props as they are not directly used for drawing here
	// Guide interaction (creation) is handled by dblclick

	const dispatch = createEventDispatcher<{
		// Changed events slightly for clarity
		addGuide: { direction: 'horizontal' | 'vertical'; position: number }; // Position is in CANVAS coords
		// Keeping these for potential future use if guides were rendered ON the ruler
		// startGuideMove: { direction: 'horizontal' | 'vertical'; index: number };
		// removeGuide: { direction: 'horizontal' | 'vertical'; index: number };
	}>();

	// Constants for unit conversion
	const DPI = 96;
	const CM_PER_INCH = 2.54;
	const PIXEL_PER_CM = DPI / CM_PER_INCH;
	const PIXEL_PER_INCH = DPI;

	// --- Calculations ---
	let majorTickCanvasInterval = 100; // Default, will be calculated reactively
	let minorTicksCount = 10;
	let labelMultiplier = 1;

	// Function to find "nice" intervals for px rulers
	function findNicePixelInterval(targetScreenSpacing: number, currentScale: number): number {
		const desiredCanvasSpacing = targetScreenSpacing / currentScale;
		const intervals = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000];
		let bestInterval = intervals[intervals.length - 1];
		let minDiff = Infinity;

		for (const interval of intervals) {
			const diff = Math.abs(interval - desiredCanvasSpacing);
			if (diff < minDiff) {
				minDiff = diff;
				bestInterval = interval;
			}
			// Optimization: if interval is already much larger than desired, stop checking larger ones
			if (interval > desiredCanvasSpacing * 2 && interval > 20) {
				break;
			}
		}
		// Ensure minimum interval to prevent excessive ticks at high zoom
		return Math.max(1, bestInterval);
	}

	// Reactive calculation of tick properties based on units and scale
	$: {
		const MIN_PX_MAJOR_TICK_SCREEN_SPACING = 50; // Min screen pixels between major ticks

		if (units === 'px') {
			majorTickCanvasInterval = findNicePixelInterval(MIN_PX_MAJOR_TICK_SCREEN_SPACING, scale);
			minorTicksCount =
				majorTickCanvasInterval === 1 || majorTickCanvasInterval % 10 === 0
					? 10
					: majorTickCanvasInterval % 5 === 0
						? 5
						: majorTickCanvasInterval % 2 === 0
							? 2
							: 1;
			if (majorTickCanvasInterval === 1 && scale > 10) minorTicksCount = 0; // Hide minor if major is every pixel and zoomed in
			labelMultiplier = 1; // Labels show actual pixel values
		} else if (units === 'cm') {
			majorTickCanvasInterval = PIXEL_PER_CM;
			minorTicksCount = 10;
			labelMultiplier = 1;
		} else {
			// inches
			majorTickCanvasInterval = PIXEL_PER_INCH;
			minorTicksCount = 8; // Often 8 or 16 for inches
			labelMultiplier = 1;
		}
	}

	$: viewStart = -offset / scale; // Where the ruler starts in canvas coords
	$: viewEnd = (-offset + viewLength) / scale; // Where the ruler ends in canvas coords
	$: indicatorPosition = mousePos; // Already relative to viewport edge

	function formatLabel(canvasValue: number): string {
		// Avoid -0 label
		const rawDisplayValue = canvasValue === 0 ? 0 : canvasValue * labelMultiplier;
		// Round the displayed value to the nearest integer for all units for major ticks
		const displayValue = Math.round(rawDisplayValue);
		return `${displayValue}`;
	}

	function getTicks() {
		const ticks = [];
		const minTickThreshold = 4; // Minimum screen pixels between minor ticks to draw them
		const majorTickScreenSize = majorTickCanvasInterval * scale;
		const minorTickScreenSize = minorTicksCount > 0 ? majorTickScreenSize / minorTicksCount : 0;
		const drawMinorTicks = minorTickScreenSize > minTickThreshold && minorTicksCount > 0;

		// Calculate start and end values for the loop based on the major interval
		const startValue = Math.floor(viewStart / majorTickCanvasInterval) * majorTickCanvasInterval;
		const endValue = Math.ceil(viewEnd / majorTickCanvasInterval) * majorTickCanvasInterval;

		// Limit iteration count to prevent performance issues at extreme zooms/pans
		const maxIterations = 1000;
		let iterations = 0;

		for (
			let value = startValue;
			value <= endValue && iterations < maxIterations;
			value += majorTickCanvasInterval
		) {
			iterations++;
			const screenPos = value * scale + offset; // Position on screen (ruler)

			// Only render if within reasonable bounds of the view
			if (screenPos >= -majorTickScreenSize && screenPos <= viewLength + majorTickScreenSize) {
				// Major Tick
				ticks.push({
					type: 'major',
					pos: screenPos,
					label: formatLabel(value)
				});

				// Minor Ticks
				if (drawMinorTicks && iterations < maxIterations) {
					// Check iteration count again
					const minorCanvasInterval = majorTickCanvasInterval / minorTicksCount;
					for (let j = 1; j < minorTicksCount; j++) {
						const minorValue = value + j * minorCanvasInterval;
						const minorScreenPos = minorValue * scale + offset;
						// Only draw if within view bounds (approx) and check iterations
						if (
							minorScreenPos > -10 &&
							minorScreenPos < viewLength + 10 &&
							iterations < maxIterations
						) {
							ticks.push({ type: 'minor', pos: minorScreenPos });
						} else if (minorScreenPos >= viewLength + 10) {
							// Optimization: if minor ticks go off screen, stop drawing them for this major tick
							break;
						}
						iterations++; // Increment even if not drawn? Maybe not needed here.
					}
				}
			} else if (screenPos > viewLength + majorTickScreenSize && value > viewStart) {
				// Optimization: if major ticks go off screen, stop iterating further
				break;
			}
		}
		// console.log("Ticks:", ticks.length, " Iterations:", iterations); // For debugging
		return ticks;
	}

	// --- Guide Creation Handler ---
	function handleDoubleClick(event: MouseEvent) {
		let clickPos: number;
		if (direction === 'horizontal') {
			// event.offsetX is relative to the padding edge of the target element (the div)
			clickPos = event.offsetX;
		} else {
			clickPos = event.offsetY;
		}

		// Convert screen position (relative to ruler) to canvas coordinate
		const canvasPosition = (clickPos - offset) / scale;

		dispatch('addGuide', { direction, position: canvasPosition });
		event.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="ruler-container relative overflow-hidden bg-gray-100 select-none dark:bg-gray-800"
	class:border-b={direction === 'horizontal'}
	class:border-gray-300={true}
	class:dark:border-gray-700={true}
	class:h-8={direction === 'horizontal'}
	class:w-full={direction === 'horizontal'}
	class:border-r={direction === 'vertical'}
	class:w-8={direction === 'vertical'}
	class:h-full={direction === 'vertical'}
	on:dblclick={handleDoubleClick}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="absolute top-0 left-0"
		style="pointer-events: none;"
		width={direction === 'horizontal' ? '100%' : '32px'}
		height={direction === 'vertical' ? '100%' : '32px'}
	>
		<!-- Ruler Ticks -->
		{#each getTicks() as tick}
			{#if direction === 'horizontal'}
				{#if tick.type === 'major'}
					<line class="major-tick" x1={tick.pos} y1="16" x2={tick.pos} y2="32" />
					{#if tick.label != null}
						<text class="label" x={tick.pos + 3} y="12">{tick.label}</text>
					{/if}
				{:else if tick.type === 'minor'}
					<line class="minor-tick" x1={tick.pos} y1="24" x2={tick.pos} y2="32" />
				{/if}
			{:else if tick.type === 'major'}
				<line class="major-tick" x1="16" y1={tick.pos} x2="32" y2={tick.pos} />
				{#if tick.label != null}
					<text class="label" x="4" y={tick.pos + 4} dominant-baseline="hanging">{tick.label}</text>
				{/if}
			{:else if tick.type === 'minor'}
				<line class="minor-tick" x1="24" y1={tick.pos} x2="32" y2={tick.pos} />
			{/if}
		{/each}

		<!-- Mouse position indicator -->
		{#if indicatorPosition >= 0 && indicatorPosition <= viewLength}
			{#if direction === 'horizontal'}
				<line class="indicator" x1={indicatorPosition} y1="0" x2={indicatorPosition} y2="32" />
			{:else}
				<line class="indicator" x1="0" y1={indicatorPosition} x2="32" y2={indicatorPosition} />
			{/if}
		{/if}
	</svg>
</div>

<style>
	/* Styles are unchanged, ensure they match your previous setup */
	.label {
		fill: #374151;
		font-size: 10px;
		pointer-events: none;
	}
	.major-tick {
		stroke: #6b7280;
		stroke-width: 1;
		pointer-events: none;
	}
	.minor-tick {
		stroke: #d1d5db;
		stroke-width: 0.5;
		pointer-events: none;
	}
	.indicator {
		stroke: #3b82f6;
		stroke-width: 1;
		stroke-dasharray: 2, 2;
		pointer-events: none;
	}

	@media (prefers-color-scheme: dark) {
		.label {
			fill: #d1d5db;
		}
		.major-tick {
			stroke: #9ca3af;
		}
		.minor-tick {
			stroke: #4b5563;
		}
		.indicator {
			stroke: #3b82f6;
		}
	}
</style>
