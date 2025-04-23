<!-- src/lib/components/CanvasRuler.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let direction: 'horizontal' | 'vertical';
	export let scale: number = 1;
	export let offset: number = 0;
	export let viewLength: number;
	export let units: 'cm' | 'inches' | 'px';
	export let mousePos: number = 0;
	export let showGuides: boolean = true; // <-- ADD THIS PROP
	export let guides: number[] = []; // <-- ADD THIS PROP

	const dispatch = createEventDispatcher<{
		startGuideMove: { direction: 'horizontal' | 'vertical'; index: number };
		removeGuide: { direction: 'horizontal' | 'vertical'; index: number };
	}>();

	// Constants for unit conversion
	const DPI = 96;
	const CM_PER_INCH = 2.54;
	const PIXEL_PER_CM = DPI / CM_PER_INCH;
	const PIXEL_PER_INCH = DPI;

	// --- Calculations ---
	$: pixelsPerUnit = units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 10;
	$: labelMultiplier = units === 'px' ? 10 : 1;
	$: viewStart = -offset / scale; // Where the ruler starts in canvas coords
	$: viewEnd = (-offset + viewLength) / scale;
	$: majorTickSize = pixelsPerUnit * scale;
	$: minorTicksCount = units === 'cm' ? 10 : units === 'inches' ? 8 : 5;
	$: minorTickSize = majorTickSize / minorTicksCount;
	$: startUnit = Math.floor(viewStart / pixelsPerUnit);
	$: endUnit = Math.ceil(viewEnd / pixelsPerUnit);
	$: indicatorPosition = mousePos; // Already relative to viewport

	$: guidePositions = guides.map((guideValue, index) => ({
		pos: guideValue * scale + offset, // Calculate screen position from canvas value
		index: index,
		value: guideValue // Keep original value if needed
	}));

	function formatLabel(unitValue: number): string {
		// Avoid -0 label
		const displayValue = unitValue === 0 ? 0 : unitValue * labelMultiplier;
		return `${displayValue}`;
	}

	function getTicks() {
		const ticks = [];
		const minTickThreshold = 4; // Minimum pixels between minor ticks to draw them
		const drawMinorTicks = minorTickSize > minTickThreshold;

		for (let i = startUnit; i <= endUnit; i++) {
			const unitPos = i * pixelsPerUnit; // Position in canvas units (pixels)
			const screenPos = unitPos * scale + offset; // Position on screen (ruler)

			// Only render if within reasonable bounds of the view
			if (screenPos >= -50 && screenPos <= viewLength + 50) {
				// Major Tick
				ticks.push({
					type: 'major',
					pos: screenPos,
					label: formatLabel(i)
				});

				// Minor Ticks (only if visible and spaced enough)
				if (drawMinorTicks && i < endUnit) {
					for (let j = 1; j < minorTicksCount; j++) {
						const minorUnitPos = unitPos + j * (pixelsPerUnit / minorTicksCount);
						const minorScreenPos = minorUnitPos * scale + offset;
						// Only draw if within view bounds (approx)
						if (minorScreenPos > -10 && minorScreenPos < viewLength + 10) {
							ticks.push({ type: 'minor', pos: minorScreenPos });
						}
					}
				}
			}
		}
		return ticks;
	}

	// --- Guide Interaction Handlers ---
	function handleGuideMouseDown(index: number, event: MouseEvent) {
		if (event.button === 0) {
			// Left click starts move
			dispatch('startGuideMove', { direction, index });
			event.stopPropagation(); // Prevent other actions like canvas pan
		}
	}

	function handleGuideDoubleClick(index: number, event: MouseEvent) {
		dispatch('removeGuide', { direction, index });
		event.stopPropagation();
	}

	function handleGuideContextMenu(event: MouseEvent) {
		// Allow context menu to bubble up to the main canvas handler
		// The main context menu can check event.target to see if it was a guide
		// event.preventDefault(); // Optional: Prevent default browser menu on guide
		// event.stopPropagation();
	}
</script>

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
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="absolute top-0 left-0"
		style="pointer-events: none;"
		width={direction === 'horizontal' ? '100%' : '32px'}
		height={direction === 'vertical' ? '100%' : '32px'}
	>
		<style>
			/* Styles identical to previous example */
			.label {
				fill: #374151;
				font-size: 10px;
			}
			.major-tick {
				stroke: #6b7280;
				stroke-width: 1;
			}
			.minor-tick {
				stroke: #d1d5db;
				stroke-width: 0.5;
			}
			.indicator {
				stroke: #3b82f6;
				stroke-width: 1;
				stroke-dasharray: 2, 2;
			}
			.guide-line {
				stroke: #007acc;
				stroke-width: 1;
				cursor: grab;
				pointer-events: all;
			} /* Make guides interactive */
			.guide-line:active {
				cursor: grabbing;
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
				.guide-line {
					stroke: #3b82f6;
				}
			}
		</style>

		<!-- Ruler Ticks -->
		{#each getTicks() as tick}
			{#if direction === 'horizontal'}
				{#if tick.type === 'major'}
					<line class="major-tick" x1={tick.pos} y1="16" x2={tick.pos} y2="32" />
					<!-- Adjusted length -->
					{#if tick.label != null}
						<text class="label" x={tick.pos + 3} y="12">{tick.label}</text>
					{/if}
				{:else if tick.type === 'minor'}
					<line class="minor-tick" x1={tick.pos} y1="24" x2={tick.pos} y2="32" />
					<!-- Adjusted length -->
				{/if}
			{:else}
				<!-- Vertical -->
				{#if tick.type === 'major'}
					<line class="major-tick" x1="16" y1={tick.pos} x2="32" y2={tick.pos} />
					<!-- Adjusted length -->
					{#if tick.label != null}
						<!-- Slightly adjusted position for vertical label -->
						<text class="label" x="4" y={tick.pos + 4} dominant-baseline="hanging"
							>{tick.label}</text
						>
					{/if}
				{:else if tick.type === 'minor'}
					<line class="minor-tick" x1="24" y1={tick.pos} x2="32" y2={tick.pos} />
					<!-- Adjusted length -->
				{/if}
			{/if}
		{/each}

		<!-- Guides -->
		{#if showGuides}
			{#each guidePositions as guide (guide.index)}
				{#if guide.pos >= 0 && guide.pos <= viewLength}
					<!-- Only render if guide is visible -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					{#if direction === 'horizontal'}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<line
							class="guide-line"
							x1={guide.pos}
							y1="0"
							x2={guide.pos}
							y2="32"
							data-direction="vertical"
							data-index={guide.index}
							on:mousedown|stopPropagation={(e) => handleGuideMouseDown(guide.index, e)}
							on:dblclick|stopPropagation={(e) => handleGuideDoubleClick(guide.index, e)}
							on:contextmenu={handleGuideContextMenu}
						/>
					{:else}
						<line
							class="guide-line"
							x1="0"
							y1={guide.pos}
							x2="32"
							y2={guide.pos}
							data-direction="horizontal"
							data-index={guide.index}
							on:mousedown|stopPropagation={(e) => handleGuideMouseDown(guide.index, e)}
							on:dblclick|stopPropagation={(e) => handleGuideDoubleClick(guide.index, e)}
							on:contextmenu={handleGuideContextMenu}
						/>
					{/if}
				{/if}
			{/each}
		{/if}

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
