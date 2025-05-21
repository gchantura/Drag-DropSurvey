<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let label: string;
  export let startColor: string = "#ffffff";
  export let endColor: string = "#000000";
  export let direction: string = "to right";
  export let helpText: string = "";
  
  export let onChangeStart: (color: string) => void;
  export let onChangeEnd: (color: string) => void;
  export let onChangeDirection: (direction: string) => void;
  
  const directions = [
    { value: "to right", label: "Left to Right" },
    { value: "to left", label: "Right to Left" },
    { value: "to bottom", label: "Top to Bottom" },
    { value: "to top", label: "Bottom to Top" },
    { value: "to bottom right", label: "Top Left to Bottom Right" },
    { value: "to bottom left", label: "Top Right to Bottom Left" },
    { value: "to top right", label: "Bottom Left to Top Right" },
    { value: "to top left", label: "Bottom Right to Top Left" }
  ];
  
  function handleStartColorChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onChangeStart(target.value);
  }
  
  function handleEndColorChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onChangeEnd(target.value);
  }
  
  function handleDirectionChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onChangeDirection(target.value);
  }
  
  $: gradientStyle = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
</script>

<div class="gradient-picker">
  <label class="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
    {label}
  </label>
  
  <div class="mb-2 h-8 w-full rounded" style="background: {gradientStyle}"></div>
  
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
        Start Color
      </label>
      <div class="flex items-center">
        <input
          type="color"
          class="mr-2 h-8 w-10 cursor-pointer rounded border dark:border-gray-600"
          value={startColor}
          on:input={handleStartColorChange}
        />
        <input
          type="text"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={startColor}
          on:input={handleStartColorChange}
        />
      </div>
    </div>
    
    <div>
      <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
        End Color
      </label>
      <div class="flex items-center">
        <input
          type="color"
          class="mr-2 h-8 w-10 cursor-pointer rounded border dark:border-gray-600"
          value={endColor}
          on:input={handleEndColorChange}
        />
        <input
          type="text"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={endColor}
          on:input={handleEndColorChange}
        />
      </div>
    </div>
  </div>
  
  <div class="mt-2">
    <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
      Direction
    </label>
    <select
      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      value={direction}
      on:change={handleDirectionChange}
    >
      {#each directions as dir}
        <option value={dir.value}>{dir.label}</option>
      {/each}
    </select>
  </div>
  
  {#if helpText}
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  {/if}
</div>
