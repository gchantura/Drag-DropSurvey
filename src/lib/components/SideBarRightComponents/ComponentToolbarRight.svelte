<!-- src/lib/components/SideBarRightComponents/ComponentToolbarRight.svelte -->
<script lang="ts">
	import { get } from 'svelte/store';
	import ToolbarAlign from '$lib/components/CanvasComponents/ToolbarAlignment.svelte';
	import ToolbarDistribute from '$lib/components/CanvasComponents/ToolbarDistribute.svelte';
	import PropertiesEditor from '$lib/components/SideBarComponents/PropertiesEditor.svelte';

	import type { SurveyComponent } from '$lib/types/types.ts';
	const { selectedComponent } = $props<{ selectedComponent: SurveyComponent | null }>();

	import {
		canDistribute, // Use specific derived store
		distributeSelectedComponents
	} from '$lib/stores/distributionStore.ts'; // Keep combined store name for simplicity or rename file if preferred
	import {
		canAlign, // Use specific derived store
		alignSelectedComponents,
		selectedComponentIds
	} from '$lib/stores/alignmentStore.ts'; // Keep combined store name for simplicity or rename file if preferred
	import { componentsStore, updateComponent } from '$lib/stores/designStore.ts';
</script>

<div class="rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
	<h3 class="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
		Alignment & Distribution
	</h3>
	<div class="flex flex-col gap-3">
		<div>
			<p class="mb-2 text-sm text-gray-600 dark:text-gray-400">Align selected components:</p>
			<div class="flex items-center justify-center gap-x-2">
				<ToolbarAlign
					enabled={$canAlign}
					on:align={(event) => alignSelectedComponents(event.detail)}
				/>
			</div>
		</div>
		<div>
			<p class="mb-2 text-sm text-gray-600 dark:text-gray-400">Distribute evenly (3+ items):</p>
			<div class="flex items-center justify-center gap-x-2">
				<ToolbarDistribute
					enabled={$canDistribute}
					on:distribute={(event) => distributeSelectedComponents(event.detail)}
				/>
			</div>
		</div>
	</div>
</div>

<style>
</style>
