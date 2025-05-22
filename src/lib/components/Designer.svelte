<script lang="ts">
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import type { SurveyComponent } from '$lib/types/types.ts';
	import { componentsStore } from '$lib/stores/designStore.ts';
	import {
		primarySelectedComponentId,
		clearSelectionState,
		selectedComponentIds
	} from '$lib/stores/alignmentStore.ts';
	import Canvas from '$lib/components/Canvas.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import SideBarRight from '$lib/components/SideBarRight.svelte';
	import CodeSidebar from '$lib/components/CodeSidebar.svelte';
	import { initHistory } from '$lib/stores/historyStore.ts';
	import { showShortcutsDialog, showCodeSidebar } from '$lib/stores/uiStore.ts';
	import { generateFullExport } from '$lib/utils/code-export-utils.ts';
	import KcevaLogo from '$lib/components/KcevaLogo.svelte';

	function toggleShortcutsDialog() {
		showShortcutsDialog.update((value) => !value);
	}

	function toggleCodeSidebar() {
		showCodeSidebar.update((value) => !value);
	}

	const selectedComponent = derived(
		[primarySelectedComponentId, componentsStore],
		([$primaryId, $components]) => {
			if (!$primaryId) return null;
			return $components.find((c) => c.id === $primaryId) || null;
		}
	);

	let canvasComponent: Canvas;

	onMount(() => {
		clearSelectionState();
		initHistory();
	});

	function handleResetSelection() {
		clearSelectionState();
	}

	function handleExportImageRequest(event: CustomEvent<{ format: 'png' | 'jpeg' }>) {
		if (canvasComponent) {
			canvasComponent.exportCanvasAsImage(event.detail.format);
		} else {
			console.error('Canvas component reference not available for export.');
		}
	}

	function handleExportCode() {
		const selectedIds = $selectedComponentIds;
		const allComponents = $componentsStore;

		// If no components are selected, export all components
		const componentsToExport =
			selectedIds.length > 0
				? allComponents.filter((c) => selectedIds.includes(c.id))
				: allComponents;

		if (componentsToExport.length === 0) {
			alert('No components to export');
			return;
		}

		const { html, css, js } = generateFullExport(componentsToExport);

		// Create a blob with the HTML content
		const htmlBlob = new Blob([html], { type: 'text/html' });
		const cssBlob = new Blob([css], { type: 'text/css' });
		const jsBlob = new Blob([js], { type: 'text/javascript' });

		// Create download links
		const htmlLink = document.createElement('a');
		htmlLink.href = URL.createObjectURL(htmlBlob);
		htmlLink.download = 'components.html';

		const cssLink = document.createElement('a');
		cssLink.href = URL.createObjectURL(cssBlob);
		cssLink.download = 'components.css';

		const jsLink = document.createElement('a');
		jsLink.href = URL.createObjectURL(jsBlob);
		jsLink.download = 'components.js';

		// Trigger downloads
		document.body.appendChild(htmlLink);
		htmlLink.click();
		document.body.removeChild(htmlLink);

		document.body.appendChild(cssLink);
		cssLink.click();
		document.body.removeChild(cssLink);

		document.body.appendChild(jsLink);
		jsLink.click();
		document.body.removeChild(jsLink);
	}
</script>

<svelte:head></svelte:head>

<div class="flex h-screen w-screen flex-col overflow-hidden bg-white md:flex-row dark:bg-gray-900">
	<aside
		class="sidebar border-b border-gray-200 md:flex-shrink-0 md:border-r md:border-b-0 dark:border-gray-700"
	>
		<SideBar
			selectedComponent={$selectedComponent}
			on:resetSelection={handleResetSelection}
			on:exportImageRequest={handleExportImageRequest}
			on:toggleShortcutsDialog={toggleShortcutsDialog}
			on:toggleCodeSidebar={toggleCodeSidebar}
			on:exportCode={handleExportCode}
		/>
	</aside>
	<main class="flex-1 overflow-hidden">
		<Canvas bind:this={canvasComponent} selectedComponent={$selectedComponent} />
	</main>
	{#if $showCodeSidebar}
		<aside
			class="sidebar border-t border-gray-200 md:flex-shrink-0 md:border-t-0 md:border-l dark:border-gray-700"
		>
			<CodeSidebar selectedComponent={$selectedComponent} />
		</aside>
	{:else}
		<aside
			class="sidebar border-t border-gray-200 md:flex-shrink-0 md:border-t-0 md:border-l dark:border-gray-700"
		>
			<SideBarRight selectedComponent={$selectedComponent} />
		</aside>
	{/if}

	{#if $showShortcutsDialog}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<div
				class="max-h-[80vh] w-[600px] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			>
				<div class="mb-4 flex items-center justify-between">
					<div>
						<KcevaLogo size={24} />
						<h2 class="mt-1 text-xl font-bold">Keyboard Shortcuts</h2>
					</div>
					<button
						class="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
						on:click={toggleShortcutsDialog}
						aria-label="Close shortcuts dialog"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
							></line></svg
						>
					</button>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<h3 class="mb-2 font-semibold">Canvas Navigation</h3>
						<ul class="space-y-2">
							<li class="flex justify-between">
								<span>Pan Canvas</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Space + Drag</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Zoom In/Out</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + Mouse Wheel</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Reset Zoom</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + 0</kbd
								>
							</li>
						</ul>

						<h3 class="mt-4 mb-2 font-semibold">Component Manipulation</h3>
						<ul class="space-y-2">
							<li class="flex justify-between">
								<span>Move Selection</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Arrow Keys</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Move by 10px</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Shift + Arrow Keys</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Delete Selection</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Delete / Backspace</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Duplicate Selection</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + D</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Select All</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + A</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Toggle Code View</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + E</kbd
								>
							</li>
						</ul>
					</div>

					<div>
						<h3 class="mb-2 font-semibold">Add Components</h3>
						<ul class="space-y-2">
							<li class="flex justify-between">
								<span>Text</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">T</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Input</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">I</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Text Area</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">A</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Checkbox</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">C</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Radio</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">R</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Dropdown</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">D</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Section</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">S</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Title</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">H</kbd
								>
							</li>
						</ul>

						<h3 class="mt-4 mb-2 font-semibold">Other</h3>
						<ul class="space-y-2">
							<li class="flex justify-between">
								<span>Undo</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + Z</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Redo</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + Y / Ctrl + Shift + Z</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Toggle Grid Snap</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + G</kbd
								>
							</li>
							<li class="flex justify-between">
								<span>Toggle Guides</span>
								<kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700"
									>Ctrl + H</kbd
								>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.sidebar {
		height: 100vh;
		overflow-y: auto;
	}
	main {
		min-width: 300px;
		user-select: none;
		-webkit-user-select: none;
	}

	@media (max-width: 768px) {
		.sidebar {
			height: auto;
			max-height: 30vh;
			overflow-y: auto;
		}
	}

	@media (min-width: 769px) {
		.sidebar {
			height: 100vh;
			overflow-y: auto;
		}
	}
</style>
