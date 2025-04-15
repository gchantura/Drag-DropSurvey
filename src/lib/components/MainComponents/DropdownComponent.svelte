<script lang="ts">
	import { Label, Select } from 'flowbite-svelte';
	export let id: string;
	export let label: string;
	export let options: string[];
	export let required: boolean;

	let selected: string = '';
</script>

<Label for={`select-${id}`} class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
	{label}
	{required ? '*' : ''}
</Label>

<Select
	id={`select-${id}`}
	bind:value={selected}
	class="w-full"
	items={options.map((opt) => ({ value: opt, name: opt }))}
	placeholder="-- Select --"
/>
