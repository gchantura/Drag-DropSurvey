<script>

import { updateComponent } from '$lib/stores/surveyStore.ts';


</script>

<div class="">
	<!-- Typography -->
	<h3 class="mb-2 text-base font-medium">Typography</h3>

	<!-- Font family -->
	<div class="mb-3">
		<label for="comp-font-family" class="mb-1 block text-sm font-medium">Font Family:</label>
		<select
			id="comp-font-family"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={component.fontFamily}
			on:change={(e) => handleInputChange(e, 'fontFamily')}
		>
			{#each fontFamilies as font}
				<option value={font}>{font}</option>
			{/each}
		</select>
	</div>

	<!-- Font size -->
	<div class="mb-3">
		<label for="comp-font-size" class="mb-1 block text-sm font-medium">Font Size:</label>
		<select
			id="comp-font-size"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={component.fontSize}
			on:change={(e) => handleInputChange(e, 'fontSize')}
		>
			{#each fontSizes as size}
				<option value={size}>{size}px</option>
			{/each}
		</select>
	</div>

	<!-- Font weight -->
	<div class="mb-3">
		<label for="comp-font-weight" class="mb-1 block text-sm font-medium">Font Weight:</label>
		<select
			id="comp-font-weight"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('fontWeight', 'normal')}
			on:change={(e) => handleInputChange(e, 'fontWeight')}
		>
			{#each fontWeights as weight}
				<option value={weight}>{weight}</option>
			{/each}
		</select>
	</div>

	<!-- Font style -->
	<div class="mb-3">
		<label for="comp-font-style" class="mb-1 block text-sm font-medium">Font Style:</label>
		<select
			id="comp-font-style"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('fontStyle', 'normal')}
			on:change={(e) => handleInputChange(e, 'fontStyle')}
		>
			{#each fontStyles as style}
				<option value={style}>{style}</option>
			{/each}
		</select>
	</div>

	<!-- Text decoration -->
	<div class="mb-3">
		<label for="comp-text-decoration" class="mb-1 block text-sm font-medium">Text Decoration:</label
		>
		<select
			id="comp-text-decoration"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('textDecoration', 'none')}
			on:change={(e) => handleInputChange(e, 'textDecoration')}
		>
			{#each textDecorations as decoration}
				<option value={decoration}>{decoration}</option>
			{/each}
		</select>
	</div>

	<!-- Text align -->
	<div class="mb-3">
		<label for="comp-text-align" class="mb-1 block text-sm font-medium">Text Align:</label>
		<select
			id="comp-text-align"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('textAlign', 'left')}
			on:change={(e) => handleInputChange(e, 'textAlign')}
		>
			{#each textAligns as align}
				<option value={align}>{align}</option>
			{/each}
		</select>
	</div>

	<!-- Text color -->
	<div class="mb-3">
		<label for="comp-text-color" class="mb-1 block text-sm font-medium">Text Color:</label>
		<div class="flex items-center">
			<input
				id="comp-text-color"
				type="color"
				class="mr-2 dark:border-gray-700 dark:bg-gray-800"
				value={component.color}
				on:input={(e) => handleInputChange(e, 'color')}
			/>
			<input
				id="comp-text-color-hex"
				type="text"
				class="flex-1 rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
				value={component.color}
				on:input={(e) => handleInputChange(e, 'color')}
			/>
		</div>
	</div>

	<!-- Background color -->
	<div class="mb-3">
		<label for="comp-bg-color" class="mb-1 block text-sm font-medium">Background Color:</label>
		<div class="flex items-center">
			<input
				id="comp-bg-color"
				type="color"
				class="mr-2 dark:border-gray-700 dark:bg-gray-800"
				value={component.bgColor}
				on:input={(e) => handleInputChange(e, 'bgColor')}
			/>
			<input
				id="comp-bg-color-hex"
				type="text"
				class="flex-1 rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
				value={component.bgColor}
				on:input={(e) => handleInputChange(e, 'bgColor')}
			/>
		</div>
	</div>

	<!-- Opacity -->
	<div class="mb-3">
		<label for="comp-opacity" class="mb-1 block text-sm font-medium">Opacity:</label>
		<div class="flex items-center">
			<Range
				id="comp-opacity"
				min="0"
				max="1"
				step="0.01"
				class="w-full"
				value={getDefaultValue('opacity', 1)}
				on:change={(e) => handleInputChange(e, 'opacity')}
			/>
			<span class="ml-2 w-10 text-center">{(getDefaultValue('opacity', 1) * 100).toFixed(0)}%</span>
		</div>
	</div>

	<h3 class="mb-2 text-base font-medium">Border & Spacing</h3>

	<!-- Border radius -->
	<div class="mb-3">
		<label for="comp-border-radius" class="mb-1 block text-sm font-medium">Border Radius:</label>
		<input
			id="comp-border-radius"
			type="number"
			min="0"
			max="50"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('borderRadius', 4)}
			on:input={(e) => handleInputChange(e, 'borderRadius')}
		/>
	</div>

	<!-- Border width -->
	<div class="mb-3">
		<label for="comp-border-width" class="mb-1 block text-sm font-medium">Border Width:</label>
		<input
			id="comp-border-width"
			type="number"
			min="0"
			max="10"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('borderWidth', 1)}
			on:input={(e) => handleInputChange(e, 'borderWidth')}
		/>
	</div>

	<!-- Border style -->
	<div class="mb-3">
		<label for="comp-border-style" class="mb-1 block text-sm font-medium">Border Style:</label>
		<select
			id="comp-border-style"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('borderStyle', 'solid')}
			on:change={(e) => handleInputChange(e, 'borderStyle')}
		>
			{#each borderStyles as style}
				<option value={style}>{style}</option>
			{/each}
		</select>
	</div>

	<!-- Border color -->
	<div class="mb-3">
		<label for="comp-border-color" class="mb-1 block text-sm font-medium">Border Color:</label>
		<div class="flex items-center">
			<input
				id="comp-border-color"
				type="color"
				class="mr-2 dark:border-gray-700 dark:bg-gray-800"
				value={getDefaultValue('borderColor', '#d1d5db')}
				on:input={(e) => handleInputChange(e, 'borderColor')}
			/>
			<input
				id="comp-border-color-hex"
				type="text"
				class="flex-1 rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
				value={getDefaultValue('borderColor', '#d1d5db')}
				on:input={(e) => handleInputChange(e, 'borderColor')}
			/>
		</div>
	</div>

	<!-- Padding -->
	<div class="mb-3">
		<label for="comp-padding" class="mb-1 block text-sm font-medium">Padding:</label>
		<input
			id="comp-padding"
			type="number"
			min="0"
			max="50"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('padding', 8)}
			on:input={(e) => handleInputChange(e, 'padding')}
		/>
	</div>

	<!-- Margin -->
	<div class="mb-3">
		<label for="comp-margin" class="mb-1 block text-sm font-medium">Margin:</label>
		<input
			id="comp-margin"
			type="number"
			min="0"
			max="50"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('margin', 0)}
			on:input={(e) => handleInputChange(e, 'margin')}
		/>
	</div>

	<!-- Box Shadow Presets -->
	<div class="mb-3">
		<label for="comp-box-shadow" class="block text-sm font-medium">Box Shadow:</label>
		<select
			id="comp-box-shadow"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('boxShadow', 'none')}
			on:change={(e) => handleInputChange(e, 'boxShadow')}
		>
			<option value="none">None</option>
			<option value="0 1px 3px rgba(0,0,0,0.12)">Small</option>
			<option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
			<option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
			<option value="0 20px 25px rgba(0,0,0,0.15)">Extra Large</option>
			<option value="0 0 5px rgba(59, 130, 246, 0.5)">Blue Glow</option>
			<option value="0 0 5px rgba(220, 38, 38, 0.5)">Red Glow</option>
			<option value="0 0 5px rgba(16, 185, 129, 0.5)">Green Glow</option>
			<option value="inset 0 2px 4px rgba(0,0,0,0.1)">Inset</option>
		</select>
	</div>

	<!-- Transform Options -->
	<h3 class="mt-4 mb-2 text-base font-medium">Transform</h3>

	<!-- Rotation -->
	<div class="mb-3">
		<label for="comp-rotation" class="mb-1 block text-sm font-medium">Rotation (deg):</label>
		<Range
			id="comp-rotation"
			min="-180"
			max="180"
			step="1"
			class="w-full"
			value={getDefaultValue('rotation', 0)}
			on:change={(e) => handleInputChange(e, 'rotation')}
		/>
		<div class="flex justify-between text-xs text-gray-500">
			<span>-180°</span>
			<span>0°</span>
			<span>180°</span>
		</div>
	</div>

	<!-- Scale -->
	<div class="mb-3">
		<label for="comp-scale" class="mb-1 block text-sm font-medium">Scale:</label>
		<Range
			id="comp-scale"
			min="0.5"
			max="2"
			step="0.1"
			class="w-full"
			value={getDefaultValue('scale', 1)}
			on:change={(e) => handleInputChange(e, 'scale')}
		/>
		<div class="flex justify-between text-xs text-gray-500">
			<span>50%</span>
			<span>100%</span>
			<span>200%</span>
		</div>
	</div>

	<!-- Animation -->
	<h3 class="mt-4 mb-2 text-base font-medium">Animation</h3>

	<!-- Animation Type -->
	<div class="mb-3">
		<label for="comp-animation" class="mb-1 block text-sm font-medium">Animation:</label>
		<select
			id="comp-animation"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('animation', 'none')}
			on:change={(e) => handleInputChange(e, 'animation')}
		>
			<option value="none">None</option>
			<option value="fade">Fade In</option>
			<option value="slide">Slide In</option>
			<option value="bounce">Bounce</option>
			<option value="pulse">Pulse</option>
			<option value="spin">Spin</option>
		</select>
	</div>

	<!-- Animation Duration -->
	<div class="mb-3">
		<label for="comp-animation-duration" class="mb-1 block text-sm font-medium">Duration (s):</label
		>
		<input
			id="comp-animation-duration"
			type="number"
			min="0.1"
			max="10"
			step="0.1"
			class="w-full rounded border p-1 dark:border-gray-700 dark:bg-gray-800"
			value={getDefaultValue('animationDuration', 1)}
			on:input={(e) => handleInputChange(e, 'animationDuration')}
			disabled={getDefaultValue('animation', 'none') === 'none'}
		/>
	</div>
</div>
