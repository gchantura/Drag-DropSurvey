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

	// Dynamic styles based on theme
	$: textareaStyle = {
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
		width: '100%',
		resize
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

<textarea
	{id}
	bind:this={textareaElement}
	style={styleToString(textareaStyle)}
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
		<span
			class="text-xs"
			style="color: {$themeStore.secondaryColor}; font-family: {$themeStore.fontFamily};"
		>
			{charCount}/{maxLength}
		</span>
	</div>
{/if}

{#if error && touched}
	<p
		class="mt-1 text-xs"
		style="color: {$themeStore.errorColor}; font-family: {$themeStore.fontFamily};"
	>
		{error}
	</p>
{/if}
