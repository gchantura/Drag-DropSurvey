<script lang="ts">
	export let id: string;
	export let label: string = 'Dropdown';
	export let options: string[] = [];
	export let required: boolean = false;
	export let description: string = '';
	export let disabled: boolean = false;
	export let error: string = '';
	export let value: string = '';
	export let placeholder: string = '-- Select an option --';

	let selectElement: HTMLSelectElement;
	let touched = false;

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		value = target.value;
		validateSelection();
	}

	function handleBlur() {
		touched = true;
		validateSelection();
	}

	function validateSelection() {
		if (!selectElement) return;

		if (required && !value && touched) {
			error = 'Please select an option';
		} else {
			error = '';
		}
	}
</script>

<label for={id}>
	{label}{required ? ' *' : ''}
</label>

{#if description}
	<p>{description}</p>
{/if}

<select
	{id}
	bind:this={selectElement}
	{disabled}
	{required}
	{value}
	on:change={handleChange}
	on:blur={handleBlur}
>
	<option value="" disabled>{placeholder}</option>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>

{#if error && touched}
	<p>{error}</p>
{/if}
