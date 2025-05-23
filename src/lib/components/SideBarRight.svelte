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
	class="sidebar-right-container allow-input bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
	style="width: {sidebarWidth}px;"
>
	<button
		type="button"
		class="resize-handle bg-gray-200 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500"
		aria-label="Resize sidebar"
		onmousedown={handleResizeStart}
		ontouchstart={handleResizeStart}
	></button>

	<div class="header-container">
		<h2 class="header-title">Properties</h2>
	</div>

	<ComponentToolbarRight {selectedComponent} />

	<div class="properties-section border-gray-300 dark:border-gray-700">
		<h3 class="section-title">Component Properties</h3>
		<PropertiesEditor component={selectedComponent} />
	</div>
</div>

<style>
	.sidebar-right-container {
		position: relative;
		height: 100%;
		overflow-y: auto;
		z-index: 1000;
		padding: 1rem;
		padding-left: 1.5rem;
	}

	.resize-handle {
		position: absolute;
		z-index: 10000;
		top: 0;
		left: 0;
		z-index: 50;
		height: 100%;
		width: 0.3rem;
		cursor: col-resize;
		touch-action: none;
	}

	.header-container {
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-title {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.properties-section {
		margin-top: 1.5rem;
		border-top-width: 1px;
		border-top-style: solid;
		padding-top: 1rem;
	}

	.section-title {
		margin-bottom: 0.5rem;
		font-size: 1.125rem;
		font-weight: 500;
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.sidebar-right-container {
			width: 100% !important;
			padding: 0.5rem;
		}

		.resize-handle {
			display: none;
		}
	}
</style>
