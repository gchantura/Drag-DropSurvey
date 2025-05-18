<!-- src/lib/components/ui/Alert.svelte -->
<script lang="ts">
	export let message: string;
	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let onDismiss: () => void = () => {};

	// Define color classes based on type
	const colorClasses = {
		success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
		error: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
	};

	// Get the appropriate icon based on type
	function getIcon(type: 'success' | 'error' | 'warning' | 'info') {
		switch (type) {
			case 'success':
				return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`;
			case 'error':
				return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`;
			case 'warning':
				return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;
			case 'info':
			default:
				return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`;
		}
	}
</script>

<div class={`mb-4 flex rounded-lg p-4 ${colorClasses[type]}`} role="alert">
	<div class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
		{@html getIcon(type)}
	</div>
	<div class="ml-3 text-sm font-medium">
		{message}
	</div>
	<button
		type="button"
		class={`-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 rounded-lg p-1.5 focus:ring-2 focus:outline-none ${
			type === 'success'
				? 'bg-green-100 text-green-500 hover:bg-green-200 focus:ring-green-400 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700'
				: type === 'error'
					? 'bg-red-100 text-red-500 hover:bg-red-200 focus:ring-red-400 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700'
					: type === 'warning'
						? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-400 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700'
						: 'bg-blue-100 text-blue-500 hover:bg-blue-200 focus:ring-blue-400 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700'
		}`}
		aria-label="Close"
		on:click={onDismiss}
	>
		<span class="sr-only">Close</span>
		<svg
			aria-hidden="true"
			class="h-5 w-5"
			fill="currentColor"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			><path
				fill-rule="evenodd"
				d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
				clip-rule="evenodd"
			></path></svg
		>
	</button>
</div>
