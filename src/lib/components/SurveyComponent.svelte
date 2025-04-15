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
	import FileAttachmentComponent from './MainComponents/FileAttachmentComponent.svelte';
	import FileUploadComponent from './MainComponents/FileUploadComponent.svelte';
	import SectionComponent from './MainComponents/SectionComponent.svelte';
	import TitleComponent from './MainComponents/TitleComponent.svelte';
	import IntroductionComponent from './MainComponents/IntroductionComponent.svelte';
	import MatrixComponent from './MainComponents/MatrixComponent.svelte';
	import RatingComponent from './MainComponents/RatingComponent.svelte';

	export let component: SurveyComponent;
	export let isSelected: boolean = false;
	// svelte-ignore export_let_unused
	export let isActive = false;

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
		color: {component.color}; background-color: {component.bgColor};"
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
		{:else if component.type === 'fileAttachment'}
			<FileAttachmentComponent
				id={component.id}
				label={component.label}
				src={component.src || ''}
				required={component.required}
			/>
		{:else if component.type === 'matrix'}
			<MatrixComponent
				id={component.id}
				label={component.label}
				columns={component.columns}
				rows={component.rows}
				required={component.required}
			/>
		{:else if component.type === 'rating'}
			<RatingComponent
				id={component.id}
				label={component.label}
				maxRating={component.maxRating || 5}
				required={component.required}
			/>
		{:else if component.type === 'fileUpload'}
			<FileUploadComponent
				id={component.id}
				label={component.label}
				required={component.required}
				acceptedFileTypes={component.acceptedFileTypes || '.pdf,.doc,.docx,.jpg,.png'}
				maxFileSize={component.maxFileSize || 5}
			/>
		{:else if component.type === 'section'}
			<SectionComponent label={component.label} description={component.description || ''} />
		{:else if component.type === 'title'}
			<TitleComponent label={component.label} />
		{:else if component.type === 'introduction'}
			<IntroductionComponent label={component.label} description={component.description || ''} />
		{:else}
			<p>Unknown component type: {component.type}</p>
		{/if}
	</div>

	<div class="resize-handle" on:mousedown={onResizeHandle} aria-hidden="true"></div>
</div>

<style>
	.component {
		position: absolute;
		border: 1px solid transparent;
	}

	.component.selected {
		border: 1px solid #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
	}

	.component-content {
		padding: 8px;
		width: 100%;
		height: 100%;
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
