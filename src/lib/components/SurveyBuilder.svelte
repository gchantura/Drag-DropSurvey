<!-- src/lib/components/SurveyBuilder.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store'; // Correct import location for derived
	import type { SurveyComponent } from '$lib/types/survey.ts';
	import { loadSurvey, componentsStore } from '$lib/stores/surveyStore.ts';
	import { primarySelectedComponentId, clearSelectionState } from '$lib/stores/alignmentStore.ts';

	import Canvas from './Canvas.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import SideBarRight from '$lib/components/SideBarRight.svelte';

	const selectedComponent = derived(
		[primarySelectedComponentId, componentsStore],
		([$primaryId, $components]) => {
			if (!$primaryId) return null;
			return $components.find((c) => c.id === $primaryId) || null;
		}
	);

	let canvasComponent: Canvas;

	onMount(() => {
		loadSurvey();
	});

	function handleResetSelection() {
		clearSelectionState();
	}
</script>

<svelte:head>
	<title>Survey Builder</title>
</svelte:head>

<div class="flex h-screen w-screen overflow-hidden bg-white dark:bg-gray-900">
	<aside
		class="sidebar allow-input w-64 flex-shrink-0 border-r border-gray-200 md:w-72 lg:w-80 dark:border-gray-700"
	>
		<SideBar selectedComponent={$selectedComponent} on:resetSelection={handleResetSelection} />
	</aside>

	<main class="flex-1">
		<Canvas bind:this={canvasComponent} selectedComponent={$selectedComponent} />
	</main>

	<aside
		class="sidebar allow-input w-64 flex-shrink-0 border-l border-gray-200 md:w-72 lg:w-80 dark:border-gray-700"
	>
		<!-- Pass selectedComponent prop to SideBarRight -->
		<SideBarRight selectedComponent={$selectedComponent} />
	</aside>
</div>

<style>
	.sidebar {
		height: 100vh;
		overflow-y: auto;
	}
	main {
		user-select: none;
		-webkit-user-select: none;
	}
</style>
