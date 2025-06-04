<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const { units, enableSnap, showGuides } = $props<{
		units: 'px' | 'inches' | 'cm';
		enableSnap: boolean;
		showGuides: boolean;
	}>();

	const dispatch = createEventDispatcher<{
		toggleUnits: void;
		toggleSnap: void;
		toggleGuides: void;
	}>();
</script>

<div class="toolbar bg-gray-50 dark:bg-gray-800">
	<div class="button-group">
		<button
			class="toolbar-button"
			onclick={() => dispatch('toggleUnits')}
			title="Toggle measurement units"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" class="icon">
				{#if units === 'cm'}
					<!-- CM Icon - Ruler with metric markings -->
					<rect x="2" y="7" width="12" height="2" fill="currentColor" />
					<line x1="2" y1="6" x2="2" y2="10" stroke="currentColor" stroke-width="1" />
					<line x1="5" y1="6.5" x2="5" y2="9.5" stroke="currentColor" stroke-width="0.8" />
					<line x1="8" y1="6" x2="8" y2="10" stroke="currentColor" stroke-width="1" />
					<line x1="11" y1="6.5" x2="11" y2="9.5" stroke="currentColor" stroke-width="0.8" />
					<line x1="14" y1="6" x2="14" y2="10" stroke="currentColor" stroke-width="1" />
					<text x="8" y="13" text-anchor="middle" font-size="4" fill="currentColor">cm</text>
				{:else if units === 'inch'}
					<!-- INCH Icon - Ruler with imperial markings -->
					<rect x="2" y="7" width="12" height="2" fill="currentColor" />
					<line x1="2" y1="6" x2="2" y2="10" stroke="currentColor" stroke-width="1" />
					<line x1="5" y1="6.5" x2="5" y2="9.5" stroke="currentColor" stroke-width="0.8" />
					<line x1="6.5" y1="7" x2="6.5" y2="9" stroke="currentColor" stroke-width="0.6" />
					<line x1="8" y1="6" x2="8" y2="10" stroke="currentColor" stroke-width="1" />
					<line x1="9.5" y1="7" x2="9.5" y2="9" stroke="currentColor" stroke-width="0.6" />
					<line x1="11" y1="6.5" x2="11" y2="9.5" stroke="currentColor" stroke-width="0.8" />
					<line x1="14" y1="6" x2="14" y2="10" stroke="currentColor" stroke-width="1" />
					<text x="8" y="13" text-anchor="middle" font-size="4" fill="currentColor">in</text>
				{:else}
					<!-- PX Icon - Grid/Pixel representation -->
					<rect x="3" y="3" width="2" height="2" fill="currentColor" />
					<rect x="6" y="3" width="2" height="2" fill="currentColor" />
					<rect x="9" y="3" width="2" height="2" fill="currentColor" />
					<rect x="12" y="3" width="2" height="2" fill="currentColor" />
					<rect x="3" y="6" width="2" height="2" fill="currentColor" />
					<rect x="6" y="6" width="2" height="2" fill="currentColor" />
					<rect x="9" y="6" width="2" height="2" fill="currentColor" />
					<rect x="12" y="6" width="2" height="2" fill="currentColor" />
					<rect x="3" y="9" width="2" height="2" fill="currentColor" />
					<rect x="6" y="9" width="2" height="2" fill="currentColor" />
					<rect x="9" y="9" width="2" height="2" fill="currentColor" />
					<rect x="12" y="9" width="2" height="2" fill="currentColor" />
					<text x="8" y="13.5" text-anchor="middle" font-size="4" fill="currentColor">px</text>
				{/if}
			</svg>
		</button>
		<button
			class="toolbar-button"
			onclick={() => dispatch('toggleSnap')}
			title="Toggle snapping to grid and guides (Ctrl+G)"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" class="icon">
				{#if enableSnap}
					<!-- Snap On Icon - target with dot -->
					<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5" />
					<circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1" />
					<circle cx="8" cy="8" r="1.5" fill="currentColor" />
				{:else}
					<!-- Snap Off Icon - empty circle -->
					<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5" />
					<circle
						cx="8"
						cy="8"
						r="3"
						fill="none"
						stroke="currentColor"
						stroke-width="0.8"
						stroke-dasharray="2,1"
					/>
				{/if}
			</svg>
		</button>
		<button
			class="toolbar-button"
			onclick={() => dispatch('toggleGuides')}
			title="Toggle visibility of guides"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" class="icon">
				{#if showGuides}
					<!-- Guides On Icon - ruler with measurements -->
					<line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1.5" />
					<line x1="4" y1="6" x2="4" y2="10" stroke="currentColor" stroke-width="1" />
					<line x1="8" y1="6" x2="8" y2="10" stroke="currentColor" stroke-width="1" />
					<line x1="12" y1="6" x2="12" y2="10" stroke="currentColor" stroke-width="1" />
					<line x1="2" y1="6" x2="2" y2="10" stroke="currentColor" stroke-width="1" />
					<line x1="14" y1="6" x2="14" y2="10" stroke="currentColor" stroke-width="1" />
				{:else}
					<!-- Guides Off Icon - simple line -->
					<line
						x1="2"
						y1="8"
						x2="14"
						y2="8"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-dasharray="3,2"
					/>
				{/if}
			</svg>
		</button>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 0;
		padding: 8px;
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.toolbar-button:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.icon {
		flex-shrink: 0;
	}
</style>
