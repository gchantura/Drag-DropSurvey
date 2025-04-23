<!-- src/lib/components/CanvasComponents/ContextMenu.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts'; // Adjust path if needed

	// --- Component Props ---
	export let x: number;
	export let y: number;
	export let selectedComponent: SurveyComponent | null;
	export let multiSelectedComponentIds: string[];
	export let targetElement: EventTarget | null;
	// export let horizontalGuides: number[]; // Removed - Unused in this component's logic
	// export let verticalGuides: number[];   // Removed - Unused in this component's logic
	// --- END OF PROPS ---

	const dispatch = createEventDispatcher<{
		close: void;
		duplicate: void;
		delete: void;
		removeGuide: { direction: 'horizontal' | 'vertical'; index: number };
		properties: void;
	}>();

	// --- Helper functions to determine context ---
	function getTargetGuideInfo(): { direction: 'horizontal' | 'vertical'; index: number } | null {
		if (!targetElement || !(targetElement instanceof Element)) return null; // Ensure it's an Element

		// Find the closest ancestor (or self) that matches the selector
		const guideLine = targetElement.closest<Element>('.guide-line'); // Find the element first

		// Check if found and cast to SVGElement (or HTMLElement if applicable) to access dataset
		// Note: SVG elements inherit from Element, HTMLElement is specific to HTML
		if (guideLine && guideLine instanceof SVGElement) {
			// Check if it's an SVGElement
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
	// Determine if a component was clicked directly or is the primary selected one
	// This might need adjustment based on how targetElement relates to components vs. guides
	let clickedComponent: SurveyComponent | null = selectedComponent; // Simplest assumption: use the passed primary selection

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
			// Usually properties apply to the primary selection
			dispatch('properties');
		}
		dispatch('close');
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dispatch('close');
		}
		// Add potential arrow key navigation here if desired
	}
</script>

<!-- Basic Context Menu Structure -->
<div
	class="fixed z-50 rounded border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
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
		<!-- Conditional Menu Items -->
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

		{#if !clickedComponent && !clickedGuideInfo}
			<!-- Default canvas context menu options -->
			<span class="block px-4 py-2 text-sm text-gray-500 dark:text-gray-400" role="none"
				>Canvas Menu</span
			>
			<!-- Add options like "Paste", "Select All" etc. if needed -->
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
				role="menuitem"
				on:click={() => {
					/* Dispatch select all or other canvas action */ dispatch('close');
				}}
			>
				Select All (Ctrl+A)
			</button>
		{/if}

		<!-- Always show close or handle click outside -->
		<div class="my-1 border-t border-gray-200 dark:border-gray-600"></div>
		<button
			class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
			role="menuitem"
			on:click={() => dispatch('close')}
		>
			Close
		</button>
	</div>
</div>

<!-- Click outside listener -->
<button
	type="button"
	class="fixed inset-0 z-40 h-full w-full cursor-default border-none bg-transparent p-0"
	aria-label="Dismiss context menu"
	on:click={() => dispatch('close')}
	on:contextmenu|preventDefault={() => dispatch('close')}
></button>
