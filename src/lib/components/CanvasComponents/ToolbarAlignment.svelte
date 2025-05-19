<!-- src/lib/components/CanvasComponents/ToolbarAlignment.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
	export let enabled: boolean = false;
	const dispatch = createEventDispatcher<{ align: Alignment }>();
	const AlignLeft = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="4" x2="4" y2="20"></line><rect x="6" y="6" width="10" height="4" rx="1"></rect><rect x="6" y="14" width="14" height="4" rx="1"></rect></svg>`;
	const AlignVertically = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="4" x2="12" y2="20"></line><rect x="6" y="6" width="12" height="4" rx="1"></rect><rect x="4" y="14" width="16" height="4" rx="1"></rect></svg>`;
	const AlignRight = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="20" y1="4" x2="20" y2="20"></line><rect x="8" y="6" width="10" height="4" rx="1"></rect><rect x="4" y="14" width="14" height="4" rx="1"></rect></svg>`;
	const AlignTop = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="4" x2="20" y2="4"></line><rect x="6" y="6" width="4" height="10" rx="1"></rect><rect x="14" y="6" width="4" height="14" rx="1"></rect></svg>`;
	const AlignHorizontally = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><rect x="6" y="6" width="4" height="12" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>`;
	const AlignBottom = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="20" y2="20"></line><rect x="6" y="8" width="4" height="10" rx="1"></rect><rect x="14" y="4" width="4" height="14" rx="1"></rect></svg>`;
	const alignmentButtons: { icon: string; value: Alignment; title: string }[] = [
		{ icon: AlignLeft, value: 'left', title: 'Align Left' },
		{ icon: AlignVertically, value: 'center', title: 'Align Center Vertically' },
		{ icon: AlignRight, value: 'right', title: 'Align Right' },
		{ icon: AlignTop, value: 'top', title: 'Align Top' },
		{ icon: AlignHorizontally, value: 'middle', title: 'Align Middle Horizontally' },
		{ icon: AlignBottom, value: 'bottom', title: 'Align Bottom' }
	];
</script>

<div class="flex items-center gap-1">
	<span class="mr-1 text-sm text-gray-700 dark:text-gray-300">Align:</span>
	{#each alignmentButtons as btn}
		<button
			class="rounded border border-gray-300 bg-white p-1.5 text-sm hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:bg-gray-700 dark:disabled:opacity-60"
			onclick={() => dispatch('align', btn.value)}
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
