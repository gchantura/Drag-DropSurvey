<script lang="ts">
	import { get } from 'svelte/store';
	import { canAlign, alignSelectedComponents } from '$lib/stores/alignmentStore.ts';
	import { canDistribute, distributeSelectedComponents } from '$lib/stores/distributionStore.ts';
	import { componentsStore, addComponent } from '$lib/stores/designStore.ts';
	import type { ComponentType } from '$lib/types/types.ts';

	// Import component icons
	import IconText from '$lib/components/icons/components/text.svg?raw';
	import IconInput from '$lib/components/icons/components/input.svg?raw';
	import IconTextAria from '$lib/components/icons/components/text-aria.svg?raw';
	import IconCheckbox from '$lib/components/icons/components/checkbox.svg?raw';
	import IconRadio from '$lib/components/icons/components/radio.svg?raw';
	import IconDropdown from '$lib/components/icons/components/dropdown.svg?raw';
	import IconSection from '$lib/components/icons/components/section.svg?raw';
	import IconTitle from '$lib/components/icons/components/title.svg?raw';
	import IconHeader from '$lib/components/icons/components/header.svg?raw';
	import IconTable from '$lib/components/icons/components/table.svg?raw';
	import IconStar from '$lib/components/icons/components/star.svg?raw';

	// Component definitions
	const components: { type: ComponentType; label: string; icon: string }[] = [
		{ type: 'text', label: 'Text', icon: IconText },
		{ type: 'input', label: 'Input', icon: IconInput },
		{ type: 'textarea', label: 'Text Area', icon: IconTextAria },
		{ type: 'checkbox', label: 'Checkbox', icon: IconCheckbox },
		{ type: 'radio', label: 'Radio', icon: IconRadio },
		{ type: 'dropdown', label: 'Dropdown', icon: IconDropdown },
		{ type: 'section', label: 'Section', icon: IconSection },
		{ type: 'title', label: 'Title', icon: IconTitle },
		{ type: 'introduction', label: 'Header', icon: IconHeader },
		{ type: 'matrix', label: 'Table', icon: IconTable },
		{ type: 'rating', label: 'Rating', icon: IconStar }
	];

	function handleAddComponent(type: ComponentType) {
		addComponent(type);
	}

	function sanitizeSvg(svg: string): string {
		return svg.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
	}

	function getShortcutKey(type: ComponentType): string {
		const shortcuts: Record<ComponentType, string> = {
			text: 'T',
			input: 'I',
			textarea: 'A',
			checkbox: 'C',
			radio: 'R',
			dropdown: 'D',
			fileAttachment: 'F',
			fileUpload: 'U',
			section: 'S',
			title: 'H',
			introduction: 'N',
			matrix: 'M',
			rating: 'E'
		};

		return shortcuts[type] || '';
	}
</script>

<div
	class="Top_Middle_Toolbar_Container container-toolbar rounded border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300"
>
	<div class="flex items-center">
		<div class="Top_Middle_Toolbar">
			{#each components.filter((c) => ['text', 'input', 'textarea'].includes(c.type)) as comp}
				<button
					class="group mx-1 flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
					title="{comp.label} (Shortcut: {getShortcutKey(comp.type)})"
					aria-label={`Add ${comp.label} component`}
					onclick={() => handleAddComponent(comp.type)}
				>
					<span
						class="inline-block h-5 w-5 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
					>
						{@html sanitizeSvg(comp.icon)}
					</span>
				</button>
			{/each}

			{#each components.filter( (c) => ['checkbox', 'radio', 'dropdown', 'fileUpload', 'rating'].includes(c.type) ) as comp}
				<button
					class="group mx-1 flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
					title="{comp.label} (Shortcut: {getShortcutKey(comp.type)})"
					aria-label={`Add ${comp.label} component`}
					onclick={() => handleAddComponent(comp.type)}
				>
					<span
						class="inline-block h-5 w-5 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
					>
						{@html sanitizeSvg(comp.icon)}
					</span>
				</button>
			{/each}

			{#each components.filter( (c) => ['section', 'title', 'introduction', 'matrix', 'attachment'].includes(c.type) ) as comp}
				<button
					class="group mx-1 flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
					title="{comp.label} (Shortcut: {getShortcutKey(comp.type)})"
					aria-label={`Add ${comp.label} component`}
					onclick={() => handleAddComponent(comp.type)}
				>
					<span
						class="inline-block h-5 w-5 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
					>
						{@html sanitizeSvg(comp.icon)}
					</span>
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.container-toolbar {
		position: relative;
		z-index: 1000;
		top: 3em;
		display: flex;
		justify-content: center;
		width: fit-content;
		margin: 0 auto;
	}
	.container-toolbar button {
		cursor: pointer;
	}

	.Top_Middle_Toolbar {
		display: flex;
		align-items: center;
		opacity: 0.8;
	}
</style>
