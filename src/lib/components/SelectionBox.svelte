<script lang="ts">
	export let active: boolean = false;
	export let startX: number = 0;
	export let startY: number = 0;
	export let endX: number = 0;
	export let endY: number = 0;
</script>

{#if active}
	<div
		class="bg-opacity-20 pointer-events-none absolute border-2 border-blue-500 bg-blue-100"
		style="
            left: {Math.min(startX, endX)}px;
            top: {Math.min(startY, endY)}px;
            width: {Math.abs(endX - startX)}px;
            height: {Math.abs(endY - startY)}px;
        "
	></div>
{/if}
