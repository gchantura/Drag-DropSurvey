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

<Textarea {...textareaProps} class="resize-y" />
