<script lang="ts">
  export let id: string;
  export let label: string;
  export let options: string[] = [];
  export let onAdd: () => void;
  export let onUpdate: (index: number, value: string) => void;
  export let onRemove: (index: number) => void;

  function handleOptionChange(index: number, e: Event) {
    const target = e.target as HTMLInputElement;
    onUpdate(index, target.value);
  }
</script>

<div class="options-list-editor">
  <span class="mb-1 block text-sm font-medium">{label}:</span>
  
  <ul class="space-y-2">
    {#each options as option, i}
      <li class="flex items-center">
        <input
          type="text"
          id={`${id}-option-${i}`}
          class="mr-2 flex-1 rounded border p-2 dark:border-gray-700 dark:bg-gray-800"
          value={option}
          on:input={(e) => handleOptionChange(i, e)}
        />
        
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          on:click={() => onRemove(i)}
          aria-label={`Remove option ${i + 1}`}
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </li>
    {/each}
    
    <li>
      <button
        type="button"
        class="flex w-full items-center justify-center rounded bg-blue-500 p-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        on:click={onAdd}
      >
        <svg class="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add Option
      </button>
    </li>
  </ul>
</div>
