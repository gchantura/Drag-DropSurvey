<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let label: string;
  export let value: string;
  export let placeholder: string = "";
  export let helpText: string = "";
  
  const dispatch = createEventDispatcher<{ change: string }>();
  
  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    dispatch('change', value);
  }
</script>

<div class="text-input">
  <label class="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
    {label}
  </label>
  
  <input
    type="text"
    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    {value}
    {placeholder}
    on:input={handleChange}
  />
  
  {#if helpText}
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  {/if}
</div>
