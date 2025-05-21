<script lang="ts">
  export let title: string;
  export let collapsible: boolean = false;
  
  let collapsed = false;

  function toggleCollapse() {
    if (collapsible) {
      collapsed = !collapsed;
    }
  }
</script>

<div class="property-section mb-6">
  <div 
    class="mb-3 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700"
    class:cursor-pointer={collapsible}
    on:click={toggleCollapse}
    on:keydown={(e) => e.key === 'Enter' && toggleCollapse()}
    role={collapsible ? "button" : undefined}
    tabindex={collapsible ? 0 : undefined}
  >
    <h3 class="text-base font-medium">{title}</h3>
    {#if collapsible}
      <svg 
        class="h-4 w-4 transition-transform duration-200 ease-in-out" 
        class:rotate-180={collapsed}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    {/if}
  </div>
  
  {#if !collapsed}
    <div class="property-section-content space-y-3">
      <slot></slot>
    </div>
  {/if}
</div>
