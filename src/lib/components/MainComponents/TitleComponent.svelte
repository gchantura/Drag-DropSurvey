<!-- src/lib/components/MainComponents/TitleComponent.svelte  -->

<script lang="ts">
	export let label: string;
</script>

<div class="title-component">
	<h1 class="survey-title">{label}</h1>
</div>

<style>
	.title-component {
		width: 100%;
		text-align: center;
	}

	.survey-title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0;
	}
</style>
