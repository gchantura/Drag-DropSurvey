<script lang="ts">
	import DirectLeftTop from '$lib/components/icons/components/direct-left-top.svg?raw';
	import IconText from '$lib/components/icons/components/text.svg?raw';
	import IconSection from '$lib/components/icons/components/section.svg?raw';

	function sanitizeSvg(svg: string): string {
		return svg.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
	}
</script>

<div
	class="container-toolbar rounded border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300"
>
	<button
		class="group flex h-8 w-8 items-center justify-center"
		title="Zoom Options"
	>
		<span
			class="inline-block h-4 w-4 text-gray-700 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
		>
			{@html sanitizeSvg(DirectLeftTop)}
		</span>
	</button>
	<button
		class="group flex h-8 w-8 items-center justify-center"
		title="Zoom Options"
	>
		<span
			class="inline-block h-4 w-4 text-gray-700 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current"
		>
			{@html sanitizeSvg(IconText)}
		</span>
	</button>
</div>

<style>
	.container-toolbar {
		position: relative;
		z-index: 1000;
		top: 3em;
		display: flex;
		justify-content: center;
		width: fit-content;
		margin: 0 auto;
	}
	.container-toolbar button {
		cursor: pointer;
	}
</style>
