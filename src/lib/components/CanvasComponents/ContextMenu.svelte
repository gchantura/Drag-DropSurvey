<!-- src/lib/components/ContextMenu.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	export let x: number = 0;
	export let y: number = 0;
	export let targetElement: EventTarget | null = null; // To check if click is outside

	const dispatch = createEventDispatcher<{
		close: void;
		duplicate: void;
		delete: void;
		properties: void; // Example action
	}>();

	function handleClickOutside(event: MouseEvent) {
		// Close if clicked outside the menu
		if (!(event.target as Node).contains(node)) {
			// Check if the click target is the element that opened the menu
			if (targetElement !== event.target) {
				dispatch('close');
			}
		}
	}

	let node: HTMLDivElement;

	onMount(() => {
		// Use timeout to prevent immediate closing on the same click that opened it
		setTimeout(() => window.addEventListener('click', handleClickOutside), 0);
		// Add escape key listener
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('click', handleClickOutside);
		window.removeEventListener('keydown', handleKeydown);
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dispatch('close');
		}
	}

	function handleAction(action: 'duplicate' | 'delete' | 'properties') {
		dispatch(action);
		dispatch('close'); // Automatically close after action
	}
</script>

<div
	bind:this={node}
	class="context-menu absolute z-50 min-w-[150px] rounded border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
	style="left: {x}px; top: {y}px;"
	role="menu"
	aria-orientation="vertical"
>
	<ul class="py-1">
		<li role="menuitem">
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
				on:click={() => handleAction('duplicate')}
			>
				Duplicate <span class="text-xs text-gray-500">(Ctrl+D)</span>
			</button>
		</li>
		<li role="menuitem">
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
				on:click={() => handleAction('properties')}
			>
				Properties
			</button>
		</li>
		<li class="my-1 border-t border-gray-200 dark:border-gray-700" role="separator"></li>
		<li role="menuitem">
			<button
				class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
				on:click={() => handleAction('delete')}
			>
				Delete <span class="text-xs text-gray-500">(Del)</span>
			</button>
		</li>
	</ul>
</div>
