<script lang="ts">
	export let id: string;
	export let label: string;
	export let options: string[];
	export let required: boolean;
</script>

<div class="radio-component">
	<fieldset class="radio-fieldset">
		<legend class="radio-legend">{label} {required ? '*' : ''}</legend>
		{#each options as option, i}
			<div class="radio-option">
				<input type="radio" name={id} id={`${id}-opt-${i}`} class="radio-input" />
				<label for={`${id}-opt-${i}`} class="radio-label">{option}</label>
			</div>
		{/each}
	</fieldset>
</div>

<style>
	.radio-component {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.radio-fieldset {
		border: none;
		padding: 0;
		margin: 0;
	}
	.radio-legend {
		font-weight: 500;
		margin-bottom: 8px;
	}
	.radio-option {
		display: flex;
		align-items: center;
		margin-bottom: 6px;
	}
	.radio-input {
		margin: 0;
	}
	.radio-label {
		margin-left: 8px;
	}
</style>
