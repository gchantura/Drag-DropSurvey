<!-- src/lib/components/SideBar.svelte -->
<script lang="ts">
	import {
		saveSurvey,
		loadSurvey,
		clearSurvey,
		exportSurvey,
		importSurvey
	} from '$lib/stores/surveyStore.ts';
	import ComponentToolbar from './SideBarComponents/ComponentToolbar.svelte';
	import SurveyActions from './SideBarComponents/SurveyActions.svelte';
	import PropertiesEditor from './SideBarComponents/PropertiesEditor.svelte';
	import SurveyAlert from './SideBarComponents/SurveyAlert.svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';
	import { DarkMode } from 'flowbite-svelte';
	import { Button } from 'flowbite-svelte';
	import { Fileupload } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const { selectedComponent } = $props<{
		selectedComponent: SurveyComponent | null;
	}>();

	let alertColor = $state<'green' | 'red' | 'yellow' | 'blue' | 'dark'>('blue');
	let alertMessage = $state('');
	let alertTimeout: number | undefined = undefined;
	let showImport = $state(false);
	let importFile: FileList | null = $state(null);

	function showAlert(message: string, color: typeof alertColor = 'blue', duration: number = 3000) {
		alertMessage = message;
		alertColor = color;
		clearTimeout(alertTimeout);
		if (duration > 0) {
			alertTimeout = window.setTimeout(() => {
				alertMessage = '';
			}, duration);
		}
	}

	function handleSave() {
		if (saveSurvey()) {
			showAlert('Survey saved to browser storage!', 'green');
		} else {
			showAlert('Failed to save the survey.', 'red');
		}
	}

	function handleLoad() {
		if (loadSurvey()) {
			dispatch('resetSelection');
			showAlert('Survey loaded from browser storage!', 'green');
		} else {
			showAlert('No saved survey found or failed to load!', 'yellow');
		}
	}

	function handleClear() {
		if (confirm('Are you sure you want to clear the entire survey? This cannot be undone.')) {
			clearSurvey();
			dispatch('resetSelection');
			showAlert('Survey cleared!', 'yellow');
		}
	}

	function handleExport() {
		if (exportSurvey()) {
			showAlert('Survey exported as JSON file.', 'green');
		} else {
			showAlert('Failed to export survey.', 'red');
		}
	}

	function handleImportClick() {
		showImport = !showImport;
		importFile = null; // Reset file input
	}

	async function processImport() {
		if (!importFile || importFile.length === 0) {
			showAlert('Please select a JSON file to import.', 'red');
			return;
		}
		const file = importFile[0];
		if (file.type !== 'application/json') {
			showAlert('Invalid file type. Please select a JSON file.', 'red');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const jsonData = e.target?.result as string;
				if (importSurvey(jsonData)) {
					dispatch('resetSelection');
					showAlert('Survey imported successfully!', 'green');
					showImport = false; // Hide import section
					importFile = null;
				} else {
					showAlert('Failed to import survey. Invalid JSON format or data.', 'red');
				}
			} catch (error: any) {
				// Catch error explicitly
				showAlert(`Error reading or parsing file: ${error?.message || error}`, 'red');
			}
		};
		reader.onerror = () => {
			showAlert(`Error reading file: ${reader.error}`, 'red');
		};
		reader.readAsText(file);
	}

	let sidebarWidth = $state(300);
	let startX = $state(0);
	let startWidth = $state(0);
	let sidebarEl: HTMLDivElement;

	function handleResizeStart(event: MouseEvent | TouchEvent) {
		const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
		startX = clientX;
		startWidth = sidebarWidth;

		window.addEventListener('mousemove', handleResizing);
		window.addEventListener('touchmove', handleResizing, { passive: false });
		window.addEventListener('mouseup', handleResizeEnd);
		window.addEventListener('touchend', handleResizeEnd);
	}

	function handleResizing(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
		const newWidth = startWidth + (clientX - startX);
		if (newWidth > 200 && newWidth < 800) {
			sidebarWidth = newWidth;
		}
	}

	function handleResizeEnd() {
		window.removeEventListener('mousemove', handleResizing);
		window.removeEventListener('touchmove', handleResizing);
		window.removeEventListener('mouseup', handleResizeEnd);
		window.removeEventListener('touchend', handleResizeEnd);
	}
</script>

<div
	bind:this={sidebarEl}
	class="sidebar-left-container allow-input relative h-full overflow-y-auto bg-gray-50 p-4 pr-6 dark:bg-gray-800 dark:text-gray-300"
	style={`width: ${sidebarWidth}px;`}
>
	<!-- RESIZE HANDLE -->
	<button
		type="button"
		class="resize-handle absolute top-0 right-0 h-full w-2 cursor-col-resize bg-gray-200 dark:bg-gray-600"
		aria-label="Resize sidebar"
		onmousedown={handleResizeStart}
		ontouchstart={handleResizeStart}
	></button>

	<!-- Header with DarkMode -->
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold">Survey Editor</h2>
		<DarkMode
			btnClass="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
		/>
	</div>

	<!-- Components -->
	<ComponentToolbar />

	<!-- Aktions -->
	<div class="mt-6 mb-4 border-t pt-4 dark:border-gray-700">
		<h3 class="mb-2 text-lg font-medium">Actions</h3>
		<SurveyActions onSave={handleSave} onLoad={handleLoad} onClear={handleClear} />
		<div class="mt-2 grid grid-cols-2 gap-2">
			<Button size="sm" color="light" on:click={handleExport}>Export JSON</Button>
			<Button size="sm" color="light" on:click={handleImportClick}>
				{showImport ? 'Cancel Import' : 'Import JSON'}
			</Button>
		</div>

		{#if showImport}
			<div class="mt-3 rounded border bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700">
				<Fileupload
					id="import-file"
					bind:files={importFile}
					accept="application/json"
					class="mb-2"
				/>
				<Button
					size="xs"
					color="primary"
					on:click={processImport}
					disabled={!importFile || importFile.length === 0}
				>
					Upload and Import
				</Button>
			</div>
		{/if}
	</div>

	<!-- Properties -->
	<div class="mt-6 border-t pt-4 dark:border-gray-700">
		<h3 class="mb-2 text-lg font-medium">Properties</h3>
		<PropertiesEditor component={selectedComponent} />
	</div>

	<!-- Alert -->
	{#if alertMessage}
		<div class="sticky bottom-0 mt-4 p-1">
			<SurveyAlert {alertMessage} {alertColor} on:dismiss={() => (alertMessage = '')} />
		</div>
	{/if}
</div>

<style>
	.sidebar-left-container {
		position: absolute;
		z-index: 10000;
	}

	.resize-handle {
		z-index: 50;
	}
</style>
