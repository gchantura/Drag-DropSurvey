<script lang="ts">
	import { themeStore } from '$lib/stores/themeCustomizerStore.ts';

	export let id: string;
	export let label: string = 'Text Area';
	export let required: boolean = false;
	export let placeholder: string = 'Enter text...';
	export let description: string = '';
	export let value: string = '';
	export let disabled: boolean = false;
	export let error: string = '';
	export let rows: number = 4;
	export let maxLength: number | undefined = undefined;
	export let minLength: number | undefined = undefined;
	export let resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';

	let textareaElement: HTMLTextAreaElement;
	let touched = false;
	let valid = true;
	let charCount = 0;

	$: charCount = value?.length || 0;

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		validateInput();
	}

	function handleBlur() {
		touched = true;
		validateInput();
	}

	function validateInput() {
		if (!textareaElement) return;

		valid = textareaElement.validity.valid;

		if (!valid && touched) {
			if (textareaElement.validity.valueMissing) {
				error = 'This field is required';
			} else if (textareaElement.validity.tooShort) {
				error = `Please enter at least ${minLength} characters`;
			} else if (textareaElement.validity.tooLong) {
				error = `Please enter no more than ${maxLength} characters`;
			} else {
				error = 'Invalid input';
			}
		} else {
			error = '';
		}
	}
</script>

<div class="textarea-component w-full">
	<label for={id} class="mb-1 block text-sm font-medium">
		{label}{required ? ' *' : ''}
	</label>

	{#if description}
		<p class="mt-1 mb-2 text-xs text-gray-500">
			{description}
		</p>
	{/if}

	<textarea
		{id}
		bind:this={textareaElement}
		class="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		class:border-red-500={error && touched}
		style="resize: {resize};"
		{placeholder}
		{disabled}
		{required}
		maxlength={maxLength}
		minlength={minLength}
		{rows}
		{value}
		on:input={handleInput}
		on:blur={handleBlur}
	></textarea>

	{#if maxLength}
		<div class="mt-1 flex justify-end">
			<span class="text-xs text-gray-500">
				{charCount}/{maxLength}
			</span>
		</div>
	{/if}

	{#if error && touched}
		<p class="mt-1 text-xs text-red-500">
			{error}
		</p>
	{/if}
</div>
