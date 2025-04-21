<!-- src/lib/components/SurveyBuilder.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import SideBarRight from '$lib/components/SideBarRight.svelte';
	import Canvas from './Canvas.svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';
	import { loadSurvey } from '$lib/stores/surveyStore.ts'; // Import loadSurvey

	let selectedComponent: SurveyComponent | null = null;
	let canvasComponent: Canvas; // Reference to the Canvas component instance

	// Global keydown handling is now primarily inside Canvas.svelte
	// Remove the handleKeydown function and listener here if Canvas handles it sufficiently.

	onMount(() => {
		// Load saved survey on initial mount
		loadSurvey();

		// Focus the canvas initially? Maybe optional.
		// Find a way to focus the canvas viewport element if desired
		// canvasComponent?.focusViewport?.();
	});
</script>

<svelte:head>
	<title>Survey Builder</title>
</svelte:head>

<div class="flex h-screen w-screen overflow-hidden bg-white dark:bg-gray-900">
	<!-- Sidebar -->
	<aside
		class="sidebar allow-input w-64 flex-shrink-0 border-r border-gray-200 md:w-72 lg:w-80 dark:border-gray-700"
	>
		<SideBar bind:selectedComponent />
	</aside>

	<!-- Canvas Area -->
	<main class="flex-1">
		<Canvas bind:this={canvasComponent} bind:selectedComponent />
	</main>

	<!-- Right Sidebar -->
	<aside
		class="sidebar allow-input w-64 flex-shrink-0 border-l border-gray-200 md:w-72 lg:w-80 dark:border-gray-700"
	>
		<SideBarRight />
	</aside>
</div>

<style>
	/* Ensure sidebar has its own scroll if content overflows */
	.sidebar {
		height: 100vh;
		overflow-y: auto;
	}
	/* Prevent text selection in the main canvas area during interactions */
	main {
		user-select: none;
		-webkit-user-select: none;
	}
</style>
