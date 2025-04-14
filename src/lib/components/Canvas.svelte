<script lang="ts">
	import {
		componentsStore,
		updateComponent,
		deleteComponent,
		duplicateComponent
	} from '$lib/stores/surveyStore.ts';
	import { onMount, tick } from 'svelte';
	import SurveyComponent from './SurveyComponent.svelte';
	import CanvasRuler from './CanvasRuler.svelte';
	import CanvasGuide from './CanvasGuide.svelte';
	import type { SurveyComponent as SurveyComponentType } from '$lib/types/survey.ts';

	export let selectedComponent: SurveyComponentType | null = null;
	export let units: 'cm' | 'inches' | 'px' = 'cm';

	// Ruler settings
	const DPI = 96; // Standard screen DPI
	const CM_PER_INCH = 2.54;
	const PIXEL_PER_CM = DPI / CM_PER_INCH;
	const PIXEL_PER_INCH = DPI;

	// Canvas dimensions and container references
	let canvasWidth = 800;
	let canvasHeight = 1100;
	let canvasRef: HTMLDivElement;
	let containerRef: HTMLDivElement;
	let canvasScale = 1;
	let canvasOffsetX = 0;
	let canvasOffsetY = 0;

	// Viewport settings
	let viewportWidth = 0;
	let viewportHeight = 0;

	// Mouse position for displaying in ruler
	let mouseX = 0;
	let mouseY = 0;

	// Snap to grid settings
	let enableSnap = true;
	let gridSize = getGridSize();

	// Guides
	let horizontalGuides: number[] = [100, 200];
	let verticalGuides: number[] = [100, 300];
	let showGuides = true;
	let draggingGuide: { direction: 'horizontal' | 'vertical'; index: number } | null = null;

	// Context menu
	let showContextMenu = false;
	let contextMenuX = 0;
	let contextMenuY = 0;

	// Selection box for multi-select
	let selectionBox = {
		active: false,
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0
	};
	let multiSelectedComponents: string[] = [];

	// Page settings
	let pageFormat = 'A4';
	const pageSizes = {
		A4: { width: (210 * PIXEL_PER_CM) / 10, height: (297 * PIXEL_PER_CM) / 10 },
		Letter: { width: 8.5 * PIXEL_PER_INCH, height: 11 * PIXEL_PER_INCH },
		Custom: { width: canvasWidth, height: canvasHeight }
	};

	function getGridSize() {
		switch (units) {
			case 'cm':
				return PIXEL_PER_CM / 2; // 0.5cm
			case 'inches':
				return PIXEL_PER_INCH / 4; // 0.25in
			case 'px':
				return 10; // 10px
			default:
				return PIXEL_PER_CM / 2;
		}
	}

	function updatePageFormat() {
		if (pageFormat !== 'Custom') {
			const size = pageSizes[pageFormat];
			canvasWidth = size.width;
			canvasHeight = size.height;
		}
	}

	onMount(() => {
		updatePageFormat();
		if (containerRef) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					viewportWidth = entry.contentRect.width;
					viewportHeight = entry.contentRect.height;
				}
			});
			resizeObserver.observe(containerRef);

			return () => {
				resizeObserver.disconnect();
			};
		}
	});

	// Create a two-way binding
	export const setSelectedComponent = (comp: SurveyComponentType | null) => {
		selectedComponent = comp;
		multiSelectedComponents = comp ? [comp.id] : [];
	};

	// Track mouse operations
	let isDragging = false;
	let isResizing = false;
	let isPanning = false;
	let startX = 0;
	let startY = 0;
	let startLeft = 0;
	let startTop = 0;
	let startWidth = 0;
	let startHeight = 0;
	let activeComponentId: string | null = null;
	let lastClickTime = 0;

	function onStartDrag(e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>) {
		const { event, component } = e.detail;

		isDragging = true;
		activeComponentId = component.id;

		// Add to multi-select if shift is pressed, otherwise clear and select just this one
		if (event.shiftKey) {
			if (!multiSelectedComponents.includes(component.id)) {
				multiSelectedComponents = [...multiSelectedComponents, component.id];
			}
		} else {
			multiSelectedComponents = [component.id];
		}

		selectedComponent = component;
		startX = event.clientX;
		startY = event.clientY;
		startLeft = component.x;
		startTop = component.y;

		// Store initial positions for all selected components
		multiSelectedComponents.forEach((id) => {
			const comp = $componentsStore.find((c) => c.id === id);
			if (comp) {
				comp.startX = comp.x;
				comp.startY = comp.y;
			}
		});

		event.preventDefault();
	}

	function onStartResize(e: CustomEvent<{ event: MouseEvent; component: SurveyComponentType }>) {
		const { event, component } = e.detail;

		isResizing = true;
		activeComponentId = component.id;
		selectedComponent = component;
		multiSelectedComponents = [component.id]; // Clear multi-select when resizing
		startX = event.clientX;
		startY = event.clientY;
		startWidth = component.width;
		startHeight = component.height;
		event.preventDefault();
	}

	function snapToGrid(value: number): number {
		if (!enableSnap) return value;
		return Math.round(value / gridSize) * gridSize;
	}

	function snapToGuides(value: number, direction: 'horizontal' | 'vertical'): number {
		if (!enableSnap || !showGuides) return value;

		const snapThreshold = 5;
		const guides = direction === 'horizontal' ? verticalGuides : horizontalGuides;

		for (const guide of guides) {
			if (Math.abs(value - guide) < snapThreshold) {
				return guide;
			}
		}

		return value;
	}

	function handleMouseMove(e: MouseEvent) {
		// Update mouse position for rulers
		const rect = canvasRef?.getBoundingClientRect();
		if (rect) {
			mouseX = (e.clientX - rect.left) / canvasScale;
			mouseY = (e.clientY - rect.top) / canvasScale;
		}

		if (isDragging && activeComponentId) {
			const dx = (e.clientX - startX) / canvasScale;
			const dy = (e.clientY - startY) / canvasScale;

			// Move all selected components
			multiSelectedComponents.forEach((id) => {
				const comp = $componentsStore.find((c) => c.id === id);
				if (comp) {
					let newX = snapToGrid(comp.startX + dx);
					let newY = snapToGrid(comp.startY + dy);

					// Snap to guides
					newX = snapToGuides(newX, 'horizontal');
					newY = snapToGuides(newY, 'vertical');

					updateComponent(id, { x: newX, y: newY });
				}
			});
		} else if (isResizing && activeComponentId) {
			const dx = (e.clientX - startX) / canvasScale;
			const dy = (e.clientY - startY) / canvasScale;

			// Ensure minimum size
			const newWidth = snapToGrid(Math.max(50, startWidth + dx));
			const newHeight = snapToGrid(Math.max(50, startHeight + dy));

			updateComponent(activeComponentId, {
				width: newWidth,
				height: newHeight
			});
		} else if (isPanning) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			canvasOffsetX += dx;
			canvasOffsetY += dy;
			startX = e.clientX;
			startY = e.clientY;
		} else if (draggingGuide) {
			if (draggingGuide.direction === 'horizontal') {
				horizontalGuides[draggingGuide.index] = snapToGrid(mouseY);
				horizontalGuides = [...horizontalGuides]; // Trigger reactivity
			} else {
				verticalGuides[draggingGuide.index] = snapToGrid(mouseX);
				verticalGuides = [...verticalGuides]; // Trigger reactivity
			}
		} else if (selectionBox.active) {
			selectionBox.endX = mouseX;
			selectionBox.endY = mouseY;

			// Select components that intersect with the selection box
			const minX = Math.min(selectionBox.startX, selectionBox.endX);
			const maxX = Math.max(selectionBox.startX, selectionBox.endX);
			const minY = Math.min(selectionBox.startY, selectionBox.endY);
			const maxY = Math.max(selectionBox.startY, selectionBox.endY);

			multiSelectedComponents = $componentsStore
				.filter((comp) => {
					return (
						comp.x < maxX &&
						comp.x + comp.width > minX &&
						comp.y < maxY &&
						comp.y + comp.height > minY
					);
				})
				.map((comp) => comp.id);

			if (multiSelectedComponents.length > 0) {
				selectedComponent =
					$componentsStore.find((c) => c.id === multiSelectedComponents[0]) || null;
			} else {
				selectedComponent = null;
			}
		}
	}

	function startSelectionBox(e: MouseEvent) {
		// Only start selection box if we're not clicking on a component or guide
		if (!activeComponentId && !draggingGuide && e.button === 0) {
			selectionBox.active = true;
			selectionBox.startX = mouseX;
			selectionBox.startY = mouseY;
			selectionBox.endX = mouseX;
			selectionBox.endY = mouseY;
		}
	}

	function endMouseOperation(e: MouseEvent) {
		isDragging = false;
		isResizing = false;
		activeComponentId = null;
		draggingGuide = null;

		if (isPanning) {
			isPanning = false;
		}

		if (selectionBox.active) {
			selectionBox.active = false;
		}
	}

	function startPan(e: MouseEvent) {
		if (e.button === 1 || (e.button === 0 && e.altKey)) {
			// Middle mouse button or Alt+Left click
			isPanning = true;
			startX = e.clientX;
			startY = e.clientY;
			e.preventDefault();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (multiSelectedComponents.length === 0) return;

		const STEP = e.shiftKey ? 10 : 1;
		let dx = 0;
		let dy = 0;
		let update = false;

		switch (e.key) {
			case 'ArrowUp':
				dy = -STEP;
				update = true;
				break;
			case 'ArrowDown':
				dy = STEP;
				update = true;
				break;
			case 'ArrowLeft':
				dx = -STEP;
				update = true;
				break;
			case 'ArrowRight':
				dx = STEP;
				update = true;
				break;
			case 'Delete':
				multiSelectedComponents.forEach((id) => deleteComponent(id));
				multiSelectedComponents = [];
				selectedComponent = null;
				break;
			case 'd':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					duplicateSelectedComponents();
				}
				break;
			case 'a':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					// Select all components
					multiSelectedComponents = $componentsStore.map((comp) => comp.id);
					if (multiSelectedComponents.length > 0) {
						selectedComponent = $componentsStore[0];
					}
				}
				break;
			case 'g':
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					// Toggle grid
					enableSnap = !enableSnap;
				}
				break;
			default:
				return;
		}

		if (update) {
			multiSelectedComponents.forEach((id) => {
				const comp = $componentsStore.find((c) => c.id === id);
				if (comp) {
					updateComponent(id, {
						x: comp.x + dx,
						y: comp.y + dy
					});
				}
			});
			e.preventDefault();
		}
	}

	function handleCanvasClick(e: MouseEvent) {
		// Double click to add a guide
		const currentTime = Date.now();
		if (currentTime - lastClickTime < 300 && e.target === e.currentTarget) {
			if (e.offsetY < 30) {
				// Add vertical guide
				verticalGuides = [...verticalGuides, snapToGrid(mouseX)];
			} else if (e.offsetX < 30) {
				// Add horizontal guide
				horizontalGuides = [...horizontalGuides, snapToGrid(mouseY)];
			}
		}
		lastClickTime = currentTime;

		// Clear selection if clicking on empty canvas area
		if (e.target === e.currentTarget && !selectionBox.active) {
			selectedComponent = null;
			multiSelectedComponents = [];
		}

		// Hide context menu
		showContextMenu = false;
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
		contextMenuX = e.clientX;
		contextMenuY = e.clientY;
		showContextMenu = true;
	}

	function onStartGuideMove(
		e: CustomEvent<{ direction: 'horizontal' | 'vertical'; index: number }>
	) {
		draggingGuide = e.detail;
	}

	function removeGuide(direction: 'horizontal' | 'vertical', index: number) {
		if (direction === 'horizontal') {
			horizontalGuides.splice(index, 1);
			horizontalGuides = [...horizontalGuides];
		} else {
			verticalGuides.splice(index, 1);
			verticalGuides = [...verticalGuides];
		}
		showContextMenu = false;
	}

	function handleWheel(e: WheelEvent) {
		if (e.ctrlKey || e.metaKey) {
			// Zoom
			e.preventDefault();
			const delta = -e.deltaY;
			const zoom = delta > 0 ? 1.1 : 0.9;

			// Calculate the point to zoom around (mouse position)
			const rect = canvasRef.getBoundingClientRect();
			const mouseXPos = e.clientX - rect.left;
			const mouseYPos = e.clientY - rect.top;

			const oldScale = canvasScale;
			canvasScale *= zoom;

			// Constrain scale
			canvasScale = Math.max(0.1, Math.min(5, canvasScale));

			if (oldScale !== canvasScale) {
				// Adjust offset to zoom toward mouse position
				const scaleFactor = canvasScale / oldScale;
				canvasOffsetX = mouseXPos - (mouseXPos - canvasOffsetX) * scaleFactor;
				canvasOffsetY = mouseYPos - (mouseYPos - canvasOffsetY) * scaleFactor;
			}
		}
	}

	function resetZoom() {
		canvasScale = 1;
		canvasOffsetX = 0;
		canvasOffsetY = 0;
	}

	function duplicateSelectedComponents() {
		if (multiSelectedComponents.length === 0) return;

		const newIds: string[] = [];

		multiSelectedComponents.forEach((id) => {
			const comp = $componentsStore.find((c) => c.id === id);
			if (comp) {
				const newId = duplicateComponent(id, { x: comp.x + 20, y: comp.y + 20 });
				newIds.push(newId);
			}
		});

		// Select the new components
		multiSelectedComponents = newIds;
		if (newIds.length > 0) {
			selectedComponent = $componentsStore.find((c) => c.id === newIds[0]) || null;
		}
	}

	function toggleUnits() {
		const unitOrder = ['cm', 'inches', 'px'];
		const currentIndex = unitOrder.indexOf(units);
		units = unitOrder[(currentIndex + 1) % unitOrder.length] as 'cm' | 'inches' | 'px';
		gridSize = getGridSize();
	}

	function autoPosition() {
		// Improved auto-positioning with alignment and distribution
		const components = $componentsStore;
		if (components.length <= 1) return;

		// Determine layout strategy based on component count
		if (components.length <= 3) {
			// Horizontal layout for small number of components
			const gap = 20;
			let currentX = 20;

			components.forEach((component) => {
				updateComponent(component.id, {
					x: currentX,
					y: canvasHeight / 2 - component.height / 2 // Center vertically
				});

				currentX += component.width + gap;
			});
		} else {
			// Grid layout for many components
			const cols = Math.ceil(Math.sqrt(components.length));
			const rows = Math.ceil(components.length / cols);
			const maxWidth = Math.max(...components.map((c) => c.width));
			const maxHeight = Math.max(...components.map((c) => c.height));
			const gapX = 30;
			const gapY = 30;

			components.forEach((component, index) => {
				const row = Math.floor(index / cols);
				const col = index % cols;

				updateComponent(component.id, {
					x: col * (maxWidth + gapX) + 20,
					y: row * (maxHeight + gapY) + 20
				});
			});
		}
	}

	function alignComponents(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
		if (multiSelectedComponents.length <= 1) return;

		// Get the selected components
		const selectedComps = $componentsStore.filter((c) => multiSelectedComponents.includes(c.id));

		// Find the bounding box of all selected components
		let minX = Math.min(...selectedComps.map((c) => c.x));
		let maxX = Math.max(...selectedComps.map((c) => c.x + c.width));
		let minY = Math.min(...selectedComps.map((c) => c.y));
		let maxY = Math.max(...selectedComps.map((c) => c.y + c.height));

		selectedComps.forEach((comp) => {
			let newX = comp.x;
			let newY = comp.y;

			switch (alignment) {
				case 'left':
					newX = minX;
					break;
				case 'center':
					newX = minX + (maxX - minX) / 2 - comp.width / 2;
					break;
				case 'right':
					newX = maxX - comp.width;
					break;
				case 'top':
					newY = minY;
					break;
				case 'middle':
					newY = minY + (maxY - minY) / 2 - comp.height / 2;
					break;
				case 'bottom':
					newY = maxY - comp.height;
					break;
			}

			updateComponent(comp.id, { x: newX, y: newY });
		});
	}

	function distributeComponents(direction: 'horizontal' | 'vertical') {
		if (multiSelectedComponents.length <= 2) return;

		// Get the selected components
		const selectedComps = $componentsStore.filter((c) => multiSelectedComponents.includes(c.id));

		if (direction === 'horizontal') {
			// Sort by x position
			selectedComps.sort((a, b) => a.x - b.x);

			const firstX = selectedComps[0].x;
			const lastX = selectedComps[selectedComps.length - 1].x;
			const totalSpace = lastX - firstX;
			const totalWidth = selectedComps.reduce((sum, comp) => sum + comp.width, 0);
			const spacing = (totalSpace - totalWidth) / (selectedComps.length - 1);

			let currentX = firstX;
			selectedComps.forEach((comp, i) => {
				if (i > 0 && i < selectedComps.length - 1) {
					updateComponent(comp.id, { x: currentX });
				}
				currentX += comp.width + spacing;
			});
		} else {
			// Sort by y position
			selectedComps.sort((a, b) => a.y - b.y);

			const firstY = selectedComps[0].y;
			const lastY = selectedComps[selectedComps.length - 1].y;
			const totalSpace = lastY - firstY;
			const totalHeight = selectedComps.reduce((sum, comp) => sum + comp.height, 0);
			const spacing = (totalSpace - totalHeight) / (selectedComps.length - 1);

			let currentY = firstY;
			selectedComps.forEach((comp, i) => {
				if (i > 0 && i < selectedComps.length - 1) {
					updateComponent(comp.id, { y: currentY });
				}
				currentY += comp.height + spacing;
			});
		}
	}
