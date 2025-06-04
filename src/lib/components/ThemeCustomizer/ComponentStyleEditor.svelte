<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ColorPicker from '$lib/components/ThemeCustomizer/ColorPicker.svelte';
	import OpacityControl from '$lib/components/ThemeCustomizer/OpacityControl.svelte';
	import GradientPicker from '$lib/components/ThemeCustomizer/GradientPicker.svelte';
	import SelectInput from '$lib/components/ThemeCustomizer/SelectInput.svelte';
	import TextInput from '$lib/components/ThemeCustomizer/TextInput.svelte';
	import { componentStyleStore } from '$lib/stores/componentStyleStore.ts';

	export let componentType: string = 'default';

	// Get the current style for this component type
	$: componentStyle = $componentStyleStore[componentType] || $componentStyleStore.default;
	$: isInputType = ['input', 'textarea', 'dropdown'].includes(componentType);

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

	const textAlignOptions = [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' },
		{ value: 'justify', label: 'Justify' }
	];

	const fontWeightOptions = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'bold', label: 'Bold' },
		{ value: '100', label: 'Thin (100)' },
		{ value: '200', label: 'Extra Light (200)' },
		{ value: '300', label: 'Light (300)' },
		{ value: '400', label: 'Regular (400)' },
		{ value: '500', label: 'Medium (500)' },
		{ value: '600', label: 'Semi Bold (600)' },
		{ value: '700', label: 'Bold (700)' },
		{ value: '800', label: 'Extra Bold (800)' },
		{ value: '900', label: 'Black (900)' }
	];

	const borderStyleOptions = [
		{ value: 'none', label: 'None' },
		{ value: 'solid', label: 'Solid' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'dotted', label: 'Dotted' },
		{ value: 'double', label: 'Double' },
		{ value: 'groove', label: 'Groove' },
		{ value: 'ridge', label: 'Ridge' },
		{ value: 'inset', label: 'Inset' },
		{ value: 'outset', label: 'Outset' }
	];

	let activeTab = 'appearance';

	function updateStyle(key: string, value: any) {
		componentStyleStore.updateComponentStyle(componentType, { [key]: value });
	}
</script>

