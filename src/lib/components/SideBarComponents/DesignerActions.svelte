<!-- src/lib/components/SideBarComponents/DesignerActions.svelte -->
<script lang="ts">
	export let onClear: () => void;
	export let onUndo: () => void;
	export let onRedo: () => void;
	export let canUndo: boolean = false;
	export let canRedo: boolean = false;
</script>

<div class="mb-6 space-y-2">
	<div class="flex gap-2">
		<button
			class="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			on:click={onUndo}
			disabled={!canUndo}
		>
			<span class="flex items-center justify-center">
				<svg
					class="mr-1 h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M7.13 18.31H15.13C17.89 18.31 20.13 16.07 20.13 13.31C20.13 10.55 17.89 8.31 15.13 8.31H4.13"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-miterlimit="10"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M6.43 10.81L3.87 8.25L6.43 5.69"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Undo
			</span>
		</button>
		<button
			class="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			on:click={onRedo}
			disabled={!canRedo}
		>
			<span class="flex items-center justify-center">
				<svg
					class="mr-1 h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M16.87 18.31H8.87C6.11 18.31 3.87 16.07 3.87 13.31C3.87 10.55 6.11 8.31 8.87 8.31H19.87"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-miterlimit="10"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M17.57 10.81L20.13 8.25L17.57 5.69"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Redo
			</span>
		</button>
	</div>
	<button
		class="w-full rounded border border-red-300 bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 dark:border-red-950 dark:bg-red-900 dark:hover:bg-red-800"
		on:click={onClear}
	>
		Clear Design
	</button>
</div>
