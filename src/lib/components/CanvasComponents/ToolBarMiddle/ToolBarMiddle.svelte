<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		resetZoom: void;
		autoPosition: void;
		autoSpacing: void;
		manageGuides: void;
	}>();

	function handleResetZoom() {
		dispatch('resetZoom');
	}

	function handleAutoPosition() {
		dispatch('autoPosition');
	}

	function handleAutoSpacing() {
		dispatch('autoSpacing');
	}

	function handleManageGuides() {
		dispatch('manageGuides');
	}
</script>

<div
	class="absolute top-2 left-1/2 z-30 -translate-x-1/2 transform space-x-1 rounded-md bg-white/90 p-1 shadow-md backdrop-blur-sm dark:bg-gray-800/90"
>
	<button
		class="rounded p-1 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
		title="Reset Zoom"
		onclick={handleResetZoom}
		aria-label="Reset Zoom"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="11" cy="11" r="8"></circle>
			<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			<line x1="11" y1="8" x2="11" y2="14"></line>
			<line x1="8" y1="11" x2="14" y2="11"></line>
		</svg>
	</button>

	<button
		class="rounded p-1 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
		title="Auto Position"
		onclick={handleAutoPosition}
		aria-label="Auto Position Components"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
			<line x1="9" y1="3" x2="9" y2="21"></line>
			<line x1="15" y1="3" x2="15" y2="21"></line>
			<line x1="3" y1="9" x2="21" y2="9"></line>
			<line x1="3" y1="15" x2="21" y2="15"></line>
		</svg>
	</button>

	<button
		class="rounded p-1 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
		title="Auto Spacing"
		onclick={handleAutoSpacing}
		aria-label="Auto Space Components"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<rect x="4" y="5" width="16" height="3" rx="1"></rect>
			<rect x="4" y="11" width="16" height="3" rx="1"></rect>
			<rect x="4" y="17" width="16" height="3" rx="1"></rect>
		</svg>
	</button>

	<button
		class="rounded p-1 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
		title="Manage Guides"
		onclick={handleManageGuides}
		aria-label="Manage Guides"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="4" y1="21" x2="4" y2="14"></line>
			<line x1="4" y1="10" x2="4" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="12"></line>
			<line x1="12" y1="8" x2="12" y2="3"></line>
			<line x1="20" y1="21" x2="20" y2="16"></line>
			<line x1="20" y1="12" x2="20" y2="3"></line>
			<line x1="1" y1="14" x2="7" y2="14"></line>
			<line x1="9" y1="8" x2="15" y2="8"></line>
			<line x1="17" y1="16" x2="23" y2="16"></line>
		</svg>
	</button>
</div>
