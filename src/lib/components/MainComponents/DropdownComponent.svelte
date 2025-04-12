<script lang="ts">
	export let id: string;
	export let label: string;
	export let options: string[];
	export let required: boolean;
</script>

<label for={`select-${id}`}>{label} {required ? '*' : ''}</label>
<select id={`select-${id}`} class="mt-1 w-full rounded border p-1">
	<option value="">-- Select --</option>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>
