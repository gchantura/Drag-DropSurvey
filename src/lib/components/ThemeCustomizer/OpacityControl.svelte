<script lang="ts">
  export let label: string;
  export let value: number = 1;
  export let min: number = 0;
  export let max: number = 1;
  export let step: number = 0.01;
  export let helpText: string = "";
  
  export let onChange: (value: number) => void;
  
  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    onChange(newValue);
  }
  
  // Format the value for display (e.g., 0.7 -> 70%)
  $: displayValue = Math.round(value * 100) + "%";
</script>

<div class="opacity-control">
  <label class="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
    {label}
  </label>
  
  <div class="flex items-center">
    <input
      type="range"
      class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
      {min}
      {max}
      {step}
      {value}
      on:input={handleChange}
    />
    <span class="ml-2 w-12 text-sm text-gray-900 dark:text-white">{displayValue}</span>
  </div>
  
  {#if helpText}
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  {/if}
</div>

<style>
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
  }
</style>
