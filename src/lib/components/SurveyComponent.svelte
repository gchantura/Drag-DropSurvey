<!-- src/lib/components/SurveyComponent.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent, ComponentStyle } from '$lib/types/types.ts';
	import { themeStore } from '$lib/stores/themeCustomizerStore.ts';
	import { componentStyleStore } from '$lib/stores/componentStyleStore.ts';

	const componentMap = {
		text: () => import('$lib/components/MainComponents/TextComponent.svelte'),
		input: () => import('$lib/components/MainComponents/InputComponent.svelte'),
		textarea: () => import('$lib/components/MainComponents/TextAreaComponent.svelte'),
		checkbox: () => import('$lib/components/MainComponents/CheckboxComponent.svelte'),
		radio: () => import('$lib/components/MainComponents/RadioComponent.svelte'),
		dropdown: () => import('$lib/components/MainComponents/DropdownComponent.svelte'),
		fileAttachment: () => import('$lib/components/MainComponents/FileAttachmentComponent.svelte'),
		fileUpload: () => import('$lib/components/MainComponents/FileUploadComponent.svelte'),
		section: () => import('$lib/components/MainComponents/SectionComponent.svelte'),
		title: () => import('$lib/components/MainComponents/TitleComponent.svelte'),
		introduction: () => import('$lib/components/MainComponents/IntroductionComponent.svelte'),
		matrix: () => import('$lib/components/MainComponents/MatrixComponent.svelte'),
		rating: () => import('$lib/components/MainComponents/RatingComponent.svelte')
	};
	export let component: SurveyComponent;
	export let isSelected: boolean = false;
	export let isActive: boolean = false;
	const dispatch = createEventDispatcher<{
		select: { event: MouseEvent; component: SurveyComponent };
		startDrag: { event: MouseEvent; component: SurveyComponent };
		startResize: { event: MouseEvent; component: SurveyComponent };
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
		if (component.locked) return;
		if (e.button === 0 && !(e.target as HTMLElement).classList.contains('resize-handle')) {
			dispatch('startDrag', { event: e, component });
		}
	}
	function handleResizeMouseDown(e: MouseEvent): void {
		if (component.locked) return;
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

	// Get the component style from the store based on component type
	$: componentTypeStyle = $componentStyleStore[component.type] || $componentStyleStore.default;

	// Apply component style
	$: componentStyle = getComponentStyle(component, componentTypeStyle);

	function getComponentStyle(comp: SurveyComponent, typeStyle: ComponentStyle) {
		// Base styles from component properties and component type style
		let style = `
			top: ${comp.y}px;
			left: ${comp.x}px;
			width: ${comp.width}px;
			height: ${comp.height}px;
			z-index: ${isSelected ? 20 : 10};
		`;

		// Apply font styles
		style += `
			font-family: ${comp.fontFamily || typeStyle.fontFamily};
			font-size: ${comp.fontSize ? comp.fontSize + 'px' : typeStyle.fontSize};
			font-weight: ${typeStyle.fontWeight};
			color: ${comp.color || typeStyle.color};
			text-align: ${typeStyle.textAlign};
		`;

		// Apply background (solid or gradient)
		if (typeStyle.backgroundGradient) {
			style += `
				background: linear-gradient(
					${typeStyle.backgroundGradientDirection}, 
					${typeStyle.backgroundGradientStart}, 
					${typeStyle.backgroundGradientEnd}
				);
			`;
		} else {
			style += `background-color: ${comp.bgColor || typeStyle.backgroundColor};`;
		}

		// Apply opacity
		style += `opacity: ${typeStyle.opacity};`;

		// Apply borders and spacing
		style += `
			border: ${typeStyle.borderWidth} ${typeStyle.borderStyle} ${typeStyle.borderColor};
			border-radius: ${typeStyle.borderRadius};
			padding: ${typeStyle.padding};
			margin: ${typeStyle.margin};
		`;

		// Apply box shadow (conditionally based on selection state)
		if (isSelected) {
			style += `box-shadow: ${typeStyle.boxShadow || '0 0 0 2px rgba(59, 130, 246, 0.5)'};`;
		} else if (typeStyle.boxShadow) {
			style += `box-shadow: ${typeStyle.boxShadow};`;
		}

		// Apply transition
		style += `transition: ${typeStyle.transition};`;

		// Apply transform if provided
		if (typeStyle.transform && typeStyle.transform !== 'none') {
			style += `transform: ${typeStyle.transform};`;
		}

		// Apply any custom style overrides from the component
		if (comp.customStyle) {
			Object.entries(comp.customStyle).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					// Convert camelCase to kebab-case for CSS properties
					const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
					style += `${cssKey}: ${value};`;
				}
			});
		}

		return style;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="component absolute outline-none"
	class:selected={isSelected}
	class:active={isActive}
	class:locked={component.locked}
	data-component-id={component.id}
	style={componentStyle}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	tabindex="0"
	role="button"
	aria-label="{component.type} component: {component.label ?? 'No Label'}"
	aria-pressed={isSelected}
>
	<div class="component-content pointer-events-none h-full w-full overflow-hidden">
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
		border: none;
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
	}
	.component.active {
		outline: 2px solid #2563eb;
		outline-offset: 0px;
	}
	.component-content {
		position: relative;
		pointer-events: none;
	}
	.component-content :global(input),
	.component-content :global(textarea),
	.component-content :global(select),
	.component-content :global(button),
	.component-content :global(label),
	.component-content :global(fieldset) {
		pointer-events: none;
	}
	.resize-handle {
		z-index: 25;
	}
	.component.locked {
		position: relative;
	}

	.component.locked::after {
		content: '🔒';
		position: absolute;
		top: 2px;
		right: 2px;
		font-size: 12px;
		background-color: rgba(255, 255, 255, 0.7);
		border-radius: 3px;
		padding: 2px;
		pointer-events: none;
	}
</style>
