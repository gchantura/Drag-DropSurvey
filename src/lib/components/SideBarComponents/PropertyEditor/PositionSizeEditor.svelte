<script lang="ts">
	export let x: number;
	export let y: number;
	export let width: number;
	export let height: number;
	export let onChangeX: (value: number) => void;
	export let onChangeY: (value: number) => void;
	export let onChangeWidth: (value: number) => void;
	export let onChangeHeight: (value: number) => void;

	function handleChange(field: 'x' | 'y' | 'width' | 'height', e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseFloat(target.value);

		if (!isNaN(value)) {
			switch (field) {
				case 'x':
					onChangeX(value);
					break;
				case 'y':
					onChangeY(value);
					break;
				case 'width':
					onChangeWidth(value);
					break;
				case 'height':
					onChangeHeight(value);
					break;
			}
		}
	}
</script>

<div class="position-size-editor grid grid-cols-2 gap-3">
	<div>
		<label for="comp-x" class="mb-1 block text-sm font-medium">X:</label>
		<input
			id="comp-x"
			type="number"
			class="w-full rounded border border-gray-300 bg-transparent p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:focus:border-blue-500"
			value={x}
			on:input={(e) => handleChange('x', e)}
		/>
	</div>

	<div>
		<label for="comp-y" class="mb-1 block text-sm font-medium">Y:</label>
		<input
			id="comp-y"
			type="number"
			class="w-full rounded border border-gray-300 bg-transparent p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:focus:border-blue-500"
			value={y}
			on:input={(e) => handleChange('y', e)}
		/>
	</div>

	<div>
		<label for="comp-width" class="mb-1 block text-sm font-medium">Width:</label>
		<input
			id="comp-width"
			type="number"
			min="20"
			class="w-full rounded border border-gray-300 bg-transparent p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:focus:border-blue-500"
			value={width}
			on:input={(e) => handleChange('width', e)}
		/>
	</div>

	<div>
		<label for="comp-height" class="mb-1 block text-sm font-medium">Height:</label>
		<input
			id="comp-height"
			type="number"
			min="20"
			class="w-full rounded border border-gray-300 bg-transparent p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:focus:border-blue-500"
			value={height}
			on:input={(e) => handleChange('height', e)}
		/>
	</div>
</div>
