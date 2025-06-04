<script lang="ts">
	import { exportDesign, clearDesign, importDesign } from '$lib/stores/designStore.ts';
	import DesignerActions from '$lib/components/SideBarComponents/DesignerActions.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import type { SurveyComponent } from '$lib/types/types.ts';
	import { theme, toggleTheme } from '$lib/stores/themeStore.ts';
	import { createEventDispatcher } from 'svelte';
	import { undo, redo, canUndo, canRedo } from '$lib/stores/historyStore.ts';
	import { showCodeSidebar, showThemeCustomizer } from '$lib/stores/uiStore.ts';
	import ThemeCustomizer from '$lib/components/ThemeCustomizer/ThemeCustomizer.svelte';
	import KcevaLogo from '$lib/components/icons/KcevaLogo.svelte';

	const dispatch = createEventDispatcher<{
		resetSelection: void;
		exportImageRequest: { format: 'png' | 'jpeg' };
		toggleShortcutsDialog: void;
		toggleCodeSidebar: void;
		exportCode: void;
	}>();

	const { selectedComponent } = $props<{ selectedComponent: SurveyComponent | null }>();

	let alertColor = $state<'success' | 'error' | 'warning' | 'info'>('info');
	let alertMessage = $state('');
	let alertTimeout: number | undefined = undefined;
	let showImport = $state(false);
	let importFile: FileList | null = $state(null);

	function showAlert(message: string, color: typeof alertColor = 'info', duration: number = 3000) {
		alertMessage = message;
		alertColor = color;
		clearTimeout(alertTimeout);
		if (duration > 0) {
			alertTimeout = window.setTimeout(() => {
				alertMessage = '';
			}, duration);
		}
	}

	function handleClear() {
		if (confirm('Are you sure you want to clear the entire design? This cannot be undone.')) {
			clearDesign();
			dispatch('resetSelection');
			showAlert('Design cleared!', 'warning');
		}
	}

	function handleExport() {
		if (exportDesign()) {
			showAlert('Design exported as JSON file.', 'success');
		} else {
			showAlert('Failed to export design.', 'error');
		}
	}

	function handleImportClick() {
		showImport = !showImport;
		importFile = null;
	}

	async function processImport() {
		if (!importFile || importFile.length === 0) {
			showAlert('Please select a JSON file to import.', 'error');
			return;
		}
		const file = importFile[0];
		if (file.type !== 'application/json') {
			showAlert('Invalid file type. Please select a JSON file.', 'error');
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const jsonData = e.target?.result as string;
				if (importDesign(jsonData)) {
					dispatch('resetSelection');
					showAlert('Design imported successfully!', 'success');
					showImport = false;
					importFile = null;
				} else {
					showAlert('Failed to import design. Invalid JSON format or data.', 'error');
				}
			} catch (error: any) {
				showAlert(`Error reading or parsing file: ${error?.message || error}`, 'error');
			}
		};
		reader.onerror = () => {
			showAlert(`Error reading file: ${reader.error}`, 'error');
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
		showAlert('Generating image...', 'info', 1500);
	}

	function handleToggleShortcutsDialog() {
		dispatch('toggleShortcutsDialog');
	}

	function handleToggleCodeSidebar() {
		dispatch('toggleCodeSidebar');
	}

	function handleExportCode() {
		dispatch('exportCode');
		showAlert('Exporting component code...', 'info', 1500);
	}

	function handleToggleThemeCustomizer() {
		showThemeCustomizer.update((value) => !value);
	}
</script>

<div
	bind:this={sidebarEl}
	class="sidebar-left-container allow-input relative h-full overflow-y-auto bg-gray-50 p-4 pr-6 dark:bg-gray-800 dark:text-gray-300"
	style="width: {sidebarWidth}px;"