<div class="component-style-editor">
	<div class="mb-4 border-b border-gray-200 dark:border-gray-700">
		<ul class="-mb-px flex flex-wrap">
			<li class="mr-2">
				<button
					class="inline-block p-2 text-sm {activeTab === 'appearance'
						? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
						: 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
					on:click={() => (activeTab = 'appearance')}
				>
					Appearance
				</button>
			</li>
			<li class="mr-2">
				<button
					class="inline-block p-2 text-sm {activeTab === 'typography'
						? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
						: 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
					on:click={() => (activeTab = 'typography')}
				>
					Typography
				</button>
			</li>
			<li class="mr-2">
				<button
					class="inline-block p-2 text-sm {activeTab === 'borders'
						? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
						: 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
					on:click={() => (activeTab = 'borders')}
				>
					Borders
				</button>
			</li>
			<li>
				<button
					class="inline-block p-2 text-sm {activeTab === 'spacing'
						? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
						: 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
					on:click={() => (activeTab = 'spacing')}
				>
					Spacing
				</button>
			</li>
			{#if isInputType}
				<li>
					<button
						class="inline-block p-2 text-sm {activeTab === 'states'
							? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
							: 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'}"
						on:click={() => (activeTab = 'states')}
					>
						States
					</button>
				</li>
			{/if}
		</ul>
	</div>

	<div class="mt-4">
		{#if activeTab === 'appearance'}
			<div class="space-y-4">
				<ColorPicker
					label="Background Color"
					bind:value={componentStyle.backgroundColor}
					on:change={(e) => updateStyle('backgroundColor', e.detail)}
				/>

				<OpacityControl
					label="Background Opacity"
					value={componentStyle.backgroundOpacity}
					onChange={(value) => updateStyle('backgroundOpacity', value)}
				/>

				<div class="mt-4 border-t pt-4">
					<div class="mb-3 flex items-center">
						<input
							type="checkbox"
							id="enableGradient"
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							checked={componentStyle.backgroundGradient}
							on:change={(e) =>
								updateStyle('backgroundGradient', (e.target as HTMLInputElement).checked)}
						/>
						<label for="enableGradient" class="ml-2 text-sm font-medium">
							Enable Background Gradient
						</label>
					</div>

					{#if componentStyle.backgroundGradient}
						<GradientPicker
							label="Background Gradient"
							startColor={componentStyle.backgroundGradientStart}
							endColor={componentStyle.backgroundGradientEnd}
							direction={componentStyle.backgroundGradientDirection}
							onChangeStart={(color) => updateStyle('backgroundGradientStart', color)}
							onChangeEnd={(color) => updateStyle('backgroundGradientEnd', color)}
							onChangeDirection={(direction) =>
								updateStyle('backgroundGradientDirection', direction)}
						/>
					{/if}
				</div>

				<div class="mt-4 border-t pt-4">
					<TextInput
						label="Box Shadow"
						bind:value={componentStyle.boxShadow}
						on:change={(e) => updateStyle('boxShadow', e.detail)}
						helpText="e.g., 0 1px 3px rgba(0,0,0,0.1)"
					/>

					<OpacityControl
						label="Overall Opacity"
						value={componentStyle.opacity}
						onChange={(value) => updateStyle('opacity', value)}
					/>

					<TextInput
						label="Transform"
						bind:value={componentStyle.transform}
						on:change={(e) => updateStyle('transform', e.detail)}
						helpText="e.g., scale(1.05) or translateY(-2px)"
					/>

					<TextInput
						label="Transition"
						bind:value={componentStyle.transition}
						on:change={(e) => updateStyle('transition', e.detail)}
						helpText="e.g., all 150ms ease-in-out"
					/>
				</div>
			</div>
		{:else if activeTab === 'typography'}
			<div class="space-y-4">
				<SelectInput
					label="Font Family"
					options={fontFamilyOptions}
					bind:value={componentStyle.fontFamily}
					on:change={(e) => updateStyle('fontFamily', e.detail)}
				/>

				<div class="grid grid-cols-2 gap-4">
					<TextInput
						label="Font Size"
						bind:value={componentStyle.fontSize}
						on:change={(e) => updateStyle('fontSize', e.detail)}
						helpText="e.g., 16px, 1rem"
					/>

					<SelectInput
						label="Font Weight"
						options={fontWeightOptions}
						bind:value={componentStyle.fontWeight}
						on:change={(e) => updateStyle('fontWeight', e.detail)}
					/>
				</div>

				<ColorPicker
					label="Text Color"
					bind:value={componentStyle.color}
					on:change={(e) => updateStyle('color', e.detail)}
				/>

				<SelectInput
					label="Text Align"
					options={textAlignOptions}
					bind:value={componentStyle.textAlign}
					on:change={(e) => updateStyle('textAlign', e.detail)}
				/>

				{#if isInputType}
					<div class="mt-4 border-t pt-4">
						<h4 class="mb-3 text-sm font-medium">Label Settings</h4>
						<div class="grid grid-cols-2 gap-4">
							<TextInput
								label="Label Font Size"
								bind:value={componentStyle.labelFontSize}
								on:change={(e) => updateStyle('labelFontSize', e.detail)}
								helpText="e.g., 14px, 0.875rem"
							/>

							<SelectInput
								label="Label Font Weight"
								options={fontWeightOptions}
								bind:value={componentStyle.labelFontWeight}
								on:change={(e) => updateStyle('labelFontWeight', e.detail)}
							/>
						</div>
					</div>
				{/if}
			</div>
		{:else if activeTab === 'borders'}
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<TextInput
						label="Border Width"
						bind:value={componentStyle.borderWidth}
						on:change={(e) => updateStyle('borderWidth', e.detail)}
						helpText="e.g., 1px, 2px 0 0 0"
					/>

					<SelectInput
						label="Border Style"
						options={borderStyleOptions}
						bind:value={componentStyle.borderStyle}
						on:change={(e) => updateStyle('borderStyle', e.detail)}
					/>
				</div>

				<ColorPicker
					label="Border Color"
					bind:value={componentStyle.borderColor}
					on:change={(e) => updateStyle('borderColor', e.detail)}
				/>

				<TextInput
					label="Border Radius"
					bind:value={componentStyle.borderRadius}
					on:change={(e) => updateStyle('borderRadius', e.detail)}
					helpText="e.g., 4px, 0.25rem, 50%"
				/>
			</div>
		{:else if activeTab === 'spacing'}
			<div class="space-y-4">
				<TextInput
					label="Padding"
					bind:value={componentStyle.padding}
					on:change={(e) => updateStyle('padding', e.detail)}
					helpText="e.g., 1rem, 0.5rem 1rem"
				/>

				<TextInput
					label="Margin"
					bind:value={componentStyle.margin}
					on:change={(e) => updateStyle('margin', e.detail)}
					helpText="e.g., 1rem, 0.5rem 1rem"
				/>
			</div>
		{:else if activeTab === 'states' && isInputType}
			<div class="space-y-4">
				<ColorPicker
					label="Placeholder Color"
					bind:value={componentStyle.placeholderColor}
					on:change={(e) => updateStyle('placeholderColor', e.detail)}
				/>

				<ColorPicker
					label="Focus Border Color"
					bind:value={componentStyle.focusBorderColor}
					on:change={(e) => updateStyle('focusBorderColor', e.detail)}
				/>

				<ColorPicker
					label="Error Color"
					bind:value={componentStyle.errorColor}
					on:change={(e) => updateStyle('errorColor', e.detail)}
				/>
			</div>
		{/if}
	</div>
</div>
