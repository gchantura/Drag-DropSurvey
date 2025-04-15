<script lang="ts">
	import { addComponent } from '../../stores/surveyStore.js';
	import type { ComponentType } from '../../types/survey.js';

	const components: { type: ComponentType; label: string; icon: string }[] = [
		{ type: 'text', label: 'Text', icon: '📝' },
		{ type: 'input', label: 'Input', icon: '✏️' },
		{ type: 'textarea', label: 'Text Area', icon: '📄' },
		{ type: 'checkbox', label: 'Checkbox', icon: '☑️' },
		{ type: 'radio', label: 'Radio', icon: '⚪' },
		{ type: 'dropdown', label: 'Dropdown', icon: '🔽' },
		{ type: 'fileAttachment', label: 'File Attachment', icon: '📎' },
		{ type: 'fileUpload', label: 'File Upload', icon: '📤' },
		{ type: 'section', label: 'Section', icon: '📑' },
		{ type: 'title', label: 'Title', icon: '🔖' },
		{ type: 'introduction', label: 'Introduction', icon: '📋' },
		{ type: 'matrix', label: 'Matrix', icon: '🔢' },
		{ type: 'rating', label: 'Rating', icon: '⭐' }
	];

	function handleAddComponent(type: ComponentType) {
		addComponent(type);
	}
</script>

<div class="component-toolbar">
	<h3 class="toolbar-title">Components</h3>
	<div class="toolbar-buttons">
		{#each components as comp}
			<button
				class="component-button"
				on:click={() => handleAddComponent(comp.type)}
				title={comp.label}
			>
				<span class="component-icon">{comp.icon}</span>
				<span class="component-label">{comp.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.component-toolbar {
		background-color: #f8f9fa;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		padding: 12px;
	}

	.toolbar-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.toolbar-buttons {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 8px;
	}

	.component-button {
		display: flex;
		align-items: center;
		padding: 8px;
		background-color: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.component-button:hover {
		background-color: #f1f5f9;
		border-color: #cbd5e1;
	}

	.component-icon {
		font-size: 1.25rem;
		margin-right: 8px;
	}

	.component-label {
		font-size: 0.875rem;
	}
</style>
