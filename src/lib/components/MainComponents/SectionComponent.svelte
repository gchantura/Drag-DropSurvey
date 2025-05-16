<script lang="ts">
	export let label: string;
	export let description: string = '';
</script>

<div class="section-component">
	<div class="divider"></div>
	<h2 class="section-title">{label}</h2>

	{#if description}
		<p class="section-description">{description}</p>
	{/if}
</div>

<style>
	.section-component {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.divider {
		height: 3px;
		background-color: #3b82f6;
		margin-bottom: 12px;
		border-radius: 2px;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: #1f2937;
	}

	.section-description {
		font-size: 0.875rem;
		color: #4b5563;
		margin-top: 4px;
		line-height: 1.4;
	}
</style>
