<!-- lib/components/MainComponents/MatrixComponent.svelte -->
<script lang="ts">
	export let id: string;
	export let label: string;
	export let columns: string[];
	export let rows: string[];
	export let required: boolean;
</script>

<div class="matrix-component">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label>{label} {required && '*'}</label>
	<table>
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

<style>
	table {
		border-collapse: collapse;
		margin-top: 8px;
	}
	th,
	td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: center;
	}
	th {
		background-color: #f5f5f5;
	}
</style>
