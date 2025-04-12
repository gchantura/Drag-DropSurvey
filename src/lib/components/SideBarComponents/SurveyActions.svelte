<script lang="ts">
	export let onSave: () => void;
	export let onLoad: () => void;
	export let onClear: () => void;
</script>

<div class="mb-6 space-y-2">
	<button class="btn bg-green-600" on:click={onSave}>Save Survey</button>
	<button class="btn bg-yellow-600" on:click={onLoad}>Load Survey</button>
	<button class="btn bg-red-600" on:click={onClear}>Clear Survey</button>
</div>
