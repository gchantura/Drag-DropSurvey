<!-- src/lib/components/CanvasComponents/ToolbarDistribute.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	type Distribution = 'horizontal' | 'vertical';
	export let enabled: boolean = false;
	const dispatch = createEventDispatcher<{ distribute: Distribution }>();
	const DistributeHorizontally = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="3" height="14" rx="1"></rect><rect x="17" y="5" width="3" height="14" rx="1"></rect><rect x="10.5" y="8" width="3" height="8" rx="1"></rect><path d="M4 12h16"></path></svg>`;
	const DistributeVertically = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="3" rx="1"></rect><rect x="5" y="17" width="14" height="3" rx="1"></rect><rect x="8" y="10.5" width="8" height="3" rx="1"></rect><path d="M12 4v16"></path></svg>`;
	const distributionButtons: { icon: string; value: Distribution; title: string }[] = [
		{ icon: DistributeHorizontally, value: 'horizontal', title: 'Distribute Horizontally' },
		{ icon: DistributeVertically, value: 'vertical', title: 'Distribute Vertically' }
	];
</script>

<div class="flex items-center gap-1">
	{#each distributionButtons as btn}
		<button
			class="rounded border border-gray-300 bg-white p-1.5 text-sm hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:bg-gray-700 dark:disabled:opacity-60"
			onclick={() => dispatch('distribute', btn.value)}
			title={btn.title}
			disabled={!enabled}
		>
			<span
				class="inline-block h-4 w-4 text-gray-700 dark:text-slate-200 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-[1.5]"
			>
				{@html btn.icon}
			</span>
		</button>
	{/each}
</div>
