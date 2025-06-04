<script lang="ts">
	import { themeStore } from '$lib/stores/themeCustomizerStore.ts';

	export let label: string = 'Button';
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled: boolean = false;
	export let fullWidth: boolean = false;
	export let icon: string = '';
	export let iconPosition: 'left' | 'right' = 'left';

	// Size classes
	const sizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};

	// Get dynamic styles based on theme
	$: buttonStyle = getButtonStyle(variant);

	function getButtonStyle(variant: string) {
		const style = {
			padding: $themeStore.buttonPadding,
			borderRadius: $themeStore.borderRadius,
			fontFamily: $themeStore.fontFamily,
			transition: `all ${$themeStore.transitionDuration} ease-in-out`
		};

		// Add variant-specific styles
		switch (variant) {
			case 'primary':
				return {
					...style,
					backgroundColor: $themeStore.primaryColor,
					color: '#ffffff',
					border: 'none'
				};
			case 'secondary':
				return {
					...style,
					backgroundColor: $themeStore.secondaryColor,
					color: '#ffffff',
					border: 'none'
				};
			case 'outline':
				return {
					...style,
					backgroundColor: 'transparent',
					color: $themeStore.primaryColor,
					border: `${$themeStore.borderWidth} solid ${$themeStore.primaryColor}`
				};
			case 'ghost':
				return {
					...style,
					backgroundColor: 'transparent',
					color: $themeStore.primaryColor,
					border: 'none'
				};
			case 'link':
				return {
					...style,
					backgroundColor: 'transparent',
					color: $themeStore.primaryColor,
					border: 'none',
					padding: '0',
					textDecoration: 'underline'
				};
			default:
				return style;
		}
	}

	// Convert style object to inline style string
	function styleToString(style: Record<string, string>) {
		return Object.entries(style)
			.map(([key, value]) => `${key}: ${value}`)
			.join('; ');
	}
</script>

<button
	{type}
	class="inline-flex items-center justify-center {sizeClasses[size]} {fullWidth ? 'w-full' : ''}"
	style={styleToString(buttonStyle)}
	{disabled}
	on:click
>
	{#if icon && iconPosition === 'left'}
		<span class="mr-2">{icon}</span>
	{/if}

	{label}

	{#if icon && iconPosition === 'right'}
		<span class="ml-2">{icon}</span>
	{/if}
</button>
