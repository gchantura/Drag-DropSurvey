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

<div class="dropdown-component w-full">
	<label for={id} class="mb-1 block text-sm font-medium">
		{label}{required ? ' *' : ''}
	</label>

	{#if description}
		<p class="mt-1 mb-2 text-xs text-gray-500">{description}</p>
	{/if}

	<select
		{id}
		bind:this={selectElement}
		class="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		class:border-red-500={error && touched}
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
		<p class="mt-1 text-xs text-red-500">{error}</p>
	{/if}
</div>
