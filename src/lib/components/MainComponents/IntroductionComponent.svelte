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
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 16px;
		background-color: rgba(243, 244, 246, 0.7);
		border-radius: 8px;
		border: 1px solid rgba(209, 213, 219, 0.5);
	}

	.intro-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 12px 0;
		color: #1f2937;
	}

	.intro-description {
		font-size: 0.875rem;
		line-height: 1.5;
		color: #4b5563;
	}
</style>
