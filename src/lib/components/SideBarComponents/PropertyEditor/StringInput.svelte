<script lang="ts">
  export let id: string;
  export let label: string;
  export let value: string = "";
  export let placeholder: string = "";
  export let multiline: boolean = false;
  export let rows: number = 3;
  export let helpText: string = "";
  export let onChange: (value: string) => void;

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    onChange(target.value);
  }
</script>

<div class="string-input">
  <label for={id} class="mb-1 block text-sm font-medium">
    {label}
  </label>
  
  {#if multiline}
    <textarea
      {id}
      {placeholder}
      {rows}
      class="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800"
      value={value}
      on:input={handleChange}
    ></textarea>
  {:else}
    <input
      {id}
      type="text"
      {placeholder}
      class="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800"
      value={value}
      on:input={handleChange}
    />
  {/if}
  
  {#if helpText}
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  {/if}
</div>
