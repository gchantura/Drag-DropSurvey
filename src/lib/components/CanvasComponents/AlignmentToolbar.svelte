<!-- src/lib/components/AlignmentToolbar.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
	type Distribution = 'horizontal' | 'vertical';

	const dispatch = createEventDispatcher<{
		align: Alignment;
		distribute: Distribution;
	}>();

	const alignmentButtons: { label: string; value: Alignment; title: string }[] = [
		{ label: '⫷', value: 'left', title: 'Align Left' },
		{ label: '⋮', value: 'center', title: 'Align Center Horizontally' },
		{ label: '⫸', value: 'right', title: 'Align Right' },
		{ label: '⫯', value: 'top', title: 'Align Top' },
		{ label: '―', value: 'middle', title: 'Align Middle Vertically' },
		{ label: '⫰', value: 'bottom', title: 'Align Bottom' }
	];

	const distributionButtons: { label: string; value: Distribution; title: string }[] = [
		{ label: '⬌', value: 'horizontal', title: 'Distribute Horizontally' },
		{ label: '⇳', value: 'vertical', title: 'Distribute Vertically' }
	];
</script>

<div
	class="flex flex-wrap items-center gap-4 border-b border-gray-300 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800"
>
	<div class="flex items-center gap-1">
		<span class="mr-1 text-sm dark:text-gray-300">Align:</span>
		{#each alignmentButtons as btn}
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				on:click={() => dispatch('align', btn.value)}
				title={btn.title}
			>
				{@html btn.label}
			</button>
		{/each}
	</div>

	<div class="flex items-center gap-1">
		<span class="mr-1 text-sm dark:text-gray-300">Distribute:</span>
		{#each distributionButtons as btn}
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				on:click={() => dispatch('distribute', btn.value)}
				title={btn.title}
			>
				{@html btn.label}
			</button>
		{/each}
	</div>
</div>
