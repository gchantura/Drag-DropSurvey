<!-- src/lib/components/SideBarRightComponents/ComponentToolbarRight.svelte -->
<script lang="ts">
	import ToolbarAlign from '$lib/components/CanvasComponents/ToolbarAlignment.svelte';
	import ToolbarDistribute from '$lib/components/CanvasComponents/ToolbarDistribute.svelte';

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
</script>

<div class="rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
	<div class="flex flex-col gap-3">
		<div>
			<div class="justify-left flex items-center gap-x-2">
				<ToolbarAlign
					enabled={$canAlign}
					on:align={(event) => alignSelectedComponents(event.detail)}
				/>
			</div>
		</div>
		<div>
			<div class="Right_Sidebar_Distribution justify-left flex gap-x-2">
				<ToolbarDistribute
					enabled={$canDistribute}
					on:distribute={(event) => distributeSelectedComponents(event.detail)}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.Right_Sidebar_Distribution {
		margin-top: 1rem;
	}
</style>
