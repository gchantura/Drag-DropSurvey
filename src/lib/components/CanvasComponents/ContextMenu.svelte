<!-- src/lib/components/CanvasComponents/ContextMenu.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent } from '$lib/types/types.ts';
	type GuideInfo = { direction: 'horizontal' | 'vertical'; index: number; position: number };
	export let x: number;
	export let y: number;
	export let selectedComponent: SurveyComponent | null = null;
	export let contextMenuGuideInfo: GuideInfo | null = null;
	const dispatch = createEventDispatcher<{
		close: void;
		duplicate: void;
		delete: void;
		properties: void;
		selectAll: void;
		autoPosition: void;
		deleteGuide: GuideInfo;
		setPositionGuide: GuideInfo;
	}>();
	function handleGuideRemove() {
		if (contextMenuGuideInfo) {
			dispatch('deleteGuide', contextMenuGuideInfo);
		}
		dispatch('close');
	}
	function handleSetPosition() {
		if (contextMenuGuideInfo) {
			dispatch('setPositionGuide', contextMenuGuideInfo);
		}
		dispatch('close');
	}
	function preventContextMenuDefault(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
	}
	function handleInternalClick(event: MouseEvent) {
		event.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="context-menu fixed z-50 rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
	style="left: {x}px; top: {y}px;"
	role="menu"
	aria-orientation="vertical"
	aria-labelledby="menu-button"
	tabindex="-1"
	oncontextmenu={preventContextMenuDefault}
	onclick={handleInternalClick}
>
	<div class="py-1" role="none">
		{#if contextMenuGuideInfo}
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
				role="menuitem"
				tabindex="-1"
				onclick={handleGuideRemove}
			>
				Delete Guide
			</button>
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
				role="menuitem"
				tabindex="-1"
				onclick={handleSetPosition}
			>
				Set Position...
			</button>
			<div class="my-1 border-t border-gray-200 dark:border-gray-600"></div>
		{/if}
		{#if selectedComponent}
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:disabled:opacity-60"
				role="menuitem"
				tabindex="-1"
				onclick={() => {
					dispatch('duplicate');
					dispatch('close');
				}}
			>
				Duplicate
			</button>
			<button
				class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
				role="menuitem"
				tabindex="-1"
				onclick={() => {
					dispatch('delete');
					dispatch('close');
				}}
			>
				Delete
			</button>
			<button
				class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
				role="menuitem"
				tabindex="-1"
				onclick={() => {
					dispatch('properties');
					dispatch('close');
				}}
			>
				Properties
			</button>
			<div class="my-1 border-t border-gray-200 dark:border-gray-600"></div>
		{/if}
		<button
			class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
			role="menuitem"
			tabindex="-1"
			onclick={() => {
				dispatch('selectAll');
				dispatch('close');
			}}
		>
			Select All
		</button>
		<button
			class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
			role="menuitem"
			tabindex="-1"
			onclick={() => {
				dispatch('autoPosition');
				dispatch('close');
			}}
		>
			Auto Position
		</button>
	</div>
</div>
