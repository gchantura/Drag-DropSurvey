<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let show: boolean = false;
	export let x: number = 0;
	export let y: number = 0;

	const dispatch = createEventDispatcher<{
		duplicate: void;
		properties: void;
		delete: void;
		hide: void;
	}>();

	function handleAction(action: 'duplicate' | 'properties' | 'delete') {
		dispatch(action);
		dispatch('hide');
	}
</script>

{#if show}
	<div
		class="absolute z-50 rounded border border-gray-300 bg-white shadow-lg"
		style="left: {x}px; top: {y}px;"
	>
		<ul class="py-1">
			<li>
				<button
					class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
					on:click={() => handleAction('duplicate')}
				>
					Duplicate
				</button>
			</li>
			<li>
				<button
					class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
					on:click={() => handleAction('properties')}
				>
					Properties
				</button>
			</li>
			<li class="border-t border-gray-200">
				<button
					class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
					on:click={() => handleAction('delete')}
				>
					Delete
				</button>
			</li>
		</ul>
	</div>
{/if}
