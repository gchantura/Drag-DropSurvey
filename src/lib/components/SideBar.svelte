<script lang="ts">
	import { addComponent, saveSurvey, loadSurvey, clearSurvey } from '$lib/stores/surveyStore.ts';
	import PropertiesEditor from './PropertiesEditor.svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';
	import { Alert, GradientButton, Button } from 'flowbite-svelte';
	export let selectedComponent: SurveyComponent | null = null;
	let alertMessage = '';
	let alertColor = '';

	function handleSave() {
		if (saveSurvey()) {
			alertMessage = 'Survey saved successfully!';
			alertColor = 'green';
		} else {
			alertMessage = 'Failed to save the survey.';
			alertColor = 'red';
		}
	}

	function handleLoad() {
		if (loadSurvey()) {
			alertMessage = 'Survey loaded successfully!';
			alertColor = 'green';
		} else {
			alertMessage = 'No saved survey found!';
			alertColor = 'red';
		}
	}

	function handleClear() {
		if (confirm('Are you sure you want to clear all components?')) {
			clearSurvey();
			selectedComponent = null;
			alertMessage = 'Survey cleared!';
			alertColor = 'yellow';
		}
	}
</script>

<div class="h-full w-full overflow-y-auto bg-gray-100 p-4">
	<h2 class="mb-4 text-xl font-bold">Survey Builder</h2>

	<div class="mt-1 grid grid-cols-2 p-5">
		<!-- Component buttons -->
		<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('text')}
			>Text</GradientButton
		>
		<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('input')}
			>Input</GradientButton
		>
		<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('textarea')}
			>Text Area</GradientButton
		>
		<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('checkbox')}
			>Checkboxes</GradientButton
		>
		<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('radio')}
			>Radio Buttons</GradientButton
		>
		<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('dropdown')}
			>Dropdown</GradientButton
		>
	</div>

	<!-- Survey actions -->
	<div class="mb-6 space-y-2">
		<button class="btn bg-green-600" on:click={handleSave}>Save Survey</button>
		<button class="btn bg-yellow-600" on:click={handleLoad}>Load Survey</button>
		<button class="btn bg-red-600" on:click={handleClear}>Clear Survey</button>
	</div>

	<!-- Properties editor -->
	<PropertiesEditor component={selectedComponent} />

	<!-- Conditional Alert display -->
	{#if alertMessage}
		<Alert color={alertColor}>
			{alertMessage}
		</Alert>
	{/if}
</div>

<style>
	.btn {
		display: block;
		width: 100%;
		padding: 0.5rem;
		color: white;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn:hover {
		opacity: 0.9;
	}
</style>
