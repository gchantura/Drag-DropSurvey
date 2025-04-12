<script lang="ts">
	export let alertMessage: string;
	export let alertColor: string;
	import { Alert } from 'flowbite-svelte';
</script>

{#if alertMessage}
	<Alert color={alertColor}>
		{alertMessage}
	</Alert>
{/if}
