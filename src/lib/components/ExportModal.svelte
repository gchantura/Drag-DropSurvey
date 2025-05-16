<script lang="ts">
	import { Button, Modal, Select, Checkbox, Textarea, Tabs, TabItem } from 'flowbite-svelte';
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
	let splitFiles = false;
	let exportedFiles: { name: string; content: string }[] = [];
	let activeTab = 0;

	function handleClose() {
		dispatch('close');
	}

	function generateExport() {
		const settings = {
			format: exportFormat,
			includeStyles,
			includeValidation,
			includeFramework,
			minify,
			splitFiles
		};

		exportSettingsStore.set(settings);

		const result = exportSurveyAsCode(exportFormat, settings);

		if (result && 'files' in result) {
			exportedFiles = result.files;
			activeTab = 0;
		}
	}

	function copyToClipboard(content: string) {
		if (content) {
			navigator.clipboard
				.writeText(content)
				.then(() => {
					alert('Code copied to clipboard!');
				})
				.catch((err) => {
					console.error('Failed to copy code: ', err);
					alert('Failed to copy code. Please try again or copy manually.');
				});
		}
	}

	function downloadFile(file: { name: string; content: string }) {
		if (!file.content) return;

		let mimeType = 'text/plain';
		if (file.name.endsWith('.html')) mimeType = 'text/html';
		if (file.name.endsWith('.css')) mimeType = 'text/css';
		if (file.name.endsWith('.js')) mimeType = 'text/javascript';
		if (file.name.endsWith('.json')) mimeType = 'application/json';
		if (file.name.endsWith('.jsx')) mimeType = 'text/javascript';

		const blob = new Blob([file.content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = file.name;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	}

	function downloadAllFiles() {
		// Create a download link for each file
		exportedFiles.forEach((file) => {
			downloadFile(file);
		});
	}

	$: if (open) {
		generateExport();
	}

	$: if (
		exportFormat ||
		includeStyles ||
		includeValidation ||
		includeFramework ||
		minify ||
		splitFiles
	) {
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

				<div class="flex items-center">
					<Checkbox id="split-files" bind:checked={splitFiles} />
					<label for="split-files" class="ml-2 text-sm text-gray-900 dark:text-white"
						>Split HTML/CSS/JS Files</label
					>
				</div>
			</div>

			<div class="flex flex-col space-y-2">
				<Button color="primary" on:click={downloadAllFiles}>
					Download {exportedFiles.length > 1 ? 'All Files' : 'File'}
				</Button>
			</div>
		</div>

		<div class="col-span-2">
			{#if exportedFiles.length > 0}
				<Tabs active={activeTab} on:activeTabChange={(e) => (activeTab = e.detail)}>
					{#each exportedFiles as file, i}
						<TabItem title={file.name}>
							<div class="mb-2 flex justify-between">
								<span class="text-sm font-medium">{file.name}</span>
								<div class="space-x-2">
									<Button
										size="xs"
										color="alternative"
										on:click={() => copyToClipboard(file.content)}
									>
										Copy
									</Button>
									<Button size="xs" color="alternative" on:click={() => downloadFile(file)}>
										Download
									</Button>
								</div>
							</div>
							<Textarea
								id={`export-code-${i}`}
								rows={20}
								value={file.content}
								class="font-mono text-sm"
								readonly
							/>
						</TabItem>
					{/each}
				</Tabs>
			{:else}
				<div class="p-4 text-center">
					<p>No export files generated. Please check your settings and try again.</p>
				</div>
			{/if}
		</div>
	</div>
</Modal>