</script>

<div class="flex h-full w-full flex-col" bind:this={containerRef}>
	<!-- Toolbar -->
	<div class="flex items-center justify-between border-b border-gray-300 bg-gray-100 p-2">
		<div class="flex space-x-2">
			<button
				class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
				on:click={toggleUnits}
			>
				Units: {units}
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
				on:click={() => (enableSnap = !enableSnap)}
			>
				{enableSnap ? '⊙ Snap On' : '○ Snap Off'}
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
				on:click={() => (showGuides = !showGuides)}
			>
				{showGuides ? '⊣⊢ Guides On' : '―― Guides Off'}
			</button>
			<select
				class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
				bind:value={pageFormat}
				on:change={updatePageFormat}
			>
				<option value="A4">A4</option>
				<option value="Letter">Letter</option>
				<option value="Custom">Custom</option>
			</select>
		</div>

		<div class="flex space-x-2">
			<button
				class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
				on:click={resetZoom}
			>
				Reset View (Zoom: {Math.round(canvasScale * 100)}%)
			</button>
			<button
				class="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
				on:click={autoPosition}
			>
				Auto Position
			</button>
		</div>
	</div>

	<!-- Alignment Toolbar (only shown when multiple components are selected) -->
	{#if multiSelectedComponents.length > 1}
		<div class="flex items-center border-b border-gray-300 bg-gray-100 p-2">
			<div class="mr-2 text-sm">Align:</div>
			<div class="flex space-x-1">
				<button
					class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
					on:click={() => alignComponents('left')}
					title="Align Left"
				>
					⫷
				</button>
				<button
					class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
					on:click={() => alignComponents('center')}
					title="Align Center"
				>
					⋮
				</button>
				<button
					class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
					on:click={() => alignComponents('right')}
					title="Align Right"
				>
					⫸
				</button>
				<button
					class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
					on:click={() => alignComponents('top')}
					title="Align Top"
				>
					⫯
				</button>
				<button
					class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
					on:click={() => alignComponents('middle')}
					title="Align Middle"
				>
					―
				</button>
				<button
					class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
					on:click={() => alignComponents('bottom')}
					title="Align Bottom"
				>
					⫰
				</button>
			</div>

			<div class="mr-2 ml-4 text-sm">Distribute:</div>
			<div class="flex space-x-1">
				<button
					class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
					on:click={() => distributeComponents('horizontal')}
					title="Distribute Horizontally"
				>
					⟷
				</button>
				<button
					class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50"
					on:click={() => distributeComponents('vertical')}
					title="Distribute Vertically"
				>
					⟷
				</button>
			</div>
		</div>
	{/if}

	<div class="relative flex-1 overflow-hidden">
		<!-- Horizontal Ruler -->
		<div class="absolute top-0 right-0 left-8 z-10 h-8">
			<CanvasRuler
				direction="horizontal"
				length={canvasWidth}
				{units}
				{mouseX}
				pixelsPerUnit={units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 10}
			/>
		</div>

		<!-- Vertical Ruler -->
		<div class="absolute top-8 bottom-0 left-0 z-10 w-8">
			<CanvasRuler
				direction="vertical"
				length={canvasHeight}
				{units}
				{mouseY}
				pixelsPerUnit={units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 10}
			/>
		</div>

		<!-- Corner Square -->
		<div
			class="absolute top-0 left-0 z-10 h-8 w-8 border-r border-b border-gray-300 bg-gray-200"
		></div>

		<!-- Canvas with padding for rulers -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="relative h-full w-full overflow-auto pt-8 pl-8"
			aria-label="Survey canvas"
			on:mousemove={handleMouseMove}
			on:mouseup={endMouseOperation}
			on:mouseleave={endMouseOperation}
			on:keydown={handleKeydown}
			on:wheel={handleWheel}
			on:contextmenu={handleContextMenu}
			role="application"
			tabindex="0"
			bind:this={canvasRef}
		>
			<div
				class="canvas-container absolute bg-gray-50"
				style="
					transform: scale({canvasScale}); 
					transform-origin: 0 0;
					margin-left: {canvasOffsetX}px; 
					margin-top: {canvasOffsetY}px;
				"
			>
				<div
					class="relative border-2 border-gray-300"
					style="width: {canvasWidth}px; height: {canvasHeight}px;"
					on:mousedown={startSelectionBox}
					on:click={handleCanvasClick}
					on:mousedown={startPan}
					role="presentation"
				>
					<!-- Background grid -->
					{#if enableSnap}
						<div class="grid-lines pointer-events-none absolute inset-0">
							<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
								{#each Array(Math.ceil(canvasWidth / gridSize)) as _, i}
									<line
										x1={i * gridSize}
										y1="0"
										x2={i * gridSize}
										y2={canvasHeight}
										stroke="#e5e7eb"
										stroke-width="1"
									/>
								{/each}
								{#each Array(Math.ceil(canvasHeight / gridSize)) as _, i}
									<line
										x1="0"
										y1={i * gridSize}
										x2={canvasWidth}
										y2={i * gridSize}
										stroke="#e5e7eb"
										stroke-width="1"
									/>
								{/each}
							</svg>
						</div>
					{/if}

					<!-- Guides -->
					{#if showGuides}
						{#each horizontalGuides as guide, index}
							<CanvasGuide
								direction="horizontal"
								position={guide}
								{index}
								on:startMove={onStartGuideMove}
								on:remove={() => removeGuide('horizontal', index)}
							/>
						{/each}
						{#each verticalGuides as guide, index}
							<CanvasGuide
								direction="vertical"
								position={guide}
								{index}
								on:startMove={onStartGuideMove}
								on:remove={() => removeGuide('vertical', index)}
							/>
						{/each}
					{/if}

					<!-- Selection box -->
					{#if selectionBox.active}
						<div
							class="bg-opacity-20 pointer-events-none absolute border-2 border-blue-500 bg-blue-100"
							style="
								left: {Math.min(selectionBox.startX, selectionBox.endX)}px;
								top: {Math.min(selectionBox.startY, selectionBox.endY)}px;
								width: {Math.abs(selectionBox.endX - selectionBox.startX)}px;
								height: {Math.abs(selectionBox.endY - selectionBox.startY)}px;
							"
						></div>
					{/if}

					{#each $componentsStore as component (component.id)}
						<SurveyComponent
							{component}
							isSelected={multiSelectedComponents.includes(component.id)}
							isActive={selectedComponent?.id === component.id}
							on:select={(e) => setSelectedComponent(e.detail)}
							on:startDrag={onStartDrag}
							on:startResize={onStartResize}
						/>
					{/each}
				</div>
			</div>
		</div>

		<!-- Context menu -->
		{#if showContextMenu}
			<div
				class="absolute z-50 rounded border border-gray-300 bg-white shadow-lg"
				style="left: {contextMenuX}px; top: {contextMenuY}px;"
			>
				<ul class="py-1">
					<li>
						<button
							class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
							on:click={() => {
								duplicateSelectedComponents();
								showContextMenu = false;
							}}
						>
							Duplicate
						</button>
					</li>
					<li>
						<button
							class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
							on:click={() => {
								showContextMenu = false;
							}}
						>
							Properties
						</button>
					</li>
					<li class="border-t border-gray-200">
						<button
							class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
							on:click={() => {
								multiSelectedComponents.forEach((id) => deleteComponent(id));
								multiSelectedComponents = [];
								selectedComponent = null;
								showContextMenu = false;
							}}
						>
							Delete
						</button>
					</li>
				</ul>
			</div>
		{/if}
	</div>

	<!-- Status bar -->
	<div class="flex items-center justify-between border-t border-gray-300 bg-gray-100 p-1 text-xs">
		<div>
			{mouseX.toFixed(0)}px, {mouseY.toFixed(0)}px |
			{(mouseX / (units === 'cm' ? PIXEL_PER_CM : units === 'inches' ? PIXEL_PER_INCH : 1)).toFixed(
				2
			)}{units}
		</div>
		<div>
			{selectedComponent
				? `Selected: ${selectedComponent.type} (${selectedComponent.width} × ${selectedComponent.height}px)`
				: multiSelectedComponents.length > 1
					? `${multiSelectedComponents.length} items selected`
					: 'No selection'}
		</div>
		<div>Zoom: {Math.round(canvasScale * 100)}%</div>
	</div>
</div>

<style>
	.canvas-container {
		background-color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
</style>
