<script lang="ts">
  export let size: number = 40;
  export let color: string = "currentColor";
  export let secondaryColor: string = "#fe795d";
  export let variant: "full" | "icon" = "full";
</script>

<div class="kceva-logo" style="--logo-size: {size}px; --logo-color: {color}; --logo-secondary: {secondaryColor}">
  <div class="logo-container">
    <!-- Icon part -->
    <div class="logo-icon">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 4C8 2.89543 8.89543 2 10 2H30C31.1046 2 32 2.89543 32 4V36C32 37.1046 31.1046 38 30 38H10C8.89543 38 8 37.1046 8 36V4Z" fill="var(--logo-secondary)" />
        <path d="M14 10L26 20L14 30" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    
    <!-- Text part (only shown in full variant) -->
    {#if variant === "full"}
      <div class="logo-text">
        <span class="logo-text-k">K</span>
        <span class="logo-text-ceva">ceva</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .kceva-logo {
    display: inline-flex;
    align-items: center;
  }
  
  .logo-container {
    display: flex;
    align-items: center;
    gap: calc(var(--logo-size) * 0.2);
  }
  
  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .logo-text {
    font-weight: bold;
    font-size: calc(var(--logo-size) * 0.6);
    line-height: 1;
    color: var(--logo-color);
    display: flex;
  }
  
  .logo-text-k {
    color: var(--logo-secondary);
  }
  
  .logo-text-ceva {
    color: var(--logo-color);
  }
</style>
