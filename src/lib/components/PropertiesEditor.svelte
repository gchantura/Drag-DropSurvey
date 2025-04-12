<!-- lib/components/PropertiesEditor.svelte -->
<script lang="ts">
	import { Label, Checkbox } from 'flowbite-svelte';

	import {
		updateComponent,
		addOption,
		updateOption,
		removeOption,
		removeComponent
	} from '../stores/surveyStore.js';
	import type { SurveyComponent } from '../types/survey.js';

	export let component: SurveyComponent | null = null;

	const fontFamilies = ['Arial', 'Times New Roman', 'Helvetica', 'Courier New', 'Georgia'];
	const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];
	const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
	const bgColors = ['transparent', '#FFFFFF', '#F0F0F0', '#FFE0E0', '#E0FFE0', '#E0E0FF'];

	function handleInputChange(e: Event, field: string) {
		if (!component) return;

		const target = e.target as HTMLInputElement;
		const value =
			target.type === 'checkbox'
				? target.checked
				: target.type === 'number'
					? parseFloat(target.value)
					: target.value;

		updateComponent(component.id, { [field]: value });
	}
</script>

{#if component}
	<div class="rounded border bg-white p-3">
		<h3 class="mb-2 text-lg font-semibold">Properties</h3>

		<!-- Text/Label editor -->
		<div class="mb-3">
			<label for="comp-label-input" class="mb-1 block text-sm font-medium">Label:</label>
			<input
				id="comp-label-input"
				type="text"
				class="w-full rounded border p-1"
				value={component.label}
				on:input={(e) => handleInputChange(e, 'label')}
			/>
		</div>

		<!-- Font family -->
		<div class="mb-3">
			<label for="comp-font-family" class="mb-1 block text-sm font-medium">Font Family:</label>
			<select
				id="comp-font-family"
				class="w-full rounded border p-1"
				value={component.fontFamily}
				on:change={(e) => handleInputChange(e, 'fontFamily')}
			>
				{#each fontFamilies as font}
					<option value={font}>{font}</option>
				{/each}
			</select>
		</div>

		<!-- Font size -->
		<div class="mb-3">
			<label for="comp-font-size" class="mb-1 block text-sm font-medium">Font Size:</label>
			<select
				id="comp-font-size"
				class="w-full rounded border p-1"
				value={component.fontSize}
				on:change={(e) => handleInputChange(e, 'fontSize')}
			>
				{#each fontSizes as size}
					<option value={size}>{size}px</option>
				{/each}
			</select>
		</div>

		<!-- Text color -->
		<div class="mb-3">
			<label for="comp-text-color" class="mb-1 block text-sm font-medium">Text Color:</label>
			<div class="flex items-center">
				<input
					id="comp-text-color"
					type="color"
					class="mr-2"
					value={component.color}
					on:input={(e) => handleInputChange(e, 'color')}
				/>
				<input
					id="comp-text-color-hex"
					type="text"
					class="flex-1 rounded border p-1"
					value={component.color}
					on:input={(e) => handleInputChange(e, 'color')}
				/>
			</div>
		</div>

		<!-- Background color -->
		<div class="mb-3">
			<label for="comp-bg-color" class="mb-1 block text-sm font-medium">Background Color:</label>
			<div class="flex items-center">
				<input
					id="comp-bg-color"
					type="color"
					class="mr-2"
					value={component.bgColor}
					on:input={(e) => handleInputChange(e, 'bgColor')}
				/>
				<input
					id="comp-bg-color-hex"
					type="text"
					class="flex-1 rounded border p-1"
					value={component.bgColor}
					on:input={(e) => handleInputChange(e, 'bgColor')}
				/>
			</div>
		</div>

		<!-- Required field -->
		<div class="mb-3 flex items-center">
			<Label color="red" class="mt-4 flex items-center font-bold">
				<Checkbox
					type="checkbox"
					id="required-field"
					class="mr-2"
					checked={component.required}
					on:change={(e) => handleInputChange(e, 'required')}
				/> Required
			</Label>
		</div>

		<!-- Options for multi-choice components -->
		{#if ['checkbox', 'radio', 'dropdown'].includes(component.type)}
			<div class="mb-3">
				<span class="mb-1 block text-sm font-medium">Options:</span>
				<ul class="space-y-2">
					{#each component.options as option, i}
						<li class="flex items-center">
							<input
								type="text"
								id={`option-${i}-${component.id}`}
								class="mr-2 flex-1 rounded border p-1"
								value={option}
								on:input={(e) =>
									updateOption(component.id, i, (e.target as HTMLInputElement).value)}
							/>
							<button
								class="rounded bg-red-500 p-1 text-white"
								on:click={() => removeOption(component.id, i)}
								aria-label={`Remove option ${i + 1}`}
							>
								×
							</button>
						</li>
					{/each}
					<li>
						<button
							class="w-full rounded bg-blue-500 p-1 text-white"
							on:click={() => addOption(component.id)}
						>
							Add Option
						</button>
					</li>
				</ul>
			</div>
		{/if}

		<!-- Position and size -->
		<div class="mb-3 grid grid-cols-2 gap-2">
			<div>
				<label for="comp-x" class="mb-1 block text-sm font-medium">X:</label>
				<input
					id="comp-x"
					type="number"
					class="w-full rounded border p-1"
					value={component.x}
					on:input={(e) => handleInputChange(e, 'x')}
				/>
			</div>
			<div>
				<label for="comp-y" class="mb-1 block text-sm font-medium">Y:</label>
				<input
					id="comp-y"
					type="number"
					class="w-full rounded border p-1"
					value={component.y}
					on:input={(e) => handleInputChange(e, 'y')}
				/>
			</div>
			<div>
				<label for="comp-width" class="mb-1 block text-sm font-medium">Width:</label>
				<input
					id="comp-width"
					type="number"
					class="w-full rounded border p-1"
					value={component.width}
					on:input={(e) => handleInputChange(e, 'width')}
				/>
			</div>
			<div>
				<label for="comp-height" class="mb-1 block text-sm font-medium">Height:</label>
				<input
					id="comp-height"
					type="number"
					class="w-full rounded border p-1"
					value={component.height}
					on:input={(e) => handleInputChange(e, 'height')}
				/>
			</div>
		</div>

		<!-- Delete component -->
		<button
			class="w-full rounded bg-red-600 p-2 text-white"
			on:click={() => removeComponent(component.id)}
		>
			Delete Component
		</button>
	</div>
{/if}
