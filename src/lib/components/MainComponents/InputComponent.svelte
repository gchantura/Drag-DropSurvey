<script lang="ts">
	export let id: string;
	export let label: string;
	export let required: boolean;
	import { Input } from 'flowbite-svelte';
</script>

<div class="input-component">
	<label for={`input-${id}`} class="input-label">{label} {required ? '*' : ''}</label>
	<Input id={`input-${id}`} type="text" class="input-field" placeholder="Enter text..." />
</div>

<style>
	.input-component {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.input-label {
		margin-bottom: 4px;
		font-weight: 500;
	}
	:global(.input-field) {
		border-radius: 4px;
		border: 1px solid #d1d5db;
	}
</style>
