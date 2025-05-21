<script lang="ts">
  import { themeStore, type ThemeSettings, predefinedThemes } from '$lib/stores/themeCustomizerStore';
  import ColorPicker from './ColorPicker.svelte';
  import RangeSlider from './RangeSlider.svelte';
  import SelectInput from './SelectInput.svelte';
  import TextInput from './TextInput.svelte';
  import { theme } from '$lib/stores/themeStore';
  
  export let isOpen = false;
  
  // Font family options
  const fontFamilyOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' }
  ];
  
  // Predefined theme options
  const themeOptions = Object.keys(predefinedThemes).map(key => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1)
  }));
  
  let selectedPredefinedTheme = 'default';
  
  function applyPredefinedTheme() {
    themeStore.applyTheme(selectedPredefinedTheme as keyof typeof predefinedThemes);
  }
  
  function resetTheme() {
    if (confirm('Are you sure you want to reset all theme settings to default?')) {
      themeStore.reset();
      selectedPredefinedTheme = 'default';
    }
  }
  
  function handleClose() {
    isOpen = false;
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" class:hidden={!isOpen}>
  <div class="relative max-h-[90vh] w-[600px] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Theme Customizer</h2>
      <button
        class="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        on:click={handleClose}
        aria-label="Close theme customizer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="mb-6">
      <div class="mb-4 flex items-center gap-4">
        <SelectInput
          label="Predefined Themes"
          options={themeOptions}
          bind:value={selectedPredefinedTheme}
        />
        <button
          class="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          on:click={applyPredefinedTheme}
        >
          Apply Theme
        </button>
      </div>
      
      <div class="flex justify-end">
        <button
          class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          on:click={resetTheme}
        >
          Reset to Default
        </button>
      </div>
    </div>
    
    <div class="space-y-6">
      <!-- Colors Section -->
      <div class="rounded border border-gray-200 p-4 dark:border-gray-700">
        <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Colors</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Primary Color"
            bind:value={$themeStore.primaryColor}
            on:change={(e) => themeStore.updateSetting('primaryColor', e.detail)}
          />
          
          <ColorPicker
            label="Secondary Color"
            bind:value={$themeStore.secondaryColor}
            on:change={(e) => themeStore.updateSetting('secondaryColor', e.detail)}
          />
          
          <ColorPicker
            label="Accent Color"
            bind:value={$themeStore.accentColor}
            on:change={(e) => themeStore.updateSetting('accentColor', e.detail)}
          />
          
          <ColorPicker
            label="Text Color"
            bind:value={$themeStore.textColor}
            on:change={(e) => themeStore.updateSetting('textColor', e.detail)}
          />
          
          <ColorPicker
            label="Background Color"
            bind:value={$themeStore.backgroundColor}
            on:change={(e) => themeStore.updateSetting('backgroundColor', e.detail)}
          />
          
          <ColorPicker
            label="Border Color"
            bind:value={$themeStore.borderColor}
            on:change={(e) => themeStore.updateSetting('borderColor', e.detail)}
          />
          
          <ColorPicker
            label="Error Color"
            bind:value={$themeStore.errorColor}
            on:change={(e) => themeStore.updateSetting('errorColor', e.detail)}
          />
          
          <ColorPicker
            label="Success Color"
            bind:value={$themeStore.successColor}
            on:change={(e) => themeStore.updateSetting('successColor', e.detail)}
          />
        </div>
      </div>
      
      <!-- Typography Section -->
      <div class="rounded border border-gray-200 p-4 dark:border-gray-700">
        <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Typography</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <SelectInput
            label="Font Family"
            options={fontFamilyOptions}
            bind:value={$themeStore.fontFamily}
            on:change={(e) => themeStore.updateSetting('fontFamily', e.detail)}
          />
          
          <SelectInput
            label="Heading Font Family"
            options={fontFamilyOptions}
            bind:value={$themeStore.headingFontFamily}
            on:change={(e) => themeStore.updateSetting('headingFontFamily', e.detail)}
          />
          
          <TextInput
            label="Font Size"
            bind:value={$themeStore.fontSize}
            on:change={(e) => themeStore.updateSetting('fontSize', e.detail)}
            helpText="e.g., 16px, 1rem"
          />
        </div>
      </div>
      
      <!-- Borders & Spacing Section -->
      <div class="rounded border border-gray-200 p-4 dark:border-gray-700">
        <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Borders & Spacing</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <TextInput
            label="Border Radius"
            bind:value={$themeStore.borderRadius}
            on:change={(e) => themeStore.updateSetting('borderRadius', e.detail)}
            helpText="e.g., 0.375rem, 6px"
          />
          
          <TextInput
            label="Border Width"
            bind:value={$themeStore.borderWidth}
            on:change={(e) => themeStore.updateSetting('borderWidth', e.detail)}
            helpText="e.g., 1px, 0.125rem"
          />
          
          <TextInput
            label="Input Padding"
            bind:value={$themeStore.inputPadding}
            on:change={(e) => themeStore.updateSetting('inputPadding', e.detail)}
            helpText="e.g., 0.5rem 0.75rem"
          />
          
          <TextInput
            label="Button Padding"
            bind:value={$themeStore.buttonPadding}
            on:change={(e) => themeStore.updateSetting('buttonPadding', e.detail)}
            helpText="e.g., 0.5rem 1rem"
          />
          
          <TextInput
            label="Component Spacing"
            bind:value={$themeStore.componentSpacing}
            on:change={(e) => themeStore.updateSetting('componentSpacing', e.detail)}
            helpText="e.g., 1rem, 16px"
          />
        </div>
      </div>
      
      <!-- Effects Section -->
      <div class="rounded border border-gray-200 p-4 dark:border-gray-700">
        <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Effects</h3>
        
        <div class="grid grid-cols-1 gap-4">
          <TextInput
            label="Box Shadow"
            bind:value={$themeStore.boxShadow}
            on:change={(e) => themeStore.updateSetting('boxShadow', e.detail)}
            helpText="e.g., 0 1px 3px 0 rgba(0, 0, 0, 0.1)"
          />
          
          <TextInput
            label="Transition Duration"
            bind:value={$themeStore.transitionDuration}
            on:change={(e) => themeStore.updateSetting('transitionDuration', e.detail)}
            helpText="e.g., 150ms, 0.15s"
          />
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex justify-end">
      <button
        class="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        on:click={handleClose}
      >
        Close
      </button>
    </div>
  </div>
</div>
