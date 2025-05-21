<script lang="ts">
  export let id: string;
  export let label: string;
  export let checked: boolean = false;
  export let helpText: string = "";
  export let onChange: (value: boolean) => void;

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onChange(target.checked);
  }
</script>

<div class="boolean-input flex items-center">
  <label class="flex items-center text-sm font-medium">
    <input
      {id}
      type="checkbox"
      class="mr-2 h-4 w-4 rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
      checked={checked}
      on:change={handleChange}
    />
    {label}
  </label>
  
  {#if helpText}
    <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
      {helpText}
    </span>
  {/if}
</div>
