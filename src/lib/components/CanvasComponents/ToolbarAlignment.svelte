<!-- src/lib/components/CanvasComponents/ToolbarAlignment.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
	type Distribution = 'horizontal' | 'vertical';

	const dispatch = createEventDispatcher<{
		align: Alignment;
		distribute: Distribution;
	}>();

	// Using static SVG content for alignment icons
	const AlignLeft = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="4" x2="5" y2="20"></line><rect x="7" y="8" width="10" height="4"></rect><rect x="7" y="16" width="14" height="4"></rect></svg>`;
	const AlignVertically = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="4" x2="12" y2="20"></line><rect x="6" y="8" width="12" height="4"></rect><rect x="4" y="16" width="16" height="4"></rect></svg>`;
	const AlignRight = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="19" y2="20"></line><rect x="7" y="8" width="10" height="4"></rect><rect x="3" y="16" width="14" height="4"></rect></svg>`;
	const AlignTop = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="5" x2="20" y2="5"></line><rect x="8" y="7" width="4" height="10"></rect><rect x="16" y="7" width="4" height="14"></rect></svg>`;
	const AlignHorizontally = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><rect x="8" y="6" width="4" height="12"></rect><rect x="16" y="4" width="4" height="16"></rect></svg>`;
	const AlignBottom = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="19" x2="20" y2="19"></line><rect x="8" y="7" width="4" height="10"></rect><rect x="16" y="3" width="4" height="14"></rect></svg>`;
	// Distribution Icons (using text symbols)
	const DistributeHorizontally = `<span>⬌</span>`; // Left Right Arrow
	const DistributeVertically = `<span>⇳</span>`; // Up Down Arrow With Base

	const alignmentButtons: { icon: string; value: Alignment; title: string }[] = [
		{ icon: AlignLeft, value: 'left', title: 'Align Left' },
		{ icon: AlignVertically, value: 'center', title: 'Align Center Vertically' }, // Corrected title
		{ icon: AlignRight, value: 'right', title: 'Align Right' },
		{ icon: AlignTop, value: 'top', title: 'Align Top' },
		{ icon: AlignHorizontally, value: 'middle', title: 'Align Middle Horizontally' }, // Corrected title
		{ icon: AlignBottom, value: 'bottom', title: 'Align Bottom' }
	];

	const distributionButtons: { icon: string; value: Distribution; title: string }[] = [
		{ icon: DistributeHorizontally, value: 'horizontal', title: 'Distribute Horizontally' },
		{ icon: DistributeVertically, value: 'vertical', title: 'Distribute Vertically' }
	];
</script>

<div
	class="flex items-center justify-center gap-x-6 border-b border-gray-300 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800"
>
	<!-- Alignment Section -->
	<div class="flex items-center gap-1">
		<span class="mr-1 text-sm text-gray-700 dark:text-gray-300">Align:</span>
		{#each alignmentButtons as btn}
			<button
				class="rounded border border-gray-300 bg-white p-1.5 text-sm hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				on:click={() => dispatch('align', btn.value)}
				title={btn.title}
			>
				<span
					class="inline-block h-4 w-4 text-gray-700 dark:text-slate-200 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-[1.5]"
				>
					{@html btn.icon}
				</span>
			</button>
		{/each}
	</div>

	<!-- Distribution Section -->
	<div class="flex items-center gap-1">
		<span class="mr-1 text-sm text-gray-700 dark:text-gray-300">Distribute:</span>
		{#each distributionButtons as btn}
			<button
				class="rounded border border-gray-300 bg-white p-1.5 text-sm hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				on:click={() => dispatch('distribute', btn.value)}
				title={btn.title}
			>
				<span
					class="inline-flex h-4 w-4 items-center justify-center text-lg font-semibold text-gray-700 dark:text-slate-200"
				>
					{@html btn.icon}
				</span>
			</button>
		{/each}
	</div>
</div>
