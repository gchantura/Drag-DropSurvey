<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import IconZoomNormal from '$lib/components/icons/grid/zoom/search-normal.svg?raw';
	import IconZoomIn from '$lib/components/icons/grid/zoom/search-zoom-in.svg?raw';
	import IconZoomOut from '$lib/components/icons/grid/zoom/search-zoom-out.svg?raw';
	import IconZoomOption from '$lib/components/icons/grid/zoom/search-options.svg?raw';

	const dispatch = createEventDispatcher<{
		zoomIn: void;
		zoomOut: void;
		resetZoom: void;
	}>();

	let open = false;

	function toggleDropdown() {
		open = !open;
	}

	function sanitizeSvg(svg: string): string {
		return svg.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
	}
</script>

<div class="container-zoom">
	<!-- Main Button -->
	<button
		class="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
		on:click={toggleDropdown}
		title="Zoom Options"
	>
		<span
			class="inline-block h-4 w-4 text-gray-700 dark:text-slate-200 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
		>
			{@html sanitizeSvg(IconZoomOption)}
		</span>
		<span>Zoom</span>
	</button>

	<!-- Dropdown -->
	{#if open}
		<div
			class="absolute right-0 z-10 mt-2 w-48 rounded border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
		>
			<button
				class="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
				on:click={() => {
					dispatch('zoomIn');
					open = false;
				}}
			>
				<span
					class="inline-block h-4 w-4 text-gray-700 dark:text-slate-200 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
				>
					{@html sanitizeSvg(IconZoomIn)}
				</span>
				<span
					class="flex items-center bg-white py-1 text-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>Zoom In</span
				>
			</button>
			<button
				class="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
				on:click={() => {
					dispatch('zoomOut');
					open = false;
				}}
			>
				<span
					class="inline-block h-4 w-4 text-gray-700 dark:text-slate-200 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
				>
					{@html sanitizeSvg(IconZoomOut)}
				</span>
				<span
					class="flex items-center bg-white py-1 text-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>Zoom Out</span
				>
			</button>
			<button
				class="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
				on:click={() => {
					dispatch('resetZoom');
					open = false;
				}}
			>
				<span
					class="inline-block h-4 w-4 text-gray-700 dark:text-slate-200 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
				>
					{@html sanitizeSvg(IconZoomNormal)}
				</span>
				<span
					class="flex items-center bg-white py-1 text-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>Reset 100%</span
				>
			</button>
		</div>
	{/if}
</div>

<style>
	.container-zoom {
		position: relative;
		z-index: 1000;
	}
</style>
