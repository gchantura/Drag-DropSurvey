<!-- lib/components/Canvas.svelte -->
<script lang="ts">
	import { componentsStore, updateComponent } from '$lib/stores/surveyStore.ts';
	import SurveyComponent from './SurveyComponent.svelte';
	import type { SurveyComponent as SurveyComponentType } from '$lib/types/survey.ts';

	export let selectedComponent: SurveyComponentType | null = null;

	// Create a two-way binding
	export const setSelectedComponent = (comp: SurveyComponentType | null) => {
		selectedComponent = comp;
	};

	// Track mouse operations
	let isDragging = false;
	let isResizing = false;
	let startX = 0;
	let startY = 0;
	let startLeft = 0;
	let startTop = 0;
	let startWidth = 0;
	let startHeight = 0;
	let activeComponentId: string | null = null;

	function onStartDrag(e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>) {
		const { event, component } = e.detail;

		isDragging = true;
		activeComponentId = component.id;
		selectedComponent = component;
		startX = event.clientX;
		startY = event.clientY;
		startLeft = component.x;
		startTop = component.y;
		event.preventDefault();
	}

	function onStartResize(e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>) {
		const { event, component } = e.detail;

		isResizing = true;
		activeComponentId = component.id;
		selectedComponent = component;
		startX = event.clientX;
		startY = event.clientY;
		startWidth = component.width;
		startHeight = component.height;
		event.preventDefault();
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging && activeComponentId) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;

			updateComponent(activeComponentId, {
				x: startLeft + dx,
				y: startTop + dy
			});
		} else if (isResizing && activeComponentId) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;

			// Ensure minimum size
			const newWidth = Math.max(50, startWidth + dx);
			const newHeight = Math.max(50, startHeight + dy);

			updateComponent(activeComponentId, {
				width: newWidth,
				height: newHeight
			});
		}
	}

	function endMouseOperation() {
		isDragging = false;
		isResizing = false;
		activeComponentId = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!selectedComponent) return;

		const STEP = e.shiftKey ? 10 : 1;
		let x = selectedComponent.x;
		let y = selectedComponent.y;
		let update = false;

		switch (e.key) {
			case 'ArrowUp':
				y -= STEP;
				update = true;
				break;
			case 'ArrowDown':
				y += STEP;
				update = true;
				break;
			case 'ArrowLeft':
				x -= STEP;
				update = true;
				break;
			case 'ArrowRight':
				x += STEP;
				update = true;
				break;
			case 'Delete':
				// Handled in the parent component
				break;
			default:
				return;
		}

		if (update) {
			updateComponent(selectedComponent.id, { x, y });
			e.preventDefault();
		}
	}

	function handleCanvasClick() {
		selectedComponent = null;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="relative h-full w-full overflow-auto border bg-white p-4"
	aria-label="Survey canvas"
	on:mousemove={handleMouseMove}
	on:mouseup={endMouseOperation}
	on:mouseleave={endMouseOperation}
	on:keydown={handleKeydown}
	role="application"
	tabindex="0"
>
	<h2 class="sr-only">Survey Canvas</h2>
	<div
		class="canvas-container relative min-h-full border-2 border-dashed border-gray-300 p-4"
		on:click={handleCanvasClick}
		role="presentation"
	>
		{#each $componentsStore as component (component.id)}
			<SurveyComponent
				{component}
				isSelected={selectedComponent?.id === component.id}
				on:select={(e) => setSelectedComponent(e.detail)}
				on:startDrag={onStartDrag}
				on:startResize={onStartResize}
			/>
		{/each}
	</div>
</div>

<style>
</style>
