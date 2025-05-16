<script lang="ts">
	import { Checkbox } from 'flowbite-svelte';

	export let id: string;
	export let label: string;
	export let options: string[];
	export let required: boolean;
</script>

<div class="checkbox-component">
	<fieldset class="checkbox-fieldset">
		<legend class="checkbox-legend">{label} {required ? '*' : ''}</legend>
		{#each options as option, i}
			<div class="checkbox-option">
				<Checkbox type="checkbox" id={`${id}-opt-${i}`} class="checkbox-input"></Checkbox>
				<label for={`${id}-opt-${i}`} class="checkbox-label">{option}</label>
			</div>
		{/each}
	</fieldset>
</div>

<style>
	.checkbox-component {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.checkbox-fieldset {
		border: none;
		padding: 0;
		margin: 0;
	}
	.checkbox-legend {
		font-weight: 500;
		margin-bottom: 8px;
	}
	.checkbox-option {
		display: flex;
		align-items: center;
		margin-bottom: 6px;
	}
	.checkbox-label {
		margin-left: 8px;
	}
</style>
