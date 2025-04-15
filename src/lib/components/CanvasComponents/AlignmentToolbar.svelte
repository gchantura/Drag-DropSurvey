<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let visible: boolean = false;

	const dispatch = createEventDispatcher<{
		align: { direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' };
		distribute: { direction: 'horizontal' | 'vertical' };
	}>();

	function align(direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
		dispatch('align', { direction });
	}

	function distribute(direction: 'horizontal' | 'vertical') {
		dispatch('distribute', { direction });
	}
</script>

{#if visible}
	<div class="flex items-center border-b border-gray-300 bg-gray-100 p-2">
		<div class="mr-2 text-sm">Align:</div>
		<div class="flex space-x-1">
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
				on:click={() => align('left')}
				title="Align Left"
			>
				⫷
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
				on:click={() => align('center')}
				title="Align Center"
			>
				⋮
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
				on:click={() => align('right')}
				title="Align Right"
			>
				⫸
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
				on:click={() => align('top')}
				title="Align Top"
			>
				⫯
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
				on:click={() => align('middle')}
				title="Align Middle"
			>
				―
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
				on:click={() => align('bottom')}
				title="Align Bottom"
			>
				⫰
			</button>
		</div>

		<div class="mr-2 ml-4 text-sm">Distribute:</div>
		<div class="flex space-x-1">
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
				on:click={() => distribute('horizontal')}
				title="Distribute Horizontally"
			>
				⟷
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
				on:click={() => distribute('vertical')}
				title="Distribute Vertically"
			>
				⟷
			</button>
		</div>
	</div>
{/if}
