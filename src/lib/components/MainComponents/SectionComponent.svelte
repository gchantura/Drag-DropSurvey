<!-- src/lib/components/MainComponents/SectionComponent.svelte  -->

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
	}

	.divider {
		height: 2px;
		background-color: #3b82f6;
		margin-bottom: 8px;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 8px 0;
	}

	.section-description {
		font-size: 0.875rem;
		color: #4b5563;
		margin-top: 4px;
	}
</style>
