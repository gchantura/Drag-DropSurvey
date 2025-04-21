<!-- src/lib/components/CanvasRuler.svelte -->
<script lang="ts">
	export let direction: 'horizontal' | 'vertical';
	export let scale: number = 1; // Canvas scale
	export let offset: number = 0; // Canvas offset (X or Y)
	export let viewLength: number; // Length of the viewport for the ruler (pixels)
	export let units: 'cm' | 'inches' | 'px';
	export let mousePos: number = 0; // Mouse position relative to the viewport

	// Constants for unit conversion
	const DPI = 96;
	const CM_PER_INCH = 2.54;
	const PIXEL_PER_CM = DPI / CM_PER_INCH;
	const PIXEL_PER_INCH = DPI;

	$: pixelsPerUnit = units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 10; // 10px grid for 'px' unit
	$: labelMultiplier = units === 'px' ? 10 : 1; // Labels every 10px for 'px' unit

	const labelColor = '#374151'; // text-gray-700
	const tickColor = '#6b7280'; // text-gray-500
	const minorTickColor = '#d1d5db'; // text-gray-300
	const indicatorColor = '#3B82F6'; // text-blue-500
	const bgColor = '#f3f4f6'; // bg-gray-100
	const darkLabelColor = '#d1d5db'; // dark:text-gray-300
	const darkTickColor = '#9ca3af'; // dark:text-gray-400
	const darkMinorTickColor = '#4b5563'; // dark:text-gray-600
	const darkBgColor = '#1f2937'; // dark:bg-gray-800

	$: viewStart = -offset / scale; // Where the ruler starts in canvas coords
	$: viewEnd = (-offset + viewLength) / scale;

	$: majorTickSize = pixelsPerUnit * scale;
	$: minorTicksCount = units === 'cm' ? 10 : units === 'inches' ? 8 : 5; // 5 minor ticks for px (every 2px)
	$: minorTickSize = majorTickSize / minorTicksCount;

	$: startUnit = Math.floor(viewStart / pixelsPerUnit);
	$: endUnit = Math.ceil(viewEnd / pixelsPerUnit);

	function formatLabel(unitValue: number): string {
		return `${unitValue * labelMultiplier}`;
	}

	function getTicks() {
		const ticks = [];
		for (let i = startUnit; i <= endUnit; i++) {
			const unitPos = i * pixelsPerUnit;
			const screenPos = unitPos * scale + offset;

			// Major Tick
			ticks.push({
				type: 'major',
				pos: screenPos,
				label: formatLabel(i)
			});

			// Minor Ticks
			if (i < endUnit) {
				for (let j = 1; j < minorTicksCount; j++) {
					const minorPos =
						(i * pixelsPerUnit + j * (pixelsPerUnit / minorTicksCount)) * scale + offset;
					// Only draw if within view bounds (approx)
					if (minorPos > -10 && minorPos < viewLength + 10) {
						ticks.push({ type: 'minor', pos: minorPos });
					}
				}
			}
		}
		return ticks;
	}

	$: indicatorPosition = mousePos; // Already relative to viewport
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
		{...{
			width: direction === 'horizontal' ? '100%' : '32px',
			height: direction === 'vertical' ? '100%' : '32px'
		}}
	>
		<style>
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
				} /* Keep indicator color */
			}
		</style>

		<!-- Special origin marker at 0,0 -->
		{#if direction === 'horizontal' && -offset / scale <= viewEnd && -offset / scale >= viewStart}
			<line
				class="major-tick"
				x1={offset}
				y1="0"
				x2={offset}
				y2="32"
				stroke="#3B82F6"
				stroke-width="1.5"
			/>
		{:else if direction === 'vertical' && -offset / scale <= viewEnd && -offset / scale >= viewStart}
			<line
				class="major-tick"
				x1="0"
				y1={offset}
				x2="32"
				y2={offset}
				stroke="#3B82F6"
				stroke-width="1.5"
			/>
		{/if}

		{#each getTicks() as tick}
			{#if direction === 'horizontal'}
				{#if tick.type === 'major'}
					<line class="major-tick" x1={tick.pos} y1="0" x2={tick.pos} y2="32" />
					{#if tick.label != null}
						<text class="label" x={tick.pos + 3} y="12">
							{tick.label}
						</text>
					{/if}
				{:else if tick.type === 'minor'}
					<line class="minor-tick" x1={tick.pos} y1="16" x2={tick.pos} y2="32" />
				{/if}
			{:else}
				<!-- Vertical -->
				{#if tick.type === 'major'}
					<line class="major-tick" x1="0" y1={tick.pos} x2="32" y2={tick.pos} />
					{#if tick.label != null}
						<text class="label" x="4" y={tick.pos + 10}>
							{tick.label}
						</text>
					{/if}
				{:else if tick.type === 'minor'}
					<line class="minor-tick" x1="16" y1={tick.pos} x2="32" y2={tick.pos} />
				{/if}
			{/if}
		{/each}

		<!-- Mouse position indicator -->
		{#if indicatorPosition >= 0 && (direction === 'horizontal' ? indicatorPosition <= viewLength : indicatorPosition <= viewLength)}
			{#if direction === 'horizontal'}
				<line class="indicator" x1={indicatorPosition} y1="0" x2={indicatorPosition} y2="32" />
			{:else}
				<line class="indicator" x1="0" y1={indicatorPosition} x2="32" y2={indicatorPosition} />
			{/if}
		{/if}
	</svg>
</div>
