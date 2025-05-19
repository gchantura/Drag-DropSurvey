<script lang="ts">
	import ToolbarAlign from '$lib/components/CanvasComponents/ToolbarAlignment.svelte';
	import ToolbarDistribute from '$lib/components/CanvasComponents/ToolbarDistribute.svelte';
	import TextOptions from '$lib/components/SideBarRightComponents/TextOptions/TypographyOptions.svelte';
	import PropertiesEditor from '$lib/components/SideBarComponents/PropertiesEditor.svelte';

	import type { SurveyComponent } from '$lib/types/types.ts';
	const { selectedComponent } = $props<{ selectedComponent: SurveyComponent | null }>();

	import {
		canDistribute, // Use specific derived store
		distributeSelectedComponents
	} from '$lib/stores/distributionStore.ts'; // Keep combined store name for simplicity or rename file if preferred
	import {
		canAlign, // Use specific derived store
		alignSelectedComponents
	} from '$lib/stores/alignmentStore.ts'; // Keep combined store name for simplicity or rename file if preferred
</script>

<div class="rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
	<h3 class="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
		Alignment & Distribution
	</h3>
	<div class="flex flex-col gap-2 sm:grid-cols-2">
		<div class="flex items-center justify-center gap-x-6">
			<ToolbarAlign
				enabled={$canAlign}
				on:align={(event) => alignSelectedComponents(event.detail)}
			/>
		</div>
		<div class="flex items-center justify-center gap-x-6">
			<ToolbarDistribute
				enabled={$canDistribute}
				on:distribute={(event) => distributeSelectedComponents(event.detail)}
			/>
		</div>
	</div>
</div>

<style>
</style>
