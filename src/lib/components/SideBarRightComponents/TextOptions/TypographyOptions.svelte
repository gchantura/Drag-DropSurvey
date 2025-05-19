<script lang="ts">
	import type { SurveyComponent } from '$lib/types/types.ts';
	import { updateComponent } from '$lib/stores/designStore.ts';

	export let component: SurveyComponent | null = null;

	const fontFamilies = ['Arial', 'Times New Roman', 'Helvetica', 'Courier New', 'Georgia'];
	const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

	function handleInputChange(e: Event, field: string) {
		if (!component) return;

		const target = e.target as HTMLInputElement;
		const value = target.type === 'color' ? target.value : target.value;

		updateComponent(component.id, { [field]: value });
	}
</script>

{#if component}
	<div class="typography-options">
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
			<label for="comp-bg-color" class="mb-1 block text-sm font-medium">Background Color:</label>
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
	</div>
{/if}
