<script lang="ts">
	import ComponentToolbarRight from '$lib/components/SideBarRightComponents/ComponentToolbarRight.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { SurveyComponent } from '$lib/types/survey.ts';

	const dispatch = createEventDispatcher();

	const { selectedComponent } = $props<{
		selectedComponent: SurveyComponent | null;
	}>();

	let sidebarWidth = $state(300);
	let startX = $state(0);
	let startWidth = $state(0);
	let sidebarEl: HTMLDivElement;

	function handleResizeStart(event: MouseEvent | TouchEvent) {
		const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
		startX = clientX;
		startWidth = sidebarWidth;

		window.addEventListener('mousemove', handleResizing);
		window.addEventListener('touchmove', handleResizing, { passive: false });
		window.addEventListener('mouseup', handleResizeEnd);
		window.addEventListener('touchend', handleResizeEnd);
	}

	function handleResizing(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
		const newWidth = startWidth + (startX - clientX); // ← Rechts = Spiegelung der Logik
		if (newWidth > 200 && newWidth < 800) {
			sidebarWidth = newWidth;
		}
	}

	function handleResizeEnd() {
		window.removeEventListener('mousemove', handleResizing);
		window.removeEventListener('touchmove', handleResizing);
		window.removeEventListener('mouseup', handleResizeEnd);
		window.removeEventListener('touchend', handleResizeEnd);
	}
</script>

<!-- Template -->
<div
	bind:this={sidebarEl}
	class="sidebar-right-container allow-input relative h-full overflow-y-auto bg-gray-50 p-4 pr-6 dark:bg-gray-800 dark:text-gray-300"
	style={`width: ${sidebarWidth}px;`}
>
	<!-- Header -->
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold">Tool Bar Right</h2>
	</div>

	<!-- Komponentenleiste -->
	<ComponentToolbarRight />

	<!-- RESIZE HANDLE -->
	<button
		type="button"
		class="resize-handle absolute top-0 left-0 h-full w-2 cursor-col-resize bg-gray-200 dark:bg-gray-600"
		aria-label="Resize sidebar"
		onmousedown={handleResizeStart}
		ontouchstart={handleResizeStart}
	></button>
</div>

<style>
	.sidebar-right-container {
		position: absolute;
		right: 0;
		z-index: 10000;
	}

	.resize-handle {
		z-index: 50;
	}
</style>