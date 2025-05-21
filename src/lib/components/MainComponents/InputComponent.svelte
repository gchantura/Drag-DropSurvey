<script lang="ts">
	import { themeStore } from '$lib/stores/themeCustomizerStore.ts';

	export let id: string;
	export let label: string = 'Input Field';
	export let required: boolean = false;
	export let placeholder: string = 'Enter text...';
	export let description: string = '';
	export let value: string = '';
	export let disabled: boolean = false;
	export let error: string = '';
	export let maxLength: number | undefined = undefined;
	export let minLength: number | undefined = undefined;
	export let pattern: string | undefined = undefined;
	export let autocomplete:
		| 'on'
		| 'off'
		| 'name'
		| 'email'
		| 'username'
		| 'new-password'
		| 'current-password'
		| 'one-time-code'
		| 'tel'
		| 'street-address'
		| 'country'
		| 'postal-code' = 'off';

	let inputElement: HTMLInputElement;
	let touched = false;
	let valid = true;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		validateInput();
	}

	function handleBlur() {
		touched = true;
		validateInput();
	}

	function validateInput() {
		if (!inputElement) return;

		valid = inputElement.validity.valid;

		if (!valid && touched) {
			if (inputElement.validity.valueMissing) {
				error = 'This field is required';
			} else if (inputElement.validity.tooShort) {
				error = `Please enter at least ${minLength} characters`;
			} else if (inputElement.validity.tooLong) {
				error = `Please enter no more than ${maxLength} characters`;
			} else if (inputElement.validity.patternMismatch) {
				error = 'Please enter a valid value';
			} else {
				error = 'Invalid input';
			}
		} else {
			error = '';
		}
	}
</script>

<div class="input-component w-full">
	<label for={id} class="mb-1 block text-sm font-medium">
		{label}{required ? ' *' : ''}
	</label>

	{#if description}
		<p class="mt-1 mb-2 text-xs text-gray-500">
			{description}
		</p>
	{/if}

	<input
		{id}
		bind:this={inputElement}
		type="text"
		class="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		class:border-red-500={error && touched}
		{placeholder}
		{disabled}
		{required}
		maxlength={maxLength}
		minlength={minLength}
		{pattern}
		{autocomplete}
		{value}
		on:input={handleInput}
		on:blur={handleBlur}
	/>

	{#if error && touched}
		<p class="mt-1 text-xs text-red-500">
			{error}
		</p>
	{/if}
</div>
