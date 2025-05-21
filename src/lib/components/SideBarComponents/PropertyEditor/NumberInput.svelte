<script lang="ts">
  export let id: string;
  export let label: string;
  export let value: number;
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let step: number | undefined = undefined;
  export let helpText: string = "";
  export let onChange: (value: number) => void;

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  }
</script>

<div class="number-input">
  <label for={id} class="mb-1 block text-sm font-medium">
    {label}
  </label>
  
  <input
    {id}
    type="number"
    {min}
    {max}
    {step}
    class="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800"
    value={value}
    on:input={handleChange}
  />
  
  {#if helpText}
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  {/if}
</div>
