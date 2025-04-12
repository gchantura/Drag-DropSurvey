<script lang="ts">
	export let id: string;
	export let label: string;
	export let options: string[];
	export let required: boolean;
</script>

<fieldset>
	<legend>{label} {required ? '*' : ''}</legend>
	{#each options as option, i}
		<div class="mt-1 flex items-center">
			<input type="radio" name={id} id={`${id}-opt-${i}`} class="mr-2" />
			<label for={`${id}-opt-${i}`}>{option}</label>
		</div>
	{/each}
</fieldset>
