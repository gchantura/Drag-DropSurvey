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
	import { Button } from 'flowbite-svelte';
	import { Fileupload } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { theme, toggleTheme } from '$lib/stores/themeStore.ts';
	const dispatch = createEventDispatcher<{
		resetSelection: void;
		exportImageRequest: { format: 'png' | 'jpeg' };
	}>();
	const { selectedComponent } = $props<{ selectedComponent: SurveyComponent | null }>();
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
		importFile = null;
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
					showImport = false;
					importFile = null;
				} else {
					showAlert('Failed to import survey. Invalid JSON format or data.', 'red');
				}
			} catch (error: any) {
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
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
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
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		window.removeEventListener('mousemove', handleResizing);
		window.removeEventListener('touchmove', handleResizing);
		window.removeEventListener('mouseup', handleResizeEnd);
		window.removeEventListener('touchend', handleResizeEnd);
	}
	function requestImageExport(format: 'png' | 'jpeg') {
		dispatch('exportImageRequest', { format });
		showAlert('Generating image...', 'blue', 1500);
	}
</script>

<div
	bind:this={sidebarEl}
	class="sidebar-left-container allow-input relative h-full overflow-y-auto bg-gray-50 p-4 pr-6 dark:bg-gray-800 dark:text-gray-300"
	style="width: {sidebarWidth}px;"
>
	<button
		type="button"
		class="resize-handle absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize touch-none bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
		aria-label="Resize sidebar"
		onmousedown={handleResizeStart}
		ontouchstart={handleResizeStart}
	></button>
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold">Survey Editor</h2>
		<button
			type="button"
			aria-label="Toggle dark mode"
			class="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
			onclick={toggleTheme}
		>
			{#if $theme === 'dark'}
				<svg
					class="h-5 w-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path
						d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
						fill-rule="evenodd"
						clip-rule="evenodd"
					></path></svg
				>
			{:else}
				<svg
					class="h-5 w-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg
				>
			{/if}
		</button>
	</div>
	<ComponentToolbar />
	<div class="mt-6 mb-4 border-t pt-4 dark:border-gray-700">
		<h3 class="mb-2 text-lg font-medium">Actions</h3>
		<SurveyActions onSave={handleSave} onLoad={handleLoad} onClear={handleClear} />
		<div class="mt-2 grid grid-cols-2 gap-2">
			<Button size="sm" color="light" onclick={handleExport}>Export JSON</Button>
			<Button size="sm" color="light" onclick={handleImportClick}>
				{showImport ? 'Cancel Import' : 'Import JSON'}
			</Button>
			<Button size="sm" color="alternative" onclick={() => requestImageExport('png')}>
				Export PNG
			</Button>
			<Button size="sm" color="alternative" onclick={() => requestImageExport('jpeg')}>
				Export JPG
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
					onclick={processImport}
					disabled={!importFile || importFile.length === 0}
				>
					Upload and Import
				</Button>
			</div>
		{/if}
	</div>
	<div class="mt-6 border-t pt-4 dark:border-gray-700">
		<h3 class="mb-2 text-lg font-medium">Properties</h3>
		<PropertiesEditor component={selectedComponent} />
	</div>
	{#if alertMessage}
		<div class="sticky bottom-0 mt-4 p-1">
			<SurveyAlert {alertMessage} {alertColor} on:dismiss={() => (alertMessage = '')} />
		</div>
	{/if}
</div>

<style>
	.resize-handle {
		z-index: 50;
	}
</style>
