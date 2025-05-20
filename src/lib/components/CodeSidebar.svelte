<!-- src/lib/components/CodeSidebar.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { SurveyComponent } from '$lib/types/types';
  import { generateComponentHTML, generateComponentCSS, generateComponentJS } from '$lib/utils/code-export-utils';

  export let selectedComponent: SurveyComponent | null = null;
  export let width = 350;

  let activeTab = 'html';
  let htmlCode = '';
  let cssCode = '';
  let jsCode = '';
  let copySuccess = '';
  let copyTimeout: number | undefined;

  $: if (selectedComponent) {
    htmlCode = generateComponentHTML(selectedComponent);
    cssCode = generateComponentCSS(selectedComponent);
    jsCode = generateComponentJS(selectedComponent);
  } else {
    htmlCode = '<!-- Select a component to view its HTML code -->';
    cssCode = '/* Select a component to view its CSS code */';
    jsCode = '// Select a component to view its JavaScript code';
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      copySuccess = 'Copied to clipboard!';
      clearTimeout(copyTimeout);
      copyTimeout = window.setTimeout(() => {
        copySuccess = '';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      copySuccess = 'Failed to copy';
      clearTimeout(copyTimeout);
      copyTimeout = window.setTimeout(() => {
        copySuccess = '';
      }, 2000);
    });
  }

  function handleCopyClick() {
    let codeToCopy = '';
    switch (activeTab) {
      case 'html':
        codeToCopy = htmlCode;
        break;
      case 'css':
        codeToCopy = cssCode;
        break;
      case 'js':
        codeToCopy = jsCode;
        break;
    }
    copyToClipboard(codeToCopy);
  }

  onMount(() => {
    return () => {
      clearTimeout(copyTimeout);
    };
  });
</script>

<div class="code-sidebar h-full overflow-y-auto bg-gray-50 dark:bg-gray-800 dark:text-gray-300" style="width: {width}px;">
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">Component Code</h2>
      {#if selectedComponent}
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {selectedComponent.type} - {selectedComponent.id}
        </div>
      {/if}
    </div>

    <div class="mb-4 flex border-b border-gray-200 dark:border-gray-700">
      <button
        class="px-4 py-2 font-medium {activeTab === 'html' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}"
        on:click={() => (activeTab = 'html')}
      >
        HTML
      </button>
      <button
        class="px-4 py-2 font-medium {activeTab === 'css' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}"
        on:click={() => (activeTab = 'css')}
      >
        CSS
      </button>
      <button
        class="px-4 py-2 font-medium {activeTab === 'js' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}"
        on:click={() => (activeTab = 'js')}
      >
        JavaScript
      </button>
    </div>

    <div class="relative">
      <button
        class="absolute right-2 top-2 rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        on:click={handleCopyClick}
      >
        Copy
      </button>
      {#if copySuccess}
        <div class="absolute right-2 top-10 rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
          {copySuccess}
        </div>
      {/if}
      <pre
        class="mt-2 max-h-[calc(100vh-200px)] overflow-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-900"
      ><code>{activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode}</code></pre>
    </div>

    {#if !selectedComponent}
      <div class="mt-4 rounded bg-blue-100 p-3 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <p>Select a component on the canvas to view its code.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
