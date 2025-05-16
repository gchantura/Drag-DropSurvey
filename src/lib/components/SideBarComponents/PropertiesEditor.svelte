<script lang="ts">
	import { Label, Checkbox, Tabs, TabItem, Range } from 'flowbite-svelte';
	import {
		updateComponent,
		addOption,
		updateOption,
		removeOption,
		deleteComponent,
		addRow,
		removeRow,
		updateRow,
		addColumn,
		removeColumn,
		updateColumn
	} from '../../stores/surveyStore.js';
	import type { SurveyComponent } from '../../types/survey.js';

	export let component: SurveyComponent | null = null;

	const fontFamilies = [
		'Arial',
		'Times New Roman',
		'Helvetica',
		'Courier New',
		'Georgia',
		'Verdana',
		'Tahoma',
		'Trebuchet MS',
		'Impact',
		'Comic Sans MS'
	];
	const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
	const fontWeights = [
		'normal',
		'bold',
		'100',
		'200',
		'300',
		'400',
		'500',
		'600',
		'700',
		'800',
		'900'
	];
	const fontStyles = ['normal', 'italic', 'oblique'];
	const textDecorations = ['none', 'underline', 'line-through', 'overline'];
	const textAligns = ['left', 'center', 'right'];
	const borderStyles = [
		'none',
		'solid',
		'dashed',
		'dotted',
		'double',
		'groove',
		'ridge',
		'inset',
		'outset'
	];

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

	function getDefaultValue(field: string, defaultVal: any = '') {
		if (!component) return defaultVal;
		return component[field as keyof SurveyComponent] ?? defaultVal;
	}
</script>

