<script lang="ts">
	export let id: string;
	export let label: string;
	export let maxRating: number;
	export let required: boolean;
</script>

<div class="rating-component">
	<label class="rating-label">{label} {required && '*'}</label>
	<div class="rating-stars">
		{#each Array(maxRating).fill(0) as _, i}
			<button class="star" on:click|preventDefault={() => {}} name={id}>
				{i + 1}
			</button>
		{/each}
	</div>
</div>

<style>
	.rating-component {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.rating-label {
		font-weight: 500;
		margin-bottom: 12px;
	}
	.rating-stars {
		display: flex;
		gap: 8px;
	}
	.star {
		width: 40px;
		height: 40px;
		border: 1px solid #d1d5db;
		background: #fff;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 500;
		color: #4b5563;
		transition: all 0.2s;
	}
	.star:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}
</style>
