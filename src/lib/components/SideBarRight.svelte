<!-- src/lib/components/SideBarRight.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent } from '$lib/types/types.ts';
	import ComponentToolbarRight from '$lib/components/SideBarRightComponents/ComponentToolbarRight.svelte';
	import PropertiesEditor from '$lib/components/SideBarComponents/PropertiesEditor.svelte';

	const dispatch = createEventDispatcher();
	const { selectedComponent } = $props<{ selectedComponent: SurveyComponent | null }>();

	let sidebarWidth = $state(300);
	let startX = $state(0);
	let startWidth = $state(0);
	let sidebarEl: HTMLDivElement;

	function handleResizeStart(event: MouseEvent | TouchEvent) {
		const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
		startX = clientX;
		startWidth = sidebarWidth;
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
		window.addEventListener('mousemove', handleResizing);
		window.addEventListener('touchmove', handleResizing, { passive: false });
		window.addEventListener('mouseup', handleResizeEnd);
		window.addEventListener('touchend', handleResizeEnd);
	}

	function handleResizing(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
		const newWidth = startWidth + (startX - clientX);
		if (newWidth > 200 && newWidth < 800) {
			sidebarWidth = newWidth;
		}
	}

	function handleResizeEnd() {
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		window.removeEventListener('mousemove', handleResizing);
		window.removeEventListener('touchmove', handleResizing);
		window.removeEventListener('mouseup', handleResizeEnd);
		window.removeEventListener('touchend', handleResizeEnd);
	}
</script>

<div
	bind:this={sidebarEl}
	class="sidebar-right-container allow-input relative h-full overflow-y-auto bg-gray-50 p-4 pl-6 dark:bg-gray-800 dark:text-gray-300"
	style="width: {sidebarWidth}px;"
>
	<button
		type="button"
		class="resize-handle absolute top-0 left-0 z-10 h-full w-2 cursor-col-resize touch-none bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
		aria-label="Resize sidebar"
		onmousedown={handleResizeStart}
		ontouchstart={handleResizeStart}
	></button>

	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold">Properties</h2>
	</div>

	<ComponentToolbarRight {selectedComponent} />

	<div class="mt-6 border-t pt-4 dark:border-gray-700">
		<h3 class="mb-2 text-lg font-medium">Component Properties</h3>
		<PropertiesEditor component={selectedComponent} />
	</div>
</div>

<style>
	.resize-handle {
		z-index: 50;
	}
</style>