{#if component}
	<Tabs style="underline">
		<TabItem open title="Basic">
			<div
				class="rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"
			>
				<!-- Text/Label editor -->
				<div class="mb-3">
					<label for="comp-label-input" class="mb-1 block text-sm font-medium">Label:</label>
					<input
						id="comp-label-input"
						type="text"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={component.label}
						on:input={(e) => handleInputChange(e, 'label')}
					/>
				</div>

				<!-- Description field for components that use it -->
				{#if ['section', 'introduction'].includes(component.type)}
					<div class="mb-3">
						<label for="comp-description" class="mb-1 block text-sm font-medium">Description:</label
						>
						<textarea
							id="comp-description"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							rows="3"
							value={component.description || ''}
							on:input={(e) => handleInputChange(e, 'description')}
						></textarea>
					</div>
				{/if}

				<!-- File source URL for fileAttachment -->
				{#if component.type === 'fileAttachment'}
					<div class="mb-3">
						<label for="comp-file-src" class="mb-1 block text-sm font-medium">File URL:</label>
						<input
							id="comp-file-src"
							type="text"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.src || ''}
							on:input={(e) => handleInputChange(e, 'src')}
						/>
					</div>
				{/if}

				<!-- File upload settings -->
				{#if component.type === 'fileUpload'}
					<div class="mb-3">
						<label for="comp-accepted-types" class="mb-1 block text-sm font-medium"
							>Accepted File Types:</label
						>
						<input
							id="comp-accepted-types"
							type="text"
							class="w-full rounded border p-1"
							value={component.acceptedFileTypes || '.pdf,.doc,.docx,.jpg,.png'}
							on:input={(e) => handleInputChange(e, 'acceptedFileTypes')}
						/>
						<p class="mt-1 text-xs text-gray-500">
							Comma-separated file extensions (e.g. .pdf,.jpg)
						</p>
					</div>
					<div class="mb-3">
						<label for="comp-max-size" class="mb-1 block text-sm font-medium"
							>Max File Size (MB):</label
						>
						<input
							id="comp-max-size"
							type="number"
							min="1"
							max="100"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.maxFileSize || 5}
							on:input={(e) => handleInputChange(e, 'maxFileSize')}
						/>
					</div>
				{/if}

				<!-- Add rating controls -->
				{#if component.type === 'rating'}
					<div class="mb-3">
						<label for="comp-max-rating" class="mb-1 block text-sm font-medium">Max Rating:</label>
						<input
							id="comp-max-rating"
							type="number"
							min="1"
							max="10"
							class="w-full rounded border p-1"
							value={component.maxRating || 5}
							on:input={(e) => handleInputChange(e, 'maxRating')}
						/>
					</div>
				{/if}

				<!-- Required field (only for form input components) -->
				{#if ['input', 'textarea', 'checkbox', 'radio', 'dropdown', 'fileUpload', 'matrix', 'rating'].includes(component.type)}
					<div class="mb-3 flex items-center">
						<Label color="red" class="mt-4 flex items-center font-bold">
							<Checkbox
								type="checkbox"
								id="required-field"
								class="mr-2 dark:border-gray-700 dark:bg-gray-800"
								checked={component.required}
								on:change={(e) => handleInputChange(e, 'required')}
							/> Required
						</Label>
					</div>
				{/if}

				<!-- Placeholder text for input components -->
				{#if ['input', 'textarea'].includes(component.type)}
					<div class="mb-3">
						<label for="comp-placeholder" class="mb-1 block text-sm font-medium">Placeholder:</label
						>
						<input
							id="comp-placeholder"
							type="text"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.placeholder || ''}
							on:input={(e) => handleInputChange(e, 'placeholder')}
						/>
					</div>
				{/if}

				<!-- Help text for all form components -->
				{#if ['input', 'textarea', 'checkbox', 'radio', 'dropdown', 'fileUpload', 'matrix', 'rating'].includes(component.type)}
					<div class="mb-3">
						<label for="comp-help-text" class="mb-1 block text-sm font-medium">Help Text:</label>
						<input
							id="comp-help-text"
							type="text"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.helpText || ''}
							on:input={(e) => handleInputChange(e, 'helpText')}
						/>
					</div>
				{/if}

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
										class="mr-2 flex-1 rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
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
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.x}
							on:input={(e) => handleInputChange(e, 'x')}
						/>
					</div>
					<div>
						<label for="comp-y" class="mb-1 block text-sm font-medium">Y:</label>
						<input
							id="comp-y"
							type="number"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.y}
							on:input={(e) => handleInputChange(e, 'y')}
						/>
					</div>
					<div>
						<label for="comp-width" class="mb-1 block text-sm font-medium">Width:</label>
						<input
							id="comp-width"
							type="number"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.width}
							on:input={(e) => handleInputChange(e, 'width')}
						/>
					</div>
					<div>
						<label for="comp-height" class="mb-1 block text-sm font-medium">Height:</label>
						<input
							id="comp-height"
							type="number"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.height}
							on:input={(e) => handleInputChange(e, 'height')}
						/>
					</div>
				</div>
			</div>
		</TabItem>

		<TabItem title="Style">
			<div
				class="rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"
			>
				<!-- Typography -->
				<h3 class="mb-2 text-base font-medium">Typography</h3>

				<!-- Font family -->
				<div class="mb-3">
					<label for="comp-font-family" class="mb-1 block text-sm font-medium">Font Family:</label>
					<select
						id="comp-font-family"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
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
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={component.fontSize}
						on:change={(e) => handleInputChange(e, 'fontSize')}
					>
						{#each fontSizes as size}
							<option value={size}>{size}px</option>
						{/each}
					</select>
				</div>

				<!-- Font weight -->
				<div class="mb-3">
					<label for="comp-font-weight" class="mb-1 block text-sm font-medium">Font Weight:</label>
					<select
						id="comp-font-weight"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('fontWeight', 'normal')}
						on:change={(e) => handleInputChange(e, 'fontWeight')}
					>
						{#each fontWeights as weight}
							<option value={weight}>{weight}</option>
						{/each}
					</select>
				</div>

				<!-- Font style -->
				<div class="mb-3">
					<label for="comp-font-style" class="mb-1 block text-sm font-medium">Font Style:</label>
					<select
						id="comp-font-style"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('fontStyle', 'normal')}
						on:change={(e) => handleInputChange(e, 'fontStyle')}
					>
						{#each fontStyles as style}
							<option value={style}>{style}</option>
						{/each}
					</select>
				</div>

				<!-- Text decoration -->
				<div class="mb-3">
					<label for="comp-text-decoration" class="mb-1 block text-sm font-medium"
						>Text Decoration:</label
					>
					<select
						id="comp-text-decoration"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('textDecoration', 'none')}
						on:change={(e) => handleInputChange(e, 'textDecoration')}
					>
						{#each textDecorations as decoration}
							<option value={decoration}>{decoration}</option>
						{/each}
					</select>
				</div>

				<!-- Text align -->
				<div class="mb-3">
					<label for="comp-text-align" class="mb-1 block text-sm font-medium">Text Align:</label>
					<select
						id="comp-text-align"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('textAlign', 'left')}
						on:change={(e) => handleInputChange(e, 'textAlign')}
					>
						{#each textAligns as align}
							<option value={align}>{align}</option>
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
							class="mr-2 dark:border-gray-700 dark:bg-gray-800"
							value={component.color}
							on:input={(e) => handleInputChange(e, 'color')}
						/>
						<input
							id="comp-text-color-hex"
							type="text"
							class="flex-1 rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.color}
							on:input={(e) => handleInputChange(e, 'color')}
						/>
					</div>
				</div>

				<!-- Background color -->
				<div class="mb-3">
					<label for="comp-bg-color" class="mb-1 block text-sm font-medium">Background Color:</label
					>
					<div class="flex items-center">
						<input
							id="comp-bg-color"
							type="color"
							class="mr-2 dark:border-gray-700 dark:bg-gray-800"
							value={component.bgColor}
							on:input={(e) => handleInputChange(e, 'bgColor')}
						/>
						<input
							id="comp-bg-color-hex"
							type="text"
							class="flex-1 rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={component.bgColor}
							on:input={(e) => handleInputChange(e, 'bgColor')}
						/>
					</div>
				</div>

				<!-- Opacity -->
				<div class="mb-3">
					<label for="comp-opacity" class="mb-1 block text-sm font-medium">Opacity:</label>
					<div class="flex items-center">
						<Range
							id="comp-opacity"
							min="0"
							max="1"
							step="0.01"
							class="w-full"
							value={getDefaultValue('opacity', 1)}
							on:change={(e) => handleInputChange(e, 'opacity')}
						/>
						<span class="ml-2 w-10 text-center"
							>{(getDefaultValue('opacity', 1) * 100).toFixed(0)}%</span
						>
					</div>
				</div>

				<h3 class="mt-4 mb-2 text-base font-medium">Border & Spacing</h3>

				<!-- Border radius -->
				<div class="mb-3">
					<label for="comp-border-radius" class="mb-1 block text-sm font-medium"
						>Border Radius:</label
					>
					<input
						id="comp-border-radius"
						type="number"
						min="0"
						max="50"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('borderRadius', 4)}
						on:input={(e) => handleInputChange(e, 'borderRadius')}
					/>
				</div>

				<!-- Border width -->
				<div class="mb-3">
					<label for="comp-border-width" class="mb-1 block text-sm font-medium">Border Width:</label
					>
					<input
						id="comp-border-width"
						type="number"
						min="0"
						max="10"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('borderWidth', 1)}
						on:input={(e) => handleInputChange(e, 'borderWidth')}
					/>
				</div>

				<!-- Border style -->
				<div class="mb-3">
					<label for="comp-border-style" class="mb-1 block text-sm font-medium">Border Style:</label
					>
					<select
						id="comp-border-style"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('borderStyle', 'solid')}
						on:change={(e) => handleInputChange(e, 'borderStyle')}
					>
						{#each borderStyles as style}
							<option value={style}>{style}</option>
						{/each}
					</select>
				</div>

				<!-- Border color -->
				<div class="mb-3">
					<label for="comp-border-color" class="mb-1 block text-sm font-medium">Border Color:</label
					>
					<div class="flex items-center">
						<input
							id="comp-border-color"
							type="color"
							class="mr-2 dark:border-gray-700 dark:bg-gray-800"
							value={getDefaultValue('borderColor', '#d1d5db')}
							on:input={(e) => handleInputChange(e, 'borderColor')}
						/>
						<input
							id="comp-border-color-hex"
							type="text"
							class="flex-1 rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={getDefaultValue('borderColor', '#d1d5db')}
							on:input={(e) => handleInputChange(e, 'borderColor')}
						/>
					</div>
				</div>

				<!-- Padding -->
				<div class="mb-3">
					<label for="comp-padding" class="mb-1 block text-sm font-medium">Padding:</label>
					<input
						id="comp-padding"
						type="number"
						min="0"
						max="50"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('padding', 8)}
						on:input={(e) => handleInputChange(e, 'padding')}
					/>
				</div>

				<!-- Margin -->
				<div class="mb-3">
					<label for="comp-margin" class="mb-1 block text-sm font-medium">Margin:</label>
					<input
						id="comp-margin"
						type="number"
						min="0"
						max="50"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('margin', 0)}
						on:input={(e) => handleInputChange(e, 'margin')}
					/>
				</div>

				<!-- Box shadow -->
				<div class="mb-3">
					<label for="comp-box-shadow" class="mb-1 block text-sm font-medium">Box Shadow:</label>
					<select
						id="comp-box-shadow"
						class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
						value={getDefaultValue('boxShadow', 'none')}
						on:change={(e) => handleInputChange(e, 'boxShadow')}
					>
						<option value="none">None</option>
						<option value="0 1px 3px rgba(0,0,0,0.12)">Small</option>
						<option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
						<option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
						<option value="0 20px 25px rgba(0,0,0,0.15)">Extra Large</option>
					</select>
				</div>
			</div>
		</TabItem>

		<TabItem title="Advanced">
			<div
				class="rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"
			>
				<!-- Matrix-->
				{#if component.type === 'matrix'}
					<div class="mb-3">
						<span class="mb-1 block text-sm font-medium">Matrix Rows:</span>
						<ul class="space-y-2">
							{#each component.rows as row, i}
								<li class="flex items-center">
									<input
										type="text"
										class="mr-2 flex-1 rounded border p-1"
										value={row}
										on:input={(e) =>
											updateRow(component.id, i, (e.target as HTMLInputElement).value)}
									/>
									<button
										class="rounded bg-red-500 p-1 text-white"
										on:click={() => removeRow(component.id, i)}
									>
										×
									</button>
								</li>
							{/each}
							<li>
								<button
									class="w-full rounded bg-blue-500 p-1 text-white"
									on:click={() => addRow(component.id)}
								>
									Add Row
								</button>
							</li>
						</ul>
					</div>

					<div class="mb-3">
						<span class="mb-1 block text-sm font-medium">Matrix Columns:</span>
						<ul class="space-y-2">
							{#each component.columns as column, i}
								<li class="flex items-center">
									<input
										type="text"
										class="mr-2 flex-1 rounded border p-1"
										value={column}
										on:input={(e) =>
											updateColumn(component.id, i, (e.target as HTMLInputElement).value)}
									/>
									<button
										class="rounded bg-red-500 p-1 text-white"
										on:click={() => removeColumn(component.id, i)}
									>
										×
									</button>
								</li>
							{/each}
							<li>
								<button
									class="w-full rounded bg-blue-500 p-1 text-white"
									on:click={() => addColumn(component.id)}
								>
									Add Column
								</button>
							</li>
						</ul>
					</div>
				{/if}

				<!-- Validation -->
				{#if ['input', 'textarea'].includes(component.type)}
					<div class="mb-3">
						<label for="comp-validation-pattern" class="mb-1 block text-sm font-medium"
							>Validation Pattern (RegEx):</label
						>
						<input
							id="comp-validation-pattern"
							type="text"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={getDefaultValue('validationPattern', '')}
							on:input={(e) => handleInputChange(e, 'validationPattern')}
						/>
						<p class="mt-1 text-xs text-gray-500">
							Example: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]&#123;2,&#125;$ for email
						</p>
					</div>

					<div class="mb-3">
						<label for="comp-validation-message" class="mb-1 block text-sm font-medium"
							>Validation Error Message:</label
						>
						<input
							id="comp-validation-message"
							type="text"
							class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
							value={getDefaultValue('validationMessage', '')}
							on:input={(e) => handleInputChange(e, 'validationMessage')}
						/>
					</div>
				{/if}

				<!-- Delete component -->
				<button
					class="mt-4 w-full rounded bg-red-600 p-2 text-white dark:bg-slate-300 dark:text-slate-900"
					on:click={() => deleteComponent(component.id)}
				>
					Delete Component
				</button>
			</div>
		</TabItem>
	</Tabs>
{/if}
