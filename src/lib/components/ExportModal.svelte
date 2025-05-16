<script lang="ts">
	import { Button, Modal, Select, Checkbox, Textarea } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { exportSurveyAsCode, exportSettingsStore } from '$lib/stores/surveyStore.ts';
	import type { ExportFormat } from '$lib/types/survey.ts';

	export let open = false;

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	let exportFormat: ExportFormat = 'html';
	let includeStyles = true;
	let includeValidation = true;
	let includeFramework = false;
	let minify = false;
	let exportedCode = '';

	function handleClose() {
		dispatch('close');
	}

	function generateExport() {
		const settings = {
			format: exportFormat,
			includeStyles,
			includeValidation,
			includeFramework,
			minify
		};

		exportSettingsStore.set(settings);
		exportedCode = exportSurveyAsCode(exportFormat, settings);
	}

	function copyToClipboard() {
		if (exportedCode) {
			navigator.clipboard
				.writeText(exportedCode)
				.then(() => {
					alert('Code copied to clipboard!');
				})
				.catch((err) => {
					console.error('Failed to copy code: ', err);
					alert('Failed to copy code. Please try again or copy manually.');
				});
		}
	}

	function downloadCode() {
		if (!exportedCode) return;

		let extension = '.txt';
		let mimeType = 'text/plain';

		switch (exportFormat) {
			case 'html':
				extension = '.html';
				mimeType = 'text/html';
				break;
			case 'json':
				extension = '.json';
				mimeType = 'application/json';
				break;
			case 'react':
				extension = '.jsx';
				mimeType = 'text/javascript';
				break;
			case 'vue':
				extension = '.vue';
				mimeType = 'text/plain';
				break;
			case 'angular':
				extension = '.ts';
				mimeType = 'text/plain';
				break;
		}

		const blob = new Blob([exportedCode], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = `survey-export${extension}`;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	}

	$: if (open) {
		generateExport();
	}

	$: if (exportFormat) {
		generateExport();
	}
</script>

<Modal bind:open size="xl" autoclose={false} class="w-full">
	<div class="flex items-center justify-between">
		<h3 class="text-xl font-medium text-gray-900 dark:text-white">Export Survey</h3>
		<Button color="alternative" class="ml-auto" on:click={handleClose}>
			<svg
				class="h-4 w-4"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
					clip-rule="evenodd"
				></path>
			</svg>
		</Button>
	</div>

	<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="space-y-4">
			<div>
				<label
					for="export-format"
					class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Export Format</label
				>
				<Select id="export-format" bind:value={exportFormat} class="w-full">
					<option value="html">HTML</option>
					<option value="json">JSON</option>
					<option value="react">React</option>
					<option value="vue">Vue</option>
					<option value="angular">Angular</option>
				</Select>
			</div>

			<div class="space-y-2">
				<h4 class="text-sm font-medium text-gray-900 dark:text-white">Options</h4>

				<div class="flex items-center">
					<Checkbox id="include-styles" bind:checked={includeStyles} />
					<label for="include-styles" class="ml-2 text-sm text-gray-900 dark:text-white"
						>Include Styles</label
					>
				</div>

				<div class="flex items-center">
					<Checkbox id="include-validation" bind:checked={includeValidation} />
					<label for="include-validation" class="ml-2 text-sm text-gray-900 dark:text-white"
						>Include Validation</label
					>
				</div>

				{#if exportFormat !== 'html' && exportFormat !== 'json'}
					<div class="flex items-center">
						<Checkbox id="include-framework" bind:checked={includeFramework} />
						<label for="include-framework" class="ml-2 text-sm text-gray-900 dark:text-white"
							>Include Framework Dependencies</label
						>
					</div>
				{/if}

				<div class="flex items-center">
					<Checkbox id="minify" bind:checked={minify} />
					<label for="minify" class="ml-2 text-sm text-gray-900 dark:text-white"
						>Minify Output</label
					>
				</div>
			</div>

			<div class="flex flex-col space-y-2">
				<Button color="primary" on:click={copyToClipboard}>Copy to Clipboard</Button>
				<Button color="alternative" on:click={downloadCode}>Download</Button>
			</div>
		</div>

		<div class="col-span-2">
			<label for="export-code" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
				>Generated Code</label
			>
			<Textarea id="export-code" rows={20} bind:value={exportedCode} class="font-mono text-sm" />
		</div>
	</div>
</Modal>
