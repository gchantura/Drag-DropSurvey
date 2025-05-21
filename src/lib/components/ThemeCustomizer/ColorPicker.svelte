<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let label: string;
  export let value: string = "#000000";
  export let helpText: string = "";
  
  const dispatch = createEventDispatcher<{ change: string }>();
  
  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    dispatch('change', value);
  }
</script>

<div class="color-picker">
  <label class="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
    {label}
  </label>
  
  <div class="flex items-center">
    <input
      type="color"
      class="mr-2 h-8 w-10 cursor-pointer rounded border dark:border-gray-600"
      {value}
      on:input={handleChange}
    />
    
    <input
      type="text"
      class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      {value}
      on:input={handleChange}
    />
  </div>
  
  {#if helpText}
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  {/if}
</div>
