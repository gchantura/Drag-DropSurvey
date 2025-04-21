<script lang="ts">
	import ToolbarAlignment from "$lib/components/CanvasComponents/ToolbarAlignment.svelte";
	import ToolbarDistribute from "$lib/components/CanvasComponents/ToolbarDistribute.svelte";
</script>

<div class="rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
	<h3 class="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">Alignment</h3>
	<div class="flex flex-col gap-2 sm:grid-cols-2">
		<ToolbarAlignment />
		<ToolbarDistribute />
	</div>
</div>

<style>
</style>
