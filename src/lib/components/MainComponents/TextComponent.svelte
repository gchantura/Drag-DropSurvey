<script lang="ts">
	export let label: string;
</script>

<div class="text-component">
	<p class="text-content">{label}</p>
</div>

<style>
	.text-component {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
	}
	.text-content {
		margin: 0;
		line-height: 1.4;
	}
</style>
