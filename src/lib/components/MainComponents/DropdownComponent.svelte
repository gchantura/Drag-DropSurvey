<script lang="ts">
	import { Label, Select } from 'flowbite-svelte';
	export let id: string;
	export let label: string;
	export let options: string[];
	export let required: boolean;

	let selected: string = '';
</script>

<div class="dropdown-component">
	<Label for={`select-${id}`} class="dropdown-label">
		{label}
		{required ? '*' : ''}
	</Label>

	<Select
		id={`select-${id}`}
		bind:value={selected}
		class="dropdown-select"
		items={options.map((opt) => ({ value: opt, name: opt }))}
		placeholder="-- Select --"
	/>
</div>

<style>
	.dropdown-component {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.dropdown-label {
		margin-bottom: 4px;
		font-weight: 500;
	}
	:global(.dropdown-select) {
		border-radius: 4px;
		border: 1px solid #d1d5db;
	}
</style>
