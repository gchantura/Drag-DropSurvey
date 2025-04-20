<script lang="ts">
	import { addComponent } from '../../stores/surveyStore.js';
	import type { ComponentType } from '../../types/survey.js';

	import IconText from '$lib/components/icons/components/text.svg?raw';
	import IconInput from '$lib/components/icons/components/input.svg?raw';
	import IconTextAria from '$lib/components/icons/components/text-aria.svg?raw';
	import IconCheckbox from '$lib/components/icons/components/checkbox.svg?raw';
	import IconRadio from '$lib/components/icons/components/radio.svg?raw';
	import IconDropdown from '$lib/components/icons/components/dropdown.svg?raw';
	import IconAttachment from '$lib/components/icons/components/attachment.svg?raw';
	import IconFileUpload from '$lib/components/icons/components/file-upload.svg?raw';
	import IconSection from '$lib/components/icons/components/section.svg?raw';
	import IconTitle from '$lib/components/icons/components/title.svg?raw';
	import IconHeader from '$lib/components/icons/components/header.svg?raw';
	import IconTable from '$lib/components/icons/components/table.svg?raw';
	import IconStar from '$lib/components/icons/components/star.svg?raw';

	const components: { type: ComponentType; label: string; icon: string }[] = [
		{ type: 'text', label: 'Text', icon: IconText },
		{ type: 'input', label: 'Input', icon: IconInput },
		{ type: 'textarea', label: 'Text Area', icon: IconTextAria },
		{ type: 'checkbox', label: 'Checkbox', icon: IconCheckbox },
		{ type: 'radio', label: 'Radio', icon: IconRadio },
		{ type: 'dropdown', label: 'Dropdown', icon: IconDropdown },
		{ type: 'fileAttachment', label: 'File Attachment', icon: IconAttachment },
		{ type: 'fileUpload', label: 'File Upload', icon: IconFileUpload },
		{ type: 'section', label: 'Section', icon: IconSection },
		{ type: 'title', label: 'Title', icon: IconTitle },
		{ type: 'introduction', label: 'Header', icon: IconHeader },
		{ type: 'matrix', label: 'Table', icon: IconTable },
		{ type: 'rating', label: 'Rating', icon: IconStar }
	];

	function handleAddComponent(type: ComponentType) {
		addComponent(type);
	}
</script>

<div class="rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
	<h3 class="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">Components</h3>
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		{#each components as comp}
			<button
				class="flex min-h-[56px] w-full items-center gap-3 overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-left transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
				on:click={() => handleAddComponent(comp.type)}
				title={comp.label}
			>
				<span class="inline-block h-6 w-6 [&>svg]:h-full [&>svg]:w-full">
					{@html comp.icon}
				</span>
				<span class="truncate text-sm font-medium text-gray-800 dark:text-gray-200"
					>{comp.label}</span
				>
			</button>
		{/each}
	</div>
</div>

<style>
</style>
