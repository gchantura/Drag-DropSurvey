<!-- src/lib/components/CanvasComponents/ToolbarDistribute.svelte -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type Distribution = 'horizontal' | 'vertical';

	export let enabled: boolean = false; // Receive enabled status as prop

	const dispatch = createEventDispatcher<{
		distribute: Distribution;
	}>();

	const DistributeHorizontally = `<span>⬌</span>`;
	const DistributeVertically = `<span>⇳</span>`;

	const distributionButtons: { icon: string; value: Distribution; title: string }[] = [
		{ icon: DistributeHorizontally, value: 'horizontal', title: 'Distribute Horizontally' },
		{ icon: DistributeVertically, value: 'vertical', title: 'Distribute Vertically' }
	];
</script>

<div class="flex items-center gap-1">
	<span class="mr-1 text-sm text-gray-700 dark:text-gray-300">Distribute:</span>
	{#each distributionButtons as btn}
		<button
			class="rounded border border-gray-300 bg-white p-1.5 text-sm hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:bg-gray-700 dark:disabled:opacity-60"
			on:click={() => dispatch('distribute', btn.value)}
			title={btn.title}
			disabled={!enabled}
		>
			<span
				class="inline-flex h-4 w-4 items-center justify-center text-lg font-semibold text-gray-700 dark:text-slate-200"
			>
				{@html btn.icon}
			</span>
		</button>
	{/each}
</div>
