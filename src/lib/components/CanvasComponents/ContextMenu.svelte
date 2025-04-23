<!-- src/lib/components/CanvasComponents/ContextMenu.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';

	export let x: number;
	export let y: number;
	export let selectedComponent: SurveyComponent | null;
	export let multiSelectedComponentIds: string[];
	export let targetElement: EventTarget | null;

	const dispatch = createEventDispatcher<{
		close: void;
		duplicate: void;
		delete: void;
		removeGuide: { direction: 'horizontal' | 'vertical'; index: number };
		properties: void;
		selectAll: void; // <-- Added event
		autoPosition: void; // <-- Added event
	}>();

	// --- Helper functions to determine context ---
	function getTargetGuideInfo(): { direction: 'horizontal' | 'vertical'; index: number } | null {
		if (!targetElement || !(targetElement instanceof Element)) return null;
		const guideLine = targetElement.closest<Element>('.guide-line');
		if (guideLine && guideLine instanceof SVGElement) {
			const direction = guideLine.dataset.direction;
			const indexStr = guideLine.dataset.index;
			if (direction && indexStr) {
				const index = parseInt(indexStr, 10);
				if (!isNaN(index) && (direction === 'horizontal' || direction === 'vertical')) {
					return { direction, index };
				}
			}
		}
		return null;
	}

	let clickedGuideInfo = getTargetGuideInfo();
	let clickedComponent: SurveyComponent | null = selectedComponent;

	// --- Event Handlers ---
	function handleRemoveGuide() {
		if (clickedGuideInfo) {
			dispatch('removeGuide', clickedGuideInfo);
			dispatch('close');
		}
	}

	function handleDuplicate() {
		if (multiSelectedComponentIds.length > 0) {
			dispatch('duplicate');
		}
		dispatch('close');
	}

	function handleDelete() {
		if (multiSelectedComponentIds.length > 0) {
			dispatch('delete');
		}
		dispatch('close');
	}

	function handleProperties() {
		if (selectedComponent) {
			dispatch('properties');
		}
		dispatch('close');
	}

	function handleSelectAll() {
		dispatch('selectAll'); // <-- Dispatch the new event
		dispatch('close');
	}

	function handleAutoPosition() {
		dispatch('autoPosition'); // <-- Dispatch the new event
		dispatch('close');
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dispatch('close');
		}
	}
</script>

<!-- Basic Context Menu Structure -->
<div
	class="fixed z-50 min-w-[150px] rounded border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
	style="left: {x}px; top: {y}px;"
	role="menu"
	tabindex="-1"
	aria-orientation="vertical"
	aria-labelledby="options-menu"
	on:click|stopPropagation={() => {}}
	on:contextmenu|preventDefault|stopPropagation
	on:keydown={handleKeyDown}
>
	<div class="py-1" id="options-menu">
		<!-- Component Context Menu -->
		{#if clickedComponent}
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700"
				role="menuitem"
				on:click={handleDuplicate}
				disabled={multiSelectedComponentIds.length === 0}
			>
				Duplicate{#if multiSelectedComponentIds.length > 1}
					({multiSelectedComponentIds.length}){/if}
			</button>
			<button
				class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50 dark:text-red-400 dark:hover:bg-gray-700"
				role="menuitem"
				on:click={handleDelete}
				disabled={multiSelectedComponentIds.length === 0}
			>
				Delete{#if multiSelectedComponentIds.length > 1}
					({multiSelectedComponentIds.length}){/if}
			</button>
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
				role="menuitem"
				on:click={handleProperties}
			>
				Properties
			</button>
		{/if}

		<!-- Guide Context Menu -->
		{#if clickedGuideInfo}
			{#if clickedComponent}<div
					class="my-1 border-t border-gray-200 dark:border-gray-600"
				></div>{/if}
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
				role="menuitem"
				on:click={handleRemoveGuide}
			>
				Remove Guide ({clickedGuideInfo.direction === 'horizontal' ? 'H' : 'V'})
			</button>
		{/if}

		<!-- Canvas Background Context Menu -->
		{#if !clickedComponent && !clickedGuideInfo}
			<span
				class="block px-4 py-1 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
				role="none">Canvas Actions</span
			>
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
				role="menuitem"
				on:click={handleSelectAll}
			>
				Select All (Ctrl+A)
			</button>
			<!-- Grid Button -->
			<button
				class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
				role="menuitem"
				on:click={handleAutoPosition}
				title="Automatically arrange components (Grid)"
			>
				<span>Grid Layout</span>
			</button>
		{/if}
	</div>
</div>

<!-- Click outside listener (remains the same) -->
<button
	type="button"
	class="fixed inset-0 z-40 h-full w-full cursor-default border-none bg-transparent p-0"
	aria-label="Dismiss context menu"
	on:click={() => dispatch('close')}
	on:contextmenu|preventDefault={() => dispatch('close')}
></button>
