<script lang="ts">
	export let onSave: () => void;
	export let onLoad: () => void;
	export let onClear: () => void;
</script>

<div class="mb-6 space-y-2">
	<button
		class="min-h-[24px] items-center gap-3overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-left transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
		on:click={onSave}>Save Survey</button
	>
	<button
	class="min-h-[24px] items-center text-white gap-3 overflow-hidden rounded-lg border border-lime-300 bg-lime-500 p-3 text-left transition hover:bg-lime-600 dark:border-lime-950 dark:bg-lime-900 dark:hover:bg-lime-800"
	on:click={onLoad}>Load Survey</button
	>
	<button
		class="min-h-[24px] items-center text-white gap-3 overflow-hidden rounded-lg border border-red-300 bg-red-500 p-3 text-left transition hover:bg-red-600 dark:border-red-950 dark:bg-red-900 dark:hover:bg-red-800"
		on:click={onClear}>Clear Survey</button
	>
</div>
