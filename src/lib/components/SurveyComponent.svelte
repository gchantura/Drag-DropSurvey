<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import type { SurveyComponent } from '../types/survey.js';

	// Import all subcomponents
	import TextComponent from './MainComponents/TextComponent.svelte';
	import InputComponent from './MainComponents/InputComponent.svelte';
	import TextAreaComponent from './MainComponents/TextAreaComponent.svelte';
	import CheckboxComponent from './MainComponents/CheckboxComponent.svelte';
	import RadioComponent from './MainComponents/RadioComponent.svelte';
	import DropdownComponent from './MainComponents/DropdownComponent.svelte';

	export let component: SurveyComponent;
	export let isSelected: boolean = false;

	const dispatch = createEventDispatcher<{
		select: SurveyComponent;
		startDrag: { event: MouseEvent; component: SurveyComponent };
		startResize: { event: MouseEvent; component: SurveyComponent };
	}>();

	function onMouseDown(e: MouseEvent) {
		if (!(e.target as HTMLElement).classList.contains('component-content')) {
			dispatch('startDrag', { event: e, component });
		}
	}

	function onResizeHandle(e: MouseEvent) {
		dispatch('startResize', { event: e, component });
		e.stopPropagation();
	}

	function onSelect(e: MouseEvent | KeyboardEvent) {
		if (
			e.type === 'keydown' &&
			(e as KeyboardEvent).key !== 'Enter' &&
			(e as KeyboardEvent).key !== ' '
		) {
			return;
		}
		if (e.type === 'keydown') {
			e.preventDefault();
		}
		dispatch('select', component);
	}
</script>

<div
	class="component {isSelected ? 'selected' : ''}"
	style="top: {component.y}px; left: {component.x}px; width: {component.width}px; height: {component.height}px; 
		font-family: {component.fontFamily}; font-size: {component.fontSize}px; 
		color: {component.color};"
	on:mousedown={onMouseDown}
	on:click|stopPropagation={() => dispatch('select', component)}
	on:keydown={onSelect}
	tabindex="0"
	role="button"
	aria-label="{component.type} component: {component.label}"
	aria-pressed={isSelected}
>
	<div class="component-content">
		{#if component.type === 'text'}
			<TextComponent label={component.label} />
		{:else if component.type === 'input'}
			<InputComponent id={component.id} label={component.label} required={component.required} />
		{:else if component.type === 'textarea'}
			<TextAreaComponent id={component.id} label={component.label} required={component.required} />
		{:else if component.type === 'checkbox'}
			<CheckboxComponent
				id={component.id}
				label={component.label}
				options={component.options}
				required={component.required}
			/>
		{:else if component.type === 'radio'}
			<RadioComponent
				id={component.id}
				label={component.label}
				options={component.options}
				required={component.required}
			/>
		{:else if component.type === 'dropdown'}
			<DropdownComponent
				id={component.id}
				label={component.label}
				options={component.options}
				required={component.required}
			/>
		{:else}
			<p>Unknown component type: {component.type}</p>
		{/if}
	</div>

	<div class="resize-handle" on:mousedown={onResizeHandle} aria-hidden="true"></div>
</div>

<style>
	.component {
		position: absolute;
	}

	.component-content {
		padding: 8px;
	}

	.resize-handle {
		position: absolute;
		right: 5px;
		bottom: 5px;
		width: 14px;
		height: 14px;
		background-color: #3b82f6;
		cursor: nwse-resize;
	}
</style>
