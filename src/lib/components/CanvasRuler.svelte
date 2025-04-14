<script lang="ts">
	export let direction: 'horizontal' | 'vertical';
	export let length: number;
	export let units: 'cm' | 'inches' | 'px';
	export let pixelsPerUnit: number;
	export let mouseX = 0;
	export let mouseY = 0;

	const majorTicksEvery = 1; // Every 1 unit

	// Minor ticks vary by unit type
	const minorTicksCount = units === 'cm' ? 10 : units === 'inches' ? 8 : 10;

	// Calculate total number of major ticks
	const totalUnits = Math.ceil(length / pixelsPerUnit);

	function formatLabel(i: number): string {
		return `${i}`;
	}

	$: mousePosition = direction === 'horizontal' ? mouseX : mouseY;
</script>

<div
	class="ruler-container border-gray-300 bg-gray-100 {direction === 'horizontal'
		? 'h-8 w-full border-b'
		: 'h-full w-8 border-r'}"
>
	<svg
		width={direction === 'horizontal' ? length : 32}
		height={direction === 'vertical' ? length : 32}
		xmlns="http://www.w3.org/2000/svg"
	>
		{#if direction === 'horizontal'}
			{#each Array(totalUnits + 1) as _, i}
				<!-- Major ticks -->
				<line
					x1={i * pixelsPerUnit}
					y1="0"
					x2={i * pixelsPerUnit}
					y2="32"
					stroke="#374151"
					stroke-width="1"
				/>
				<!-- Label -->
				<text x={i * pixelsPerUnit + 2} y="12" fill="#374151" font-size="10">
					{formatLabel(i)}
				</text>

				<!-- Minor ticks -->
				{#if i < totalUnits}
					{#each Array(minorTicksCount - 1) as _, j}
						<line
							x1={i * pixelsPerUnit + ((j + 1) * pixelsPerUnit) / minorTicksCount}
							y1="16"
							x2={i * pixelsPerUnit + ((j + 1) * pixelsPerUnit) / minorTicksCount}
							y2="32"
							stroke="#9CA3AF"
							stroke-width="1"
						/>
					{/each}
				{/if}
			{/each}

			<!-- Mouse position indicator -->
			<line
				x1={mousePosition}
				y1="0"
				x2={mousePosition}
				y2="32"
				stroke="#3B82F6"
				stroke-width="1"
				stroke-dasharray="2,2"
			/>
		{:else}
			{#each Array(totalUnits + 1) as _, i}
				<!-- Major ticks -->
				<line
					x1="0"
					y1={i * pixelsPerUnit}
					x2="32"
					y2={i * pixelsPerUnit}
					stroke="#374151"
					stroke-width="1"
				/>
				<!-- Label -->
				<text x="4" y={i * pixelsPerUnit + 12} fill="#374151" font-size="10">
					{formatLabel(i)}
				</text>

				<!-- Minor ticks -->
				{#if i < totalUnits}
					{#each Array(minorTicksCount - 1) as _, j}
						<line
							x1="16"
							y1={i * pixelsPerUnit + ((j + 1) * pixelsPerUnit) / minorTicksCount}
							x2="32"
							y2={i * pixelsPerUnit + ((j + 1) * pixelsPerUnit) / minorTicksCount}
							stroke="#9CA3AF"
							stroke-width="1"
						/>
					{/each}
				{/if}
			{/each}

			<!-- Mouse position indicator -->
			<line
				x1="0"
				y1={mousePosition}
				x2="32"
				y2={mousePosition}
				stroke="#3B82F6"
				stroke-width="1"
				stroke-dasharray="2,2"
			/>
		{/if}
	</svg>
</div>

<style>
	.ruler-container {
		position: relative;
		overflow: hidden;
	}
</style>
