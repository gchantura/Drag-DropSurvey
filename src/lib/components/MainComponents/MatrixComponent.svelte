<!-- lib/components/MainComponents/MatrixComponent.svelte -->
<script lang="ts">
	export let id: string;
	export let label: string;
	export let columns: string[];
	export let rows: string[];
	export let required: boolean;
</script>

<div class="matrix-component">
	<label class="matrix-label">{label} {required && '*'}</label>
	<div class="table-container">
		<table class="matrix-table">
			<thead>
				<tr>
					<th></th>
					{#each columns as column}
						<th>{column}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row}
					<tr>
						<td>{row}</td>
						{#each columns as column}
							<td>
								<input type="radio" name="{id}-{row}" />
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.matrix-component {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.matrix-label {
		font-weight: 500;
		margin-bottom: 8px;
	}
	.table-container {
		overflow: auto;
		flex-grow: 1;
	}
	.matrix-table {
		border-collapse: collapse;
		width: 100%;
	}
	th,
	td {
		border: 1px solid #e5e7eb;
		padding: 8px;
		text-align: center;
		font-size: 0.875rem;
	}
	th {
		background-color: #f9fafb;
		font-weight: 500;
	}
	td:first-child {
		text-align: left;
		font-weight: 500;
	}
</style>
