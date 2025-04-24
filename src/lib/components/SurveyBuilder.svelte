<script lang="ts">
	import { onMount } from 'svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';
	import { loadSurvey } from '$lib/stores/surveyStore.ts';

	import Canvas from './Canvas.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import SideBarRight from '$lib/components/SideBarRight.svelte';

	let selectedComponent: SurveyComponent | null = null;
	let canvasComponent: Canvas;

	onMount(() => {
		loadSurvey();
	});
</script>

<svelte:head>
	<title>Survey Builder</title>
</svelte:head>

<div class="flex h-screen w-screen overflow-hidden bg-white dark:bg-gray-900">
	<aside
		class="sidebar allow-input w-64 flex-shrink-0 border-r border-gray-200 md:w-72 lg:w-80 dark:border-gray-700"
	>
		<SideBar bind:selectedComponent />
	</aside>

	<main class="flex-1">
		<Canvas bind:this={canvasComponent} bind:selectedComponent />
	</main>

	<aside
		class="sidebar allow-input w-64 flex-shrink-0 border-l border-gray-200 md:w-72 lg:w-80 dark:border-gray-700"
	>
		<SideBarRight />
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
