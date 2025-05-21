<script lang="ts">
	export let id: string;
	export let label: string;
	export let options: string[];
	export let required: boolean;
</script>

<fieldset class="radio-component">
	<legend class="mb-2 font-medium">{label} {required ? '*' : ''}</legend>
	<div class="space-y-2">
		{#each options as option, i}
			<div class="flex items-center">
				<input
					type="radio"
					name={id}
					id={`${id}-opt-${i}`}
					class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<label for={`${id}-opt-${i}`} class="ml-2 text-sm">{option}</label>
			</div>
		{/each}
	</div>
</fieldset>

<style>
	.radio-component {
		width: 100%;
		border: none;
		padding: 0;
	}
</style>
