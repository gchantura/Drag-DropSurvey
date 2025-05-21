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

	// Dynamic styles based on theme
	$: inputStyle = {
		fontFamily: $themeStore.fontFamily,
		fontSize: $themeStore.fontSize,
		color: $themeStore.textColor,
		backgroundColor: $themeStore.backgroundColor,
		borderRadius: $themeStore.borderRadius,
		borderWidth: $themeStore.borderWidth,
		borderColor: error && touched ? $themeStore.errorColor : $themeStore.borderColor,
		padding: $themeStore.inputPadding,
		boxShadow: $themeStore.boxShadow,
		transition: `all ${$themeStore.transitionDuration} ease-in-out`,
		width: '100%'
	};

	// Convert style object to inline style string
	function styleToString(style: Record<string, string>) {
		return Object.entries(style)
			.map(([key, value]) => `${key}: ${value}`)
			.join('; ');
	}
</script>

<label
	for={id}
	class="block text-sm font-medium"
	style="color: {$themeStore.textColor}; font-family: {$themeStore.fontFamily};"
>
	{label}{required ? ' *' : ''}
</label>

{#if description}
	<p
		class="mt-1 mb-2 text-xs"
		style="color: {$themeStore.secondaryColor}; font-family: {$themeStore.fontFamily};"
	>
		{description}
	</p>
{/if}

<input
	{id}
	bind:this={inputElement}
	type="text"
	style={styleToString(inputStyle)}
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
	<p
		class="mt-1 text-xs"
		style="color: {$themeStore.errorColor}; font-family: {$themeStore.fontFamily};"
	>
		{error}
	</p>
{/if}