>
	<button
		type="button"
		class="resize-handle"
		aria-label="Resize sidebar"
		onmousedown={handleResizeStart}
		ontouchstart={handleResizeStart}
	></button>
	<div class="Left_Sidebar_Header">
		<div class="flex items-center gap-2">
			<!-- <h1 class="Logo">Kceva</h1> -->
			<KcevaLogo />
		</div>
		<div class="Main_Properties_Row">
			<button
				type="button"
				aria-label="Theme customizer"
				class="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700 {$showThemeCustomizer
					? 'bg-gray-200 dark:bg-gray-700'
					: ''}"
				onclick={handleToggleThemeCustomizer}
				title="Theme Customizer"
			>
				<svg
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
					></path>
				</svg>
				<span class="sr-only">Open theme customizer</span>
			</button>
			<button
				type="button"
				aria-label="Toggle code view"
				class="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700 {$showCodeSidebar
					? 'bg-gray-200 dark:bg-gray-700'
					: ''}"
				onclick={handleToggleCodeSidebar}
				title="Toggle code view (Ctrl+E)"
			>
				<svg
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					></path>
				</svg>
				<span class="sr-only">Toggle code view</span>
			</button>
			<button
				type="button"
				aria-label="Keyboard shortcuts"
				class="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
				onclick={handleToggleShortcutsDialog}
			>
				<svg
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
					></path>
				</svg>
				<span class="sr-only">Show keyboard shortcuts</span>
			</button>
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
						aria-hidden="true"
						><path
							d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
							fill-rule="evenodd"
							clip-rule="evenodd"
						></path></svg
					>
					<span class="sr-only">Switch to light mode</span>
				{:else}
					<svg
						class="h-5 w-5"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
						></path></svg
					>
					<span class="sr-only">Switch to dark mode</span>
				{/if}
			</button>
		</div>
	</div>
	<div class="mt-6 mb-4 border-t pt-4 dark:border-gray-700">
		<h3 class="mb-2 text-lg font-medium">Actions</h3>
		<DesignerActions
			onClear={handleClear}
			onUndo={undo}
			onRedo={redo}
			canUndo={$canUndo}
			canRedo={$canRedo}
		/>
		<div class="mt-2 grid grid-cols-2 gap-2">
			<button
				class="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				onclick={handleExport}
			>
				Export JSON
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				onclick={handleImportClick}
			>
				{showImport ? 'Cancel Import' : 'Import JSON'}
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				onclick={() => requestImageExport('png')}
			>
				Export PNG
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				onclick={() => requestImageExport('jpeg')}
			>
				Export JPG
			</button>
		</div>

		<div class="mt-4">
			<h3 class="mb-2 text-lg font-medium">Code Export</h3>
			<div class="grid grid-cols-1 gap-2">
				<button
					class="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					onclick={handleExportCode}
				>
					Export Component Code
				</button>
				<button
					class="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 {$showCodeSidebar
						? 'bg-gray-200 dark:bg-gray-700'
						: ''}"
					onclick={handleToggleCodeSidebar}
				>
					{$showCodeSidebar ? 'Hide Code View' : 'Show Code View'}
				</button>
			</div>
		</div>

		{#if showImport}
			<div class="mt-3 rounded border bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700">
				<div class="mb-2">
					<label for="import-file" class="mb-1 block text-sm font-medium">
						Select JSON file:
					</label>
					<input
						type="file"
						id="import-file"
						accept="application/json"
						class="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
						bind:files={importFile}
					/>
				</div>
				<button
					class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
					onclick={processImport}
					disabled={!importFile || importFile.length === 0}
				>
					Upload and Import
				</button>
			</div>
		{/if}
	</div>
	{#if alertMessage}
		<div class="sticky bottom-0 mt-4 p-1">
			<Alert message={alertMessage} type={alertColor} onDismiss={() => (alertMessage = '')} />
		</div>
	{/if}
</div>

{#if $showThemeCustomizer}
	<ThemeCustomizer isOpen={$showThemeCustomizer} />
{/if}

<style>
	@media (max-width: 768px) {
		.sidebar-left-container {
			width: 100% !important;
			padding: 0.5rem;
		}

		.resize-handle {
			display: none;
		}
	}

	.Left_Sidebar_Header {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: self-start;
	}
	.Main_Properties_Row {
		margin-top: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.resize-handle {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		height: 100%;
		width: 0.3rem;
		cursor: col-resize;
		touch-action: none;
		background-color: #e5e7eb; /* gray-200 */

		/* Optional: Transition for hover effect */
		transition: background-color 0.2s ease;
	}

	/* Hover effect for light mode */
	.resize-handle:hover {
		background-color: #d1d5db; /* gray-300 */
	}

	/* Dark mode styles */
	@media (prefers-color-scheme: dark) {
		.resize-handle {
			background-color: #4b5563; /* gray-600 */
		}
		.resize-handle:hover {
			background-color: #6b7280; /* gray-500 */
		}
	}
</style>
