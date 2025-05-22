<script lang="ts">
	import {
		themeStore,
		type ThemeSettings,
		predefinedThemes,
		saveCustomTheme,
		loadCustomThemes,
		deleteCustomTheme
	} from '$lib/stores/themeCustomizerStore.ts';
	import { componentStyleStore } from '$lib/stores/componentStyleStore.ts';
	import ColorPicker from './ColorPicker.svelte';
	import RangeSlider from './RangeSlider.svelte';
	import SelectInput from './SelectInput.svelte';
	import TextInput from './TextInput.svelte';
	import ComponentStyleEditor from './ComponentStyleEditor.svelte';
	import { theme } from '$lib/stores/themeStore.ts';
	import { showThemeCustomizer } from '$lib/stores/uiStore.ts';
	import GradientPicker from './GradientPicker.svelte';
	import OpacityControl from './OpacityControl.svelte';
	import KcevaLogo from '$lib/components/KcevaLogo.svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { componentsStore } from '$lib/stores/designStore.ts';
	import type { SurveyComponent } from '$lib/types/types.ts';
	import SurveyComponentPreview from './SurveyComponentPreview.svelte';

	export let isOpen = false;

	// Font family options
	const fontFamilyOptions = [
		{ value: 'Arial, sans-serif', label: 'Arial' },
		{ value: 'Helvetica, sans-serif', label: 'Helvetica' },
		{ value: 'Times New Roman, serif', label: 'Times New Roman' },
		{ value: 'Georgia, serif', label: 'Georgia' },
		{ value: 'Courier New, monospace', label: 'Courier New' },
		{ value: 'Verdana, sans-serif', label: 'Verdana' },
		{ value: 'Inter, sans-serif', label: 'Inter' },
		{ value: 'Roboto, sans-serif', label: 'Roboto' },
		{ value: 'Open Sans, sans-serif', label: 'Open Sans' },
		{ value: 'Montserrat, sans-serif', label: 'Montserrat' },
		{ value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' }
	];

	// Predefined theme options
	const themeOptions = Object.keys(predefinedThemes).map((key) => ({
		value: key,
		label: key.charAt(0).toUpperCase() + key.slice(1)
	}));

	// Component types for direct customization
	const componentTypes = [
		{ value: 'default', label: 'All Components (Default)' },
		{ value: 'input', label: 'Input Fields' },
		{ value: 'textarea', label: 'Text Areas' },
		{ value: 'checkbox', label: 'Checkboxes' },
		{ value: 'radio', label: 'Radio Buttons' },
		{ value: 'dropdown', label: 'Dropdown Fields' },
		{ value: 'fileUpload', label: 'File Upload' },
		{ value: 'fileAttachment', label: 'File Attachment' },
		{ value: 'text', label: 'Text Component' },
		{ value: 'title', label: 'Title' },
		{ value: 'section', label: 'Section' },
		{ value: 'introduction', label: 'Introduction' },
		{ value: 'matrix', label: 'Matrix' },
		{ value: 'rating', label: 'Rating' }
	];

	let selectedPredefinedTheme = 'default';
	let customThemes = [];
	let customComponentThemes = [];
	let newThemeName = '';
	let newComponentThemeName = '';
	let activeTab = 'global';
	let selectedComponentType = 'default';

	// Sample components for preview
	let previewComponents: { [key: string]: SurveyComponent } = {};

	// Load themes and generate preview components on mount
	onMount(() => {
		customThemes = loadCustomThemes();
		customComponentThemes = componentStyleStore.loadCustomThemes();

		// Generate preview components for each component type
		componentTypes.forEach((type) => {
			if (type.value !== 'default') {
				previewComponents[type.value] = createPreviewComponent(type.value);
			}
		});
	});

	// Create sample components for preview with all required properties
	function createPreviewComponent(type: string): SurveyComponent {
		// Base component properties with all required fields
		const base: SurveyComponent = {
			id: `preview-${type}`,
			type: type as any,
			x: 0,
			y: 0,
			width: 200,
			height: 40,
			label: `${type.charAt(0).toUpperCase() + type.slice(1)} Preview`,
			fontSize: 14,
			fontFamily: 'Arial, sans-serif',
			color: '#333333',
			bgColor: '#ffffff',
			required: false,
			fontWeight: 'normal'
		};

		// Customize based on component type
		switch (type) {
			case 'input':
				return {
					...base,
					placeholder: 'Enter text...',
					required: true
				};
			case 'textarea':
				return {
					...base,
					height: 100,
					placeholder: 'Enter longer text...',
					rows: 4 as number // Explicitly type as number
				};
			case 'checkbox':
				return {
					...base,
					options: ['Option 1', 'Option 2'],
					required: false
				};
			case 'radio':
				return {
					...base,
					options: ['Option 1', 'Option 2', 'Option 3'],
					required: true
				};
			case 'dropdown':
				return {
					...base,
					options: ['Option 1', 'Option 2', 'Option 3'],
					placeholder: 'Select an option'
				};
			case 'fileUpload':
				return {
					...base,
					acceptedFileTypes: '.pdf,.jpg,.png',
					maxFileSize: 5
				};
			case 'fileAttachment':
				return {
					...base,
					src: '/path/to/example.pdf'
				};
			case 'title':
				return {
					...base,
					label: 'Survey Title',
					fontSize: 24,
					fontWeight: 'bold'
				};
			case 'section':
				return {
					...base,
					label: 'Section Heading',
					description: 'Section description text',
					fontSize: 18
				};
			case 'introduction':
				return {
					...base,
					height: 120,
					label: 'Introduction',
					text: 'Welcome to this survey. Please answer all questions truthfully.'
				};
			case 'matrix':
				return {
					...base,
					height: 150,
					rows: ['Row 1', 'Row 2'] as string[], // Explicitly type as string[]
					columns: ['Col 1', 'Col 2', 'Col 3']
				};
			case 'rating':
				return {
					...base,
					label: 'Rate This Item',
					maxRating: 5,
					required: true
				};
			default:
				return {
					...base,
					label: 'Text Component'
				};
		}
	}

	function applyPredefinedTheme() {
		themeStore.applyTheme(selectedPredefinedTheme as keyof typeof predefinedThemes);
	}

	function resetTheme() {
		if (confirm('Are you sure you want to reset all theme settings to default?')) {
			themeStore.reset();
			selectedPredefinedTheme = 'default';
		}
	}

	function resetComponentStyles() {
		if (confirm('Are you sure you want to reset all component styles to default?')) {
			componentStyleStore.resetStyles();
		}
	}

	function handleClose() {
		showThemeCustomizer.set(false);
	}

	function handleSaveTheme() {
		if (!newThemeName.trim()) {
			alert('Please enter a name for your theme');
			return;
		}

		saveCustomTheme(newThemeName, get(themeStore));
		newThemeName = '';
		customThemes = loadCustomThemes();
	}

	function handleSaveComponentTheme() {
		if (!newComponentThemeName.trim()) {
			alert('Please enter a name for your component theme');
			return;
		}

		componentStyleStore.saveCustomTheme(newComponentThemeName);
		newComponentThemeName = '';
		customComponentThemes = componentStyleStore.loadCustomThemes();
	}

	function handleApplyCustomTheme(themeName: string) {
		const customTheme = customThemes.find((t) => t.name === themeName);
		if (customTheme) {
			themeStore.applyCustomTheme(customTheme.settings);
		}
	}

	function handleApplyCustomComponentTheme(themeName: string) {
		componentStyleStore.applyCustomTheme(themeName);
		customComponentThemes = componentStyleStore.loadCustomThemes();
	}

	function handleDeleteCustomTheme(themeName: string) {
		if (confirm(`Are you sure you want to delete the theme "${themeName}"?`)) {
			deleteCustomTheme(themeName);
			customThemes = loadCustomThemes();
		}
	}

	function handleDeleteCustomComponentTheme(themeName: string) {
		if (confirm(`Are you sure you want to delete the component theme "${themeName}"?`)) {
			componentStyleStore.deleteCustomTheme(themeName);
			customComponentThemes = componentStyleStore.loadCustomThemes();
		}
	}

	// Handle keyboard events for accessibility
	function handleKeyDown(event: KeyboardEvent, callback: () => void) {
		if (event.key === 'Enter' || event.key === ' ') {
			callback();
		}
	}
</script>

<div
	class="bg-opacity-50 fixed inset-0 z-[100] flex items-center justify-center bg-black"
	class:hidden={!isOpen}
>
	<div
		class="relative max-h-[90vh] w-[800px] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
	>
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<KcevaLogo size={32} />
				<h2 class="text-xl font-bold text-gray-900 dark:text-white">Theme Customizer</h2>
			</div>
			<button
				class="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
				on:click={handleClose}
				aria-label="Close theme customizer"
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
					aria-hidden="true"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>

		<!-- Main tabs -->
		<div class="mb-4 border-b border-gray-200 dark:border-gray-700">
			<ul class="-mb-px flex flex-wrap">
				<li class="mr-2">
					<button
						class="inline-block p-4 {activeTab === 'global'
							? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
							: 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
						on:click={() => (activeTab = 'global')}
					>
						Global Theme
					</button>
				</li>
				<li class="mr-2">
					<button
						class="inline-block p-4 {activeTab === 'components'
							? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
							: 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
						on:click={() => (activeTab = 'components')}
					>
						Component Styles
					</button>
				</li>
				<li>
					<button
						class="inline-block p-4 {activeTab === 'presets'
							? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
							: 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
						on:click={() => (activeTab = 'presets')}
					>
						Theme Presets
					</button>
				</li>
			</ul>
		</div>

		{#if activeTab === 'global'}
			<!-- Global Theme Management Section -->
			<div class="mb-6 rounded border border-gray-200 p-4 dark:border-gray-700">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Global Theme</h3>

				<div class="mb-4 grid grid-cols-2 gap-4">
					<div>
						<h4 class="mb-2 text-sm font-medium">Predefined Themes</h4>
						<div class="flex items-center gap-2">
							<SelectInput label="" options={themeOptions} bind:value={selectedPredefinedTheme} />
							<button
								class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
								on:click={applyPredefinedTheme}
							>
								Apply
							</button>
						</div>
					</div>

					<div>
						<h4 class="mb-2 text-sm font-medium">Save Current Theme</h4>
						<div class="flex items-center gap-2">
							<input
								type="text"
								placeholder="Theme name"
								bind:value={newThemeName}
								class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<button
								class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
								on:click={handleSaveTheme}
							>
								Save
							</button>
						</div>
					</div>
				</div>

				{#if customThemes.length > 0}
					<div class="mt-4">
						<h4 class="mb-2 text-sm font-medium">Your Custom Themes</h4>
						<div
							class="max-h-40 overflow-y-auto rounded border border-gray-200 p-2 dark:border-gray-700"
						>
							{#each customThemes as customTheme}
								<div
									class="mb-2 flex items-center justify-between rounded bg-gray-100 p-2 dark:bg-gray-700"
								>
									<span class="font-medium">{customTheme.name}</span>
									<div class="flex gap-2">
										<button
											class="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
											on:click={() => handleApplyCustomTheme(customTheme.name)}
										>
											Apply
										</button>
										<button
											class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
											on:click={() => handleDeleteCustomTheme(customTheme.name)}
										>
											Delete
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="mt-4 flex justify-end">
					<button
						class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
						on:click={resetTheme}
					>
						Reset to Default
					</button>
				</div>
			</div>

			<!-- Global Colors Section -->
			<div class="rounded border border-gray-200 p-4 dark:border-gray-700">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Primary Colors</h3>

				<div class="grid grid-cols-2 gap-4">
					<ColorPicker
						label="Primary Color"
						bind:value={$themeStore.primaryColor}
						on:change={(e) => themeStore.updateSetting('primaryColor', e.detail)}
					/>

					<ColorPicker
						label="Secondary Color"
						bind:value={$themeStore.secondaryColor}
						on:change={(e) => themeStore.updateSetting('secondaryColor', e.detail)}
					/>

					<ColorPicker
						label="Accent Color"
						bind:value={$themeStore.accentColor}
						on:change={(e) => themeStore.updateSetting('accentColor', e.detail)}
					/>

					<ColorPicker
						label="Text Color"
						bind:value={$themeStore.textColor}
						on:change={(e) => themeStore.updateSetting('textColor', e.detail)}
					/>

					<ColorPicker
						label="Background Color"
						bind:value={$themeStore.backgroundColor}
						on:change={(e) => themeStore.updateSetting('backgroundColor', e.detail)}
					/>

					<ColorPicker
						label="Border Color"
						bind:value={$themeStore.borderColor}
						on:change={(e) => themeStore.updateSetting('borderColor', e.detail)}
					/>
				</div>
			</div>

			<!-- Status Colors Section -->
			<div class="mt-4 rounded border border-gray-200 p-4 dark:border-gray-700">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Status Colors</h3>

				<div class="grid grid-cols-2 gap-4">
					<ColorPicker
						label="Error Color"
						bind:value={$themeStore.errorColor}
						on:change={(e) => themeStore.updateSetting('errorColor', e.detail)}
					/>

					<ColorPicker
						label="Success Color"
						bind:value={$themeStore.successColor}
						on:change={(e) => themeStore.updateSetting('successColor', e.detail)}
					/>

					<ColorPicker
						label="Warning Color"
						bind:value={$themeStore.warningColor}
						on:change={(e) => themeStore.updateSetting('warningColor', e.detail)}
					/>

					<ColorPicker
						label="Info Color"
						bind:value={$themeStore.infoColor}
						on:change={(e) => themeStore.updateSetting('infoColor', e.detail)}
					/>
				</div>
			</div>

			<!-- Canvas/App Colors Section -->
			<div class="mt-4 rounded border border-gray-200 p-4 dark:border-gray-700">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Application Colors</h3>

				<div class="grid grid-cols-1 gap-4">
					<ColorPicker
						label="Canvas Background Color"
						bind:value={$themeStore.canvasBackgroundColor}
						on:change={(e) => themeStore.updateSetting('canvasBackgroundColor', e.detail)}
						helpText="Background color for the canvas in light mode"
					/>

					<ColorPicker
						label="Dark Mode Background"
						bind:value={$themeStore.darkModeBackgroundColor}
						on:change={(e) => themeStore.updateSetting('darkModeBackgroundColor', e.detail)}
						helpText="Background color for dark mode"
					/>

					<ColorPicker
						label="Dark Mode Text"
						bind:value={$themeStore.darkModeTextColor}
						on:change={(e) => themeStore.updateSetting('darkModeTextColor', e.detail)}
						helpText="Text color for dark mode"
					/>
				</div>
			</div>

			<!-- Typography Section -->
			<div class="mt-4 rounded border border-gray-200 p-4 dark:border-gray-700">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Typography</h3>

				<div class="grid grid-cols-2 gap-4">
					<SelectInput
						label="Font Family"
						options={fontFamilyOptions}
						bind:value={$themeStore.fontFamily}
						on:change={(e) => themeStore.updateSetting('fontFamily', e.detail)}
					/>

					<SelectInput
						label="Heading Font Family"
						options={fontFamilyOptions}
						bind:value={$themeStore.headingFontFamily}
						on:change={(e) => themeStore.updateSetting('headingFontFamily', e.detail)}
					/>

					<TextInput
						label="Font Size"
						bind:value={$themeStore.fontSize}
						on:change={(e) => themeStore.updateSetting('fontSize', e.detail)}
						helpText="e.g., 16px, 1rem"
					/>

					<TextInput
						label="Heading Font Size"
						bind:value={$themeStore.headingFontSize}
						on:change={(e) => themeStore.updateSetting('headingFontSize', e.detail)}
						helpText="e.g., 24px, 1.5rem"
					/>
				</div>
			</div>
		{:else if activeTab === 'components'}
			<!-- Component Style Management Section -->
			<div class="mb-6 rounded border border-gray-200 p-4 dark:border-gray-700">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Component Styles</h3>

				<div class="mb-4 grid grid-cols-2 gap-4">
					<div>
						<h4 class="mb-2 text-sm font-medium">Component Type</h4>
						<div class="flex items-center gap-2">
							<SelectInput label="" options={componentTypes} bind:value={selectedComponentType} />
						</div>
					</div>

					<div>
						<h4 class="mb-2 text-sm font-medium">Save Component Styles</h4>
						<div class="flex items-center gap-2">
							<input
								type="text"
								placeholder="Theme name"
								bind:value={newComponentThemeName}
								class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<button
								class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
								on:click={handleSaveComponentTheme}
							>
								Save
							</button>
						</div>
					</div>
				</div>

				{#if customComponentThemes.length > 0}
					<div class="mt-4">
						<h4 class="mb-2 text-sm font-medium">Your Component Style Presets</h4>
						<div
							class="max-h-40 overflow-y-auto rounded border border-gray-200 p-2 dark:border-gray-700"
						>
							{#each customComponentThemes as customTheme}
								<div
									class="mb-2 flex items-center justify-between rounded bg-gray-100 p-2 dark:bg-gray-700"
								>
									<span class="font-medium">{customTheme.name}</span>
									<div class="flex gap-2">
										<button
											class="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
											on:click={() => handleApplyCustomComponentTheme(customTheme.name)}
										>
											Apply
										</button>
										<button
											class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
											on:click={() => handleDeleteCustomComponentTheme(customTheme.name)}
										>
											Delete
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="mt-4 flex justify-end">
					<button
						class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
						on:click={resetComponentStyles}
					>
						Reset to Default
					</button>
				</div>
			</div>

			<!-- Component Preview -->
			{#if selectedComponentType !== 'default' && previewComponents[selectedComponentType]}
				<div class="mb-6 rounded border border-gray-200 p-4 dark:border-gray-700">
					<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Preview</h3>
					<div class="rounded bg-gray-100 p-4 dark:bg-gray-700">
						<SurveyComponentPreview component={previewComponents[selectedComponentType]} />
					</div>
				</div>
			{/if}

			<!-- Component Style Editor -->
			<div class="rounded border border-gray-200 p-4 dark:border-gray-700">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
					Style Editor:
					{componentTypes.find((t) => t.value === selectedComponentType)?.label || 'Default'}
				</h3>
				<ComponentStyleEditor componentType={selectedComponentType} />
			</div>
		{:else if activeTab === 'presets'}
			<!-- Theme Presets Section -->
			<div class="rounded border border-gray-200 p-4 dark:border-gray-700">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Theme Presets</h3>

				<div class="grid grid-cols-2 gap-6">
					{#each Object.entries(predefinedThemes) as [themeName, themeSettings]}
						<button
							class="cursor-pointer rounded-lg border p-4 text-left transition-all hover:shadow-md {selectedPredefinedTheme ===
							themeName
								? 'border-blue-500 ring-2 ring-blue-200'
								: 'border-gray-200 dark:border-gray-700'}"
							on:click={() => {
								selectedPredefinedTheme = themeName;
								applyPredefinedTheme();
							}}
							on:keydown={(e) =>
								handleKeyDown(e, () => {
									selectedPredefinedTheme = themeName;
									applyPredefinedTheme();
								})}
							tabindex="0"
							aria-pressed={selectedPredefinedTheme === themeName}
						>
							<h4 class="mb-2 font-medium">
								{themeName.charAt(0).toUpperCase() + themeName.slice(1)}
							</h4>
							<div class="grid grid-cols-3 gap-2">
								{#each ['primaryColor', 'secondaryColor', 'accentColor', 'textColor', 'backgroundColor', 'borderColor'] as colorKey}
									<div class="flex flex-col items-center">
										<div
											class="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
											style="background-color: {themeSettings[colorKey]};"
										></div>
										<span class="mt-1 text-xs">
											{colorKey
												.replace(/([A-Z])/g, ' $1')
												.replace(/^./, (str) => str.toUpperCase())}
										</span>
									</div>
								{/each}
							</div>
							<div class="mt-3 flex justify-between">
								<div class="flex flex-col">
									<span class="text-xs font-medium">Font</span>
									<span class="text-xs">{themeSettings.fontFamily.split(',')[0]}</span>
								</div>
								<div class="flex flex-col">
									<span class="text-xs font-medium">Border Radius</span>
									<span class="text-xs">{themeSettings.borderRadius}</span>
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Custom Theme Presets -->
			{#if customThemes.length > 0}
				<div class="mt-6 rounded border border-gray-200 p-4 dark:border-gray-700">
					<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Your Custom Themes</h3>

					<div class="grid grid-cols-2 gap-6">
						{#each customThemes as customTheme}
							<div
								class="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md dark:border-gray-700"
							>
								<div class="mb-2 flex items-center justify-between">
									<h4 class="font-medium">{customTheme.name}</h4>
									<div class="flex gap-2">
										<button
											class="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
											on:click={() => handleApplyCustomTheme(customTheme.name)}
										>
											Apply
										</button>
										<button
											class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
											on:click={() => handleDeleteCustomTheme(customTheme.name)}
										>
											Delete
										</button>
									</div>
								</div>
								<div class="grid grid-cols-3 gap-2">
									{#each ['primaryColor', 'secondaryColor', 'accentColor', 'textColor', 'backgroundColor', 'borderColor'] as colorKey}
										{#if customTheme.settings[colorKey]}
											<div class="flex flex-col items-center">
												<div
													class="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
													style="background-color: {customTheme.settings[colorKey]};"
												></div>
												<span class="mt-1 text-xs">
													{colorKey
														.replace(/([A-Z])/g, ' $1')
														.replace(/^./, (str) => str.toUpperCase())}
												</span>
											</div>
										{/if}
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Component Style Presets -->
			{#if customComponentThemes.length > 0}
				<div class="mt-6 rounded border border-gray-200 p-4 dark:border-gray-700">
					<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
						Component Style Presets
					</h3>

					<div class="grid grid-cols-2 gap-6">
						{#each customComponentThemes as customTheme}
							<div
								class="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md dark:border-gray-700"
							>
								<div class="mb-2 flex items-center justify-between">
									<h4 class="font-medium">{customTheme.name}</h4>
									<div class="flex gap-2">
										<button
											class="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
											on:click={() => handleApplyCustomComponentTheme(customTheme.name)}
										>
											Apply
										</button>
										<button
											class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
											on:click={() => handleDeleteCustomComponentTheme(customTheme.name)}
										>
											Delete
										</button>
									</div>
								</div>
								<div class="mt-2 text-sm">
									<p>Click to apply this component style preset</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
