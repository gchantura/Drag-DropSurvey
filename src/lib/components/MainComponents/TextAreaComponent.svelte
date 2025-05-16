<script lang="ts">
	import { Textarea } from 'flowbite-svelte';

	export let id: string;
	export let label: string;
	export let required: boolean = false;
	export let placeholder: string = 'Leave a comment...';

	let textareaProps = {
		id,
		name: id,
		label,
		rows: 5,
		placeholder,
		required
	};
</script>

<div class="textarea-component">
	<label class="textarea-label" for={id}>{label} {required ? '*' : ''}</label>
	<Textarea {...textareaProps} class="textarea-field resize-y" {id} />
</div>

<style>
	.textarea-component {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.textarea-label {
		margin-bottom: 4px;
		font-weight: 500;
	}
	:global(.textarea-field) {
		flex-grow: 1;
		border-radius: 4px;
		border: 1px solid #d1d5db;
	}
</style>
