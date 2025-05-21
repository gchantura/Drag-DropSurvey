<script lang="ts">
  export let id: string;
  export let label: string;
  export let value: string = "#000000";
  export let onChange: (value: string) => void;

  function handleColorChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onChange(target.value);
  }

  function handleHexChange(e: Event) {
    const target = e.target as HTMLInputElement;
    // Validate hex color format
    if (/^#([0-9A-F]{3}){1,2}$/i.test(target.value)) {
      onChange(target.value);
    }
  }
</script>

<div class="color-input">
  <label for={id} class="mb-1 block text-sm font-medium">
    {label}
  </label>
  
  <div class="flex items-center">
    <input
      id={`${id}-picker`}
      type="color"
      class="mr-2 h-8 w-10 cursor-pointer rounded border dark:border-gray-700 dark:bg-gray-800"
      value={value}
      on:input={handleColorChange}
    />
    
    <input
      id={id}
      type="text"
      class="flex-1 rounded border p-2 dark:border-gray-700 dark:bg-gray-800"
      value={value}
      on:input={handleHexChange}
      on:blur={handleHexChange}
    />
  </div>
</div>
