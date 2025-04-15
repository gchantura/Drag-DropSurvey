<!-- lib/components/MainComponents/RatingComponent.svelte -->
<script lang="ts">
	export let id: string;
	export let label: string;
	export let maxRating: number;
	export let required: boolean;
</script>

<div class="rating-component">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label>{label} {required && '*'}</label>
	<div class="rating-stars">
		{#each Array(maxRating).fill(0) as _, i}
			<button class="star" on:click|preventDefault={() => {}} name={id}> {i + 1} </button>
		{/each}
	</div>
</div>

<style>
	.rating-stars {
		display: flex;
		gap: 8px;
		margin-top: 8px;
	}
	.star {
		width: 40px;
		height: 40px;
		border: 1px solid #ddd;
		background: #fff;
		cursor: pointer;
	}
	.star:hover {
		background: #f0f0f0;
	}
</style>
