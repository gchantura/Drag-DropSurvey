<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Label, Input } from 'flowbite-svelte';

	import type { SurveyComponent } from '../types/survey.js';

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
		e.stopPropagation(); // Prevent drag from starting
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
		<!-- Component type specific rendering -->
		{#if component.type === 'text'}
			<p>{component.label}</p>
		{:else if component.type === 'input'}
			<label for={`input-${component.id}`}>{component.label} {component.required ? '*' : ''}</label>
			<Input
				id={`input-${component.id}`}
				type="text"
				class="mt-1 w-full rounded border p-1"
				placeholder="Enter text..."
			/>
		{:else if component.type === 'textarea'}
			<label for={`textarea-${component.id}`}
				>{component.label} {component.required ? '*' : ''}</label
			>
			<textarea
				id={`textarea-${component.id}`}
				class="mt-1 w-full rounded border p-1"
				placeholder="Enter Comment"
				on:mousedown|stopPropagation
			></textarea>
		{:else if component.type === 'checkbox'}
			<fieldset>
				<legend>{component.label} {component.required ? '*' : ''}</legend>
				{#each component.options as option, i}
					<div class="mt-1 flex items-center text-center">
						<input type="checkbox" id={`${component.id}-opt-${i}`} class="mr-2" />
						<label for={`${component.id}-opt-${i}`}>{option}</label>
					</div>
				{/each}
			</fieldset>
		{:else if component.type === 'radio'}
			<fieldset>
				<legend>{component.label} {component.required ? '*' : ''}</legend>
				{#each component.options as option, i}
					<div class="mt-1 flex items-center">
						<input type="radio" name={component.id} id={`${component.id}-opt-${i}`} class="mr-2" />
						<label for={`${component.id}-opt-${i}`}>{option}</label>
					</div>
				{/each}
			</fieldset>
		{:else if component.type === 'dropdown'}
			<label for={`select-${component.id}`}>{component.label} {component.required ? '*' : ''}</label
			>
			<select
				id={`select-${component.id}`}
				class="mt-1 w-full rounded border p-1"
				on:mousedown|stopPropagation
			>
				<option value="">-- Select --</option>
				{#each component.options as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		{/if}
	</div>

	<!-- Resize handle inside component -->
	<div class="resize-handle" on:mousedown={onResizeHandle} aria-hidden="true"></div>
</div>

<style>
	.component {
		position: absolute;
	}

	.component-content {
		padding: 8px;
		/* No border or box shadow, just content */
	}

	.resize-handle {
		position: absolute;
		right: 5px;
		bottom: 5px;
		width: 14px;
		height: 14px;
		background-color: #3b82f6;
		cursor: nwse-resize;
		display: block;
	}
</style>
