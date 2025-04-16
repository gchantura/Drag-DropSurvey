<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent as SurveyComponentType } from '../types/survey.ts'; // Adjusted path

	// Import all subcomponents dynamically for potentially better initial load
	// Or keep static imports if preferred
	const componentMap = {
		text: () => import('./MainComponents/TextComponent.svelte'),
		input: () => import('./MainComponents/InputComponent.svelte'),
		textarea: () => import('./MainComponents/TextAreaComponent.svelte'),
		checkbox: () => import('./MainComponents/CheckboxComponent.svelte'),
		radio: () => import('./MainComponents/RadioComponent.svelte'),
		dropdown: () => import('./MainComponents/DropdownComponent.svelte'),
		fileAttachment: () => import('./MainComponents/FileAttachmentComponent.svelte'),
		fileUpload: () => import('./MainComponents/FileUploadComponent.svelte'),
		section: () => import('./MainComponents/SectionComponent.svelte'),
		title: () => import('./MainComponents/TitleComponent.svelte'),
		introduction: () => import('./MainComponents/IntroductionComponent.svelte'),
		matrix: () => import('./MainComponents/MatrixComponent.svelte'),
		rating: () => import('./MainComponents/RatingComponent.svelte')
	};

	export let component: SurveyComponentType;
	export let isSelected: boolean = false;
	export let isActive: boolean = false; // Indicates the primary selected component

	const dispatch = createEventDispatcher<{
		select: SurveyComponentType; // Dispatch on click/activation
		startDrag: { event: MouseEvent; component: SurveyComponentType };
		startResize: { event: MouseEvent; component: SurveyComponentType };
	}>();

	let componentImplementation: Promise<any> | null = null;

	$: if (component && componentMap[component.type]) {
		componentImplementation = componentMap[component.type]();
	} else {
		componentImplementation = null; // Handle unknown type
	}

	function handleMouseDown(e: MouseEvent) {
		// Only start drag on left click and not on the resize handle
		if (e.button === 0 && !(e.target as HTMLElement).classList.contains('resize-handle')) {
			dispatch('startDrag', { event: e, component });
			// No preventDefault here, let the main Canvas handler do that
		}
	}

	function handleResizeMouseDown(e: MouseEvent) {
		if (e.button === 0) {
			dispatch('startResize', { event: e, component });
			e.stopPropagation(); // Prevent triggering drag on the main component
			// No preventDefault here, let the main Canvas handler do that
		}
	}

	function handleClick(e: MouseEvent) {
		// If the click didn't start a drag (i.e., mouse didn't move much), dispatch select
		// This is usually handled by the Canvas orchestrator on mouse up if no drag occurred.
		// We can dispatch 'select' here as well for redundancy or specific component activation needs.
		// However, be careful not to interfere with multi-select logic in the main Canvas.
		// Let's rely on the Canvas orchestrator's handleSelectComponent for consistency.
		// dispatch('select', component);
		e.stopPropagation(); // Prevent canvas background click handler
	}

	function handleKeyDown(e: KeyboardEvent) {
		// Allow selection via keyboard
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			dispatch('select', component);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="component absolute border outline-none"
	class:selected={isSelected}
	class:active={isActive}
	style:top="{component.y}px"
	style:left="{component.x}px"
	style:width="{component.width}px"
	style:height="{component.height}px"
	style:font-family={component.fontFamily ?? 'Arial'}
	style:font-size="{component.fontSize ?? 16}px"
	style:color={component.color ?? '#000000'}
	style:background-color={component.bgColor ?? '#FFFFFF'}
	style:z-index={isSelected ? 20 : 10}
	on:mousedown={handleMouseDown}
	on:click={handleClick}
	on:keydown={handleKeyDown}
	tabindex="0"
	role="button"
	aria-label="{component.type} component: {component.label ?? 'No Label'}"
	aria-pressed={isSelected}
>
	<div class="component-content pointer-events-none h-full w-full overflow-hidden p-2">
		{#if componentImplementation}
			{#await componentImplementation then module}
				<svelte:component this={module.default} {...component} />
			{:catch error}
				<p class="text-red-500">Error loading component: {error.message}</p>
			{/await}
		{:else}
			<p class="text-red-500">Unknown component type: {component.type}</p>
		{/if}
	</div>

	<!-- Resize Handle (only shown when selected) -->
	{#if isSelected}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="resize-handle absolute right-0 bottom-0 h-3 w-3 cursor-nwse-resize border-2 border-white bg-blue-600 dark:border-gray-800 dark:bg-blue-400"
			on:mousedown|stopPropagation={handleResizeMouseDown}
			aria-hidden="true"
			title="Drag to resize"
		/>
	{/if}
</div>

<style>
	.component {
		border-color: transparent;
		transition:
			box-shadow 0.1s ease-in-out,
			border-color 0.1s ease-in-out;
		user-select: none; /* Prevent text selection during drag */
		-webkit-user-select: none;
	}

	.component:focus {
		/* Optional: Add focus style for keyboard navigation */
		/* outline: 2px solid blue; */
	}

	.component.selected {
		/* Use outline for selection indicator to avoid layout shifts */
		outline: 1px solid #3b82f6; /* Tailwind blue-500 */
		outline-offset: 1px;
		border-color: #3b82f6; /* Make border visible too */
	}

	.component.active {
		/* Stronger indicator for the primary active component */
		outline: 2px solid #2563eb; /* Tailwind blue-600 */
		outline-offset: 0px;
		border-color: #2563eb;
	}

	.dark .component.selected {
		outline-color: #60a5fa; /* blue-400 */
		border-color: #60a5fa;
	}
	.dark .component.active {
		outline-color: #3b82f6; /* blue-500 */
		border-color: #3b82f6;
	}

	.component-content {
		/* Ensure content doesn't interfere with drag */
		position: relative; /* Needed for pointer-events: none to work reliably? */
	}

	/* Ensure sub-components allow interaction if needed */
	.component-content :global(input),
	.component-content :global(textarea),
	.component-content :global(select),
	.component-content :global(button) {
		pointer-events: auto;
	}

	.resize-handle {
		z-index: 25; /* Above component content */
	}
</style>
