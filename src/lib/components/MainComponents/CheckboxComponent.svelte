<script lang="ts">
	import { Checkbox } from 'flowbite-svelte';

	export let id: string;
	export let label: string;
	export let options: string[];
	export let required: boolean;
</script>

<fieldset>
	<legend>{label} {required ? '*' : ''}</legend>
	{#each options as option, i}
		<div class="mt-1 flex items-center text-center">
			<Checkbox type="checkbox" id={`${id}-opt-${i}`} class="mr-2"></Checkbox>
			<label for={`${id}-opt-${i}`}>{option}</label>
		</div>
	{/each}
</fieldset>
