<script lang="ts">
	import { saveSurvey, loadSurvey, clearSurvey } from '$lib/stores/surveyStore.ts';
	import ComponentToolbar from './SideBarComponents/ComponentToolbar.svelte';
	import SurveyActions from './SideBarComponents/SurveyActions.svelte';
	import PropertiesEditor from './SideBarComponents/PropertiesEditor.svelte';
	import SurveyAlert from './SideBarComponents/SurveyAlert.svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';
	import { DarkMode } from 'flowbite-svelte';

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
	<DarkMode />
	<!-- Component Toolbar - Replaced ComponentButtons -->
	<ComponentToolbar />

	<!-- Survey Actions -->
	<SurveyActions onSave={handleSave} onLoad={handleLoad} onClear={handleClear} />

	<!-- Properties Editor -->
	<PropertiesEditor component={selectedComponent} />

	<!-- Conditional Alert Display -->
	<SurveyAlert {alertMessage} {alertColor} />
</div>
