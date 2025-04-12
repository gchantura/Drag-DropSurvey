<script lang="ts">
	export let id: string;
	export let label: string;
	export let required: boolean = false;
</script>

<label for={id} class="block text-sm font-medium text-gray-700">
	{label}
	{required ? '*' : ''}
</label>
<textarea
	{id}
	class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
	rows="4"
	{required}
	on:mousedown|stopPropagation
></textarea>
