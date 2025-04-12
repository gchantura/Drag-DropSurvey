<script lang="ts">
	export let id: string;
	export let label: string;
	export let required: boolean;
	import { Input } from 'flowbite-svelte';
</script>

<label for={`input-${id}`}>{label} {required ? '*' : ''}</label>
<Input
	id={`input-${id}`}
	type="text"
	class="mt-1 w-full rounded border p-1"
	placeholder="Enter text..."
/>
