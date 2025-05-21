<script lang="ts">
  export let id: string;
  export let label: string;
  export let value: string | number;
  export let options: Array<{ value: string | number; label: string }>;
  export let helpText: string = "";
  export let onChange: (value: string | number) => void;

  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const newValue = options.find(opt => opt.value.toString() === target.value)?.value;
    if (newValue !== undefined) {
      onChange(newValue);
    }
  }
</script>

<div class="select-input">
  <label for={id} class="mb-1 block text-sm font-medium">
    {label}
  </label>
  
  <select
    {id}
    class="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800"
    value={value.toString()}
    on:change={handleChange}
  >
    {#each options as option}
      <option value={option.value.toString()}>{option.label}</option>
    {/each}
  </select>
  
  {#if helpText}
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  {/if}
</div>
