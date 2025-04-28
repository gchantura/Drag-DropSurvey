<!-- src/lib/components/SurveyComponent.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent as SurveyComponentType } from '$lib/types/survey.ts';
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
	export let isActive: boolean = false;
	const dispatch = createEventDispatcher<{
		select: { event: MouseEvent; component: SurveyComponentType };
		startDrag: { event: MouseEvent; component: SurveyComponentType };
		startResize: { event: MouseEvent; component: SurveyComponentType };
	}>();
	let componentImplementation: Promise<{ default: any }> | null = null;
	$: {
		if (component && componentMap[component.type]) {
			componentImplementation = componentMap[component.type]();
		} else {
			componentImplementation = null;
			if (component) {
				console.error(`Unknown component type: ${component.type}`);
			}
		}
	}
	function handleMouseDown(e: MouseEvent): void {
		if (e.button === 0 && !(e.target as HTMLElement).classList.contains('resize-handle')) {
			dispatch('startDrag', { event: e, component });
		}
	}
	function handleResizeMouseDown(e: MouseEvent): void {
		if (e.button === 0) {
			dispatch('startResize', { event: e, component });
			e.stopPropagation();
		}
	}
	function handleClick(e: MouseEvent): void {
		if (e.button === 0) {
			if (!(e.target as HTMLElement).classList.contains('resize-handle')) {
				dispatch('select', { event: e, component });
				e.stopPropagation();
			}
		}
	}
	function handleKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Enter' || e.key === ' ') {
			const mockEvent = new MouseEvent('click', { shiftKey: false });
			dispatch('select', { event: mockEvent, component });
			e.preventDefault();
			e.stopPropagation();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="component absolute border outline-none"
	class:selected={isSelected}
	class:active={isActive}
	data-component-id={component.id}
	style:top="{component.y}px"
	style:left="{component.x}px"
	style:width="{component.width}px"
	style:height="{component.height}px"
	style:font-family={component.fontFamily ?? 'Arial'}
	style:font-size="{component.fontSize ?? 16}px"
	style:color={component.color ?? '#000000'}
	style:background-color={component.bgColor ?? '#FFFFFF'}
	style:z-index={isSelected ? 20 : 10}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	tabindex="0"
	role="button"
	aria-label="{component.type} component: {component.label ?? 'No Label'}"
	aria-pressed={isSelected}
>
	<div class="component-content pointer-events-none h-full w-full overflow-hidden p-2">
		{#if componentImplementation}
			{#await componentImplementation then module}
				{#if module && module.default}
					<svelte:component this={module.default} {...component} />
				{:else}
					<p class="text-orange-500">Component loaded incorrectly.</p>
				{/if}
			{:catch error}
				<p class="text-red-500">Error: {error.message}</p>
			{/await}
		{:else if component}
			<p class="text-red-500">Unknown type: {component.type}</p>
		{/if}
	</div>
	{#if isSelected}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="resize-handle absolute right-0 bottom-0 h-3 w-3 cursor-nwse-resize border-2 border-white bg-blue-600 dark:border-gray-800 dark:bg-blue-400"
			onmousedown={handleResizeMouseDown}
			aria-hidden="true"
			title="Drag to resize"
		></div>
	{/if}
</div>

<style>
	.component {
		border-color: transparent;
		transition:
			box-shadow 0.1s ease-in-out,
			border-color 0.1s ease-in-out;
		user-select: none;
		-webkit-user-select: none;
		overflow: hidden;
	}
	.component:focus {
		outline: none;
	}
	.component.selected {
		outline: 1px solid #3b82f6;
		outline-offset: 1px;
		border-color: #3b82f6;
	}
	.component.active {
		outline: 2px solid #2563eb;
		outline-offset: 0px;
		border-color: #2563eb;
	}
	.component-content {
		position: relative;
	}
	.component-content :global(input),
	.component-content :global(textarea),
	.component-content :global(select),
	.component-content :global(button) {
		pointer-events: auto;
	}
	.resize-handle {
		z-index: 25;
	}
</style>
