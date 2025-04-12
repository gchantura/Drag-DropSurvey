<script lang="ts">
	import { addComponent } from '$lib/stores/surveyStore.ts';
	import { GradientButton } from 'flowbite-svelte';
</script>

<div class="mt-1 grid grid-cols-2 p-5">
	<GradientButton color="red" class="mt-4 flex w-4/5" on:click={() => addComponent('text')}>
		Text
	</GradientButton>
	<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('input')}>
		Input
	</GradientButton>
	<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('textarea')}>
		Text Area
	</GradientButton>
	<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('checkbox')}>
		Checkboxes
	</GradientButton>
	<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('radio')}>
		Radio Buttons
	</GradientButton>
	<GradientButton color="blue" class="mt-4 flex w-4/5" on:click={() => addComponent('dropdown')}>
		Dropdown
	</GradientButton>
</div>
