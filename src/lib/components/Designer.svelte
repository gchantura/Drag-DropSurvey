<!-- src/lib/components/Designer.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import type { SurveyComponent } from '$lib/types/types.ts';
	import { componentsStore } from '$lib/stores/designStore.ts';
	import { primarySelectedComponentId, clearSelectionState } from '$lib/stores/alignmentStore.ts';
	import Canvas from './Canvas.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import SideBarRight from '$lib/components/SideBarRight.svelte';
	import { initHistory } from '$lib/stores/historyStore.ts';

	const selectedComponent = derived(
		[primarySelectedComponentId, componentsStore],
		([$primaryId, $components]) => {
			if (!$primaryId) return null;
			return $components.find((c) => c.id === $primaryId) || null;
		}
	);

	let canvasComponent: Canvas;

	onMount(() => {
		clearSelectionState();
		initHistory();
	});

	function handleResetSelection() {
		clearSelectionState();
	}

	function handleExportImageRequest(event: CustomEvent<{ format: 'png' | 'jpeg' }>) {
		if (canvasComponent) {
			canvasComponent.exportCanvasAsImage(event.detail.format);
		} else {
			console.error('Canvas component reference not available for export.');
		}
	}
</script>

<svelte:head><title>Kceva Designer</title></svelte:head>
<div class="flex h-screen w-screen overflow-hidden bg-white dark:bg-gray-900">
	<aside class="sidebar flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
		<SideBar
			selectedComponent={$selectedComponent}
			on:resetSelection={handleResetSelection}
			on:exportImageRequest={handleExportImageRequest}
		/>
	</aside>
	<main class="flex-1 overflow-hidden">
		<Canvas bind:this={canvasComponent} selectedComponent={$selectedComponent} />
	</main>
	<aside class="sidebar flex-shrink-0 border-l border-gray-200 dark:border-gray-700">
		<SideBarRight selectedComponent={$selectedComponent} />
	</aside>
</div>

<style>
	.sidebar {
		height: 100vh;
		overflow-y: auto;
	}
	main {
		min-width: 300px;
		user-select: none;
		-webkit-user-select: none;
	}
</style>
