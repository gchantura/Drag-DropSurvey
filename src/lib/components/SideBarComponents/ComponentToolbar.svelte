<script lang="ts">
	import { addComponent } from '../../stores/surveyStore.js';
	import type { ComponentType } from '../../types/survey.js';

	import IconCheckbox from '$lib/components/icons/components/checkbox.svg?raw';
	import IconAttachment from '$lib/components/icons/components/attachment.svg?raw';

	const components: { type: ComponentType; label: string; icon: string }[] = [
		{ type: 'text', label: 'Text', icon: '📝' },
		{ type: 'input', label: 'Input', icon: '✏️' },
		{ type: 'textarea', label: 'Text Area', icon: '📄' },
		{ type: 'checkbox', label: 'Checkbox', icon: '☑️' },
		{ type: 'radio', label: 'Radio', icon: '⚪' },
		{ type: 'dropdown', label: 'Dropdown', icon: '🔽' },
		{ type: 'fileAttachment', label: 'File Attachment', icon: '📎' },
		{ type: 'fileUpload', label: 'File Upload', icon: '📤' },
		{ type: 'section', label: 'Section', icon: '📑' },
		{ type: 'title', label: 'Title', icon: '🔖' },
		{ type: 'introduction', label: 'Header', icon: '📋' },
		{ type: 'matrix', label: 'Matrix', icon: '🔢' },
		{ type: 'rating', label: 'Rating', icon: '⭐' }
	];

	function handleAddComponent(type: ComponentType) {
		addComponent(type);
	}
</script>

<div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-4">
	<h3 class="text-base font-semibold mb-4 text-gray-800 dark:text-gray-100">Components</h3>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
		{#each components as comp}
			<button
				class="flex items-center gap-3 p-3 min-h-[56px] w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-left overflow-hidden"
				on:click={() => handleAddComponent(comp.type)}
				title={comp.label}
			>
				<span class="text-2xl">{comp.icon}</span>
				<span class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{comp.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>

</style>
