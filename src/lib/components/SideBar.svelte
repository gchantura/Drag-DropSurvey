<!-- lib/components/SideBar.svelte -->
<script lang="ts">
	import { addComponent, saveSurvey, loadSurvey, clearSurvey } from '$lib/stores/surveyStore.ts';
	import PropertiesEditor from './PropertiesEditor.svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';

	export let selectedComponent: SurveyComponent | null = null;

	function handleSave() {
		if (saveSurvey()) {
			alert('Survey saved successfully!');
		}
	}

	function handleLoad() {
		if (loadSurvey()) {
			alert('Survey loaded successfully!');
		} else {
			alert('No saved survey found!');
		}
	}

	function handleClear() {
		if (confirm('Are you sure you want to clear all components?')) {
			clearSurvey();
			selectedComponent = null;
		}
	}
</script>

<div class="h-full w-full overflow-y-auto bg-gray-100 p-4">
	<h2 class="mb-4 text-xl font-bold">Survey Builder</h2>

	<!-- Component buttons -->
	<div class="mb-6 space-y-2">
		<button class="btn bg-blue-600" on:click={() => addComponent('text')}>Add Text</button>
		<button class="btn bg-blue-600" on:click={() => addComponent('input')}>Add Input</button>
		<button class="btn bg-blue-600" on:click={() => addComponent('textarea')}>Add Text Area</button>
		<button class="btn bg-blue-600" on:click={() => addComponent('checkbox')}>Add Checkboxes</button
		>
		<button class="btn bg-blue-600" on:click={() => addComponent('radio')}>Add Radio Buttons</button
		>
		<button class="btn bg-blue-600" on:click={() => addComponent('dropdown')}>Add Dropdown</button>
	</div>

	<!-- Survey actions -->
	<div class="mb-6 space-y-2">
		<button class="btn bg-green-600" on:click={handleSave}>Save Survey</button>
		<button class="btn bg-yellow-600" on:click={handleLoad}>Load Survey</button>
		<button class="btn bg-red-600" on:click={handleClear}>Clear Survey</button>
	</div>

	<!-- Properties editor -->
	<PropertiesEditor component={selectedComponent} />
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
