<!-- lib/components/SurveyBuilder.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import SideBar from './SideBar.svelte';
	import Canvas from './Canvas.svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';

	let selectedComponent: SurveyComponent | null = null;

	function handleKeydown(e: KeyboardEvent) {
		if (selectedComponent && e.key === 'Delete') {
			import('$lib/stores/surveyStore.ts').then(({ removeComponent }) => {
				removeComponent(selectedComponent!.id);
				selectedComponent = null;
			});
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:head>
	<title>Survey Builder</title>
</svelte:head>

<div class="flex h-screen overflow-hidden">
	<!-- Sidebar -->
	<div class="w-1/4">
		<SideBar bind:selectedComponent />
	</div>

	<!-- Canvas -->
	<div class="w-3/4">
		<Canvas bind:selectedComponent />
	</div>
</div>
