<script lang="ts">
  export let componentId: string;
  export let rows: string[] = [];
  export let columns: string[] = [];
  export let onAddRow: () => void;
  export let onUpdateRow: (index: number, value: string) => void;
  export let onRemoveRow: (index: number) => void;
  export let onAddColumn: () => void;
  export let onUpdateColumn: (index: number, value: string) => void;
  export let onRemoveColumn: (index: number) => void;

  function handleRowChange(index: number, e: Event) {
    const target = e.target as HTMLInputElement;
    onUpdateRow(index, target.value);
  }

  function handleColumnChange(index: number, e: Event) {
    const target = e.target as HTMLInputElement;
    onUpdateColumn(index, target.value);
  }
</script>

<div class="matrix-list-editor space-y-6">
  <div class="rows-editor">
    <span class="mb-1 block text-sm font-medium">Matrix Rows:</span>
    
    <ul class="space-y-2">
      {#each rows as row, i}
        <li class="flex items-center">
          <input
            type="text"
            id={`${componentId}-row-${i}`}
            class="mr-2 flex-1 rounded border p-2 dark:border-gray-700 dark:bg-gray-800"
            value={row}
            on:input={(e) => handleRowChange(i, e)}
          />
          
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            on:click={() => onRemoveRow(i)}
            aria-label={`Remove row ${i + 1}`}
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
          on:click={onAddRow}
        >
          <svg class="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Row
        </button>
      </li>
    </ul>
  </div>

  <div class="columns-editor">
    <span class="mb-1 block text-sm font-medium">Matrix Columns:</span>
    
    <ul class="space-y-2">
      {#each columns as column, i}
        <li class="flex items-center">
          <input
            type="text"
            id={`${componentId}-column-${i}`}
            class="mr-2 flex-1 rounded border p-2 dark:border-gray-700 dark:bg-gray-800"
            value={column}
            on:input={(e) => handleColumnChange(i, e)}
          />
          
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            on:click={() => onRemoveColumn(i)}
            aria-label={`Remove column ${i + 1}`}
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
          on:click={onAddColumn}
        >
          <svg class="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Column
        </button>
      </li>
    </ul>
  </div>
</div>
