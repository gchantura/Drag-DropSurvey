<script lang="ts">
	export let enabled: boolean = true;
	export let gridSize: number = 10;
	export let width: number = 800;
	export let height: number = 1100;
</script>

{#if enabled}
	<div class="grid-lines pointer-events-none absolute inset-0">
		<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			{#each Array(Math.ceil(width / gridSize)) as _, i}
				<line
					x1={i * gridSize}
					y1="0"
					x2={i * gridSize}
					y2={height}
					stroke="#e5e7eb"
					stroke-width="1"
				/>
			{/each}
			{#each Array(Math.ceil(height / gridSize)) as _, i}
				<line
					x1="0"
					y1={i * gridSize}
					x2={width}
					y2={i * gridSize}
					stroke="#e5e7eb"
					stroke-width="1"
				/>
			{/each}
		</svg>
	</div>
{/if}
