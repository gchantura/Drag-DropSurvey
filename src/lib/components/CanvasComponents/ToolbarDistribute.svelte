<!-- src/lib/components/DistributionButtons.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type Distribution = 'horizontal' | 'vertical';

	const dispatch = createEventDispatcher<{ distribute: Distribution }>();

	const distributionButtons: { label: string; value: Distribution; title: string }[] = [
		{ label: '⬌', value: 'horizontal', title: 'Distribute Horizontally' },
		{ label: '⇳', value: 'vertical', title: 'Distribute Vertically' }
	];
</script>

<div class="flex flex-col items-center gap-1">
	<p class="text-sm text-gray-700 dark:text-gray-300">Distribute</p>
	<div class="flex flex-wrap justify-center gap-1">
		{#each distributionButtons as btn}
			<button
				class="flex items-center justify-center rounded border border-gray-300 bg-white p-2 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				on:click={() => dispatch('distribute', btn.value)}
				title={btn.title}
			>
				<span class="inline-block h-5 w-5 text-gray-700 dark:text-slate-200">
					{btn.label}
				</span>
			</button>
		{/each}
	</div>
</div>