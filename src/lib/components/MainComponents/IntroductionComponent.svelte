<!-- src/lib/components/MainComponents/IntroductionComponent.svelte  -->

<script lang="ts">
	export let label: string;
	export let description: string = '';
</script>

<div class="introduction-component">
	<h2 class="intro-title">{label}</h2>

	{#if description}
		<div class="intro-description">
			{description}
		</div>
	{/if}
</div>

<style>
	.introduction-component {
		width: 100%;
		padding: 16px;
		background-color: #f3f4f6;
		border-radius: 8px;
	}

	.intro-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 12px 0;
	}

	.intro-description {
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
