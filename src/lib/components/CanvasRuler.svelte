<script lang="ts">
	export let direction: 'horizontal' | 'vertical';
	export let length: number;
	export let units: 'cm' | 'inches' | 'px';
	export let pixelsPerUnit: number;
	export let mouseX = 0;
	export let mouseY = 0;

	const majorTicksEvery = 1;
	const minorTicksCount = units === 'cm' ? 10 : units === 'inches' ? 8 : 10;
	const totalUnits = Math.ceil(length / pixelsPerUnit);

	const labelColor = '#374151';
	const tickColor = '#374151';
	const minorTickColor = '#9CA3AF';
	const indicatorColor = '#3B82F6';

	function formatLabel(i: number): string {
		return `${i}`;
	}

	$: mousePosition = direction === 'horizontal' ? mouseX : mouseY;
</script>

<div
	class="ruler-container border-gray-300 bg-gray-100"
	class:border-b={direction === 'horizontal'}
	class:h-8={direction === 'horizontal'}
	class:w-full={direction === 'horizontal'}
	class:border-r={direction === 'vertical'}
	class:w-8={direction === 'vertical'}
	class:h-full={direction === 'vertical'}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		{...{
			width: direction === 'horizontal' ? length : 32,
			height: direction === 'vertical' ? length : 32
		}}
		viewBox={`0 0 ${direction === 'horizontal' ? length : 32} ${direction === 'horizontal' ? 32 : length}`}
		aria-hidden="true"
		pointer-events="none"
	>
		{#each Array(totalUnits + 1) as _, i}
			<!-- Major ticks -->
			{#if direction === 'horizontal'}
				<line
					x1={i * pixelsPerUnit}
					y1="0"
					x2={i * pixelsPerUnit}
					y2="32"
					stroke={tickColor}
					stroke-width="1"
				/>
				<text x={i * pixelsPerUnit + 2} y="12" fill={labelColor} font-size="10">
					{formatLabel(i)}
				</text>
			{:else}
				<line
					x1="0"
					y1={i * pixelsPerUnit}
					x2="32"
					y2={i * pixelsPerUnit}
					stroke={tickColor}
					stroke-width="1"
				/>
				<text x="4" y={i * pixelsPerUnit + 10} fill={labelColor} font-size="10">
					{formatLabel(i)}
				</text>
			{/if}

			<!-- Minor ticks -->
			{#if i < totalUnits}
				{#each Array(minorTicksCount - 1) as _, j}
					{#if direction === 'horizontal'}
						<line
							x1={i * pixelsPerUnit + ((j + 1) * pixelsPerUnit) / minorTicksCount}
							y1="16"
							x2={i * pixelsPerUnit + ((j + 1) * pixelsPerUnit) / minorTicksCount}
							y2="32"
							stroke={minorTickColor}
							stroke-width="1"
						/>
					{:else}
						<line
							x1="16"
							y1={i * pixelsPerUnit + ((j + 1) * pixelsPerUnit) / minorTicksCount}
							x2="32"
							y2={i * pixelsPerUnit + ((j + 1) * pixelsPerUnit) / minorTicksCount}
							stroke={minorTickColor}
							stroke-width="1"
						/>
					{/if}
				{/each}
			{/if}
		{/each}

		<!-- Mouse position indicator -->
		{#if direction === 'horizontal'}
			<line
				x1={mousePosition}
				y1="0"
				x2={mousePosition}
				y2="32"
				stroke={indicatorColor}
				stroke-width="1"
				stroke-dasharray="2,2"
			/>
		{:else}
			<line
				x1="0"
				y1={mousePosition}
				x2="32"
				y2={mousePosition}
				stroke={indicatorColor}
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
		user-select: none;
	}
</style>
