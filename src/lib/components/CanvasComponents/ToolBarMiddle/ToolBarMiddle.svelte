<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { addComponent } from '$lib/stores/surveyStore.ts';
	import { canvasViewStore } from '$lib/stores/canvasStore.ts';
	import { selectedComponentIds, clearSelectionState } from '$lib/stores/alignmentStore.ts';
	import type { ComponentType } from '$lib/types/survey.ts';

	// Icons
	import DirectLeftTop from '$lib/components/icons/components/direct-left-top.svg?raw';
	import IconText from '$lib/components/icons/components/text.svg?raw';
	import IconSection from '$lib/components/icons/components/section.svg?raw';
	import IconTitle from '$lib/components/icons/components/title.svg?raw';
	import IconInput from '$lib/components/icons/components/input.svg?raw';
	import IconTextAria from '$lib/components/icons/components/text-aria.svg?raw';
	import IconZoomIn from '$lib/components/icons/grid/zoom/search-zoom-in.svg?raw';
	import IconZoomOut from '$lib/components/icons/grid/zoom/search-zoom-out.svg?raw';
	import IconZoomNormal from '$lib/components/icons/grid/zoom/search-normal.svg?raw';

	const dispatch = createEventDispatcher<{
		resetZoom: void;
		autoPosition: void;
	}>();

	// Toolbar state
	let showExtendedTools = $state(false);

	// Functions
	function sanitizeSvg(svg: string): string {
		return svg.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
	}

	function toggleExtendedTools() {
		showExtendedTools = !showExtendedTools;
	}

	function handleAddComponent(type: ComponentType) {
		// Clear any current selection
		clearSelectionState();

		// Add the component to the canvas
		addComponent(type);

		// Optional: Close extended tools after adding a component
		if (showExtendedTools) {
			showExtendedTools = false;
		}
	}

	function handleZoomIn() {
		canvasViewStore.zoomIn();
	}

	function handleZoomOut() {
		canvasViewStore.zoomOut();
	}

	function handleResetZoom() {
		dispatch('resetZoom');
	}

	// Component definitions for quick add
	const quickAddComponents = [
		{ type: 'text' as ComponentType, icon: IconText, title: 'Add Text' },
		{ type: 'section' as ComponentType, icon: IconSection, title: 'Add Section' },
		{ type: 'title' as ComponentType, icon: IconTitle, title: 'Add Title' },
		{ type: 'input' as ComponentType, icon: IconInput, title: 'Add Input Field' },
		{ type: 'textarea' as ComponentType, icon: IconTextAria, title: 'Add Text Area' }
	];
</script>

<div
	class="container-toolbar rounded border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300"
>
	<!-- Toggle extended toolbar button -->
	<button
		class="group flex h-8 w-8 items-center justify-center border-r border-gray-200 dark:border-gray-700"
		title="Toggle toolbar"
		on:click={toggleExtendedTools}
	>
		<span
			class="inline-block h-4 w-4 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
			style="transform: {showExtendedTools
				? 'rotate(180deg)'
				: 'rotate(0deg)'}; transition: transform 0.2s;"
		>
			{@html sanitizeSvg(DirectLeftTop)}
		</span>
	</button>

	<!-- Extended toolbar section -->
	{#if showExtendedTools}
		<!-- Component quick-add buttons -->
		{#each quickAddComponents as component}
			<button
				class="group flex h-8 w-8 items-center justify-center border-r border-gray-200 dark:border-gray-700"
				title={component.title}
				on:click={() => handleAddComponent(component.type)}
			>
				<span
					class="inline-block h-4 w-4 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
				>
					{@html sanitizeSvg(component.icon)}
				</span>
			</button>
		{/each}

		<!-- Zoom controls -->
		<button
			class="group flex h-8 w-8 items-center justify-center border-r border-gray-200 dark:border-gray-700"
			title="Zoom In"
			on:click={handleZoomIn}
		>
			<span
				class="inline-block h-4 w-4 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
			>
				{@html sanitizeSvg(IconZoomIn)}
			</span>
		</button>
		<button
			class="group flex h-8 w-8 items-center justify-center border-r border-gray-200 dark:border-gray-700"
			title="Zoom Out"
			on:click={handleZoomOut}
		>
			<span
				class="inline-block h-4 w-4 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
			>
				{@html sanitizeSvg(IconZoomOut)}
			</span>
		</button>
		<button
			class="group flex h-8 w-8 items-center justify-center"
			title="Reset Zoom"
			on:click={handleResetZoom}
		>
			<span
				class="inline-block h-4 w-4 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
			>
				{@html sanitizeSvg(IconZoomNormal)}
			</span>
		</button>
	{:else}
		<!-- Quick access button when toolbar is collapsed -->
		<button
			class="group flex h-8 w-8 items-center justify-center"
			title="Add Text Component"
			on:click={() => handleAddComponent('text')}
		>
			<span
				class="inline-block h-4 w-4 text-gray-700 group-hover:text-black dark:text-slate-200 dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
			>
				{@html sanitizeSvg(IconText)}
			</span>
		</button>
	{/if}
</div>

<style>
	.container-toolbar {
		position: absolute;
		z-index: 1000;
		top: 3em;
		display: flex;
		justify-content: center;
		width: fit-content;
		margin: 0 auto;
		left: 50%;
		transform: translateX(-50%);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		transition: width 0.2s ease-in-out;
	}
	.container-toolbar button {
		cursor: pointer;
		transition: background-color 0.2s;
	}
	.container-toolbar button:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
	.dark .container-toolbar button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
</style>
