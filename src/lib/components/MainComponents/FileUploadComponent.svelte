<!-- src/lib/components/MainComponents/FileUploadComponent.svelte -->

<script lang="ts">
	export let id: string;
	export let label: string;
	export let required: boolean = false;
	export let acceptedFileTypes: string = '.pdf,.doc,.docx,.jpg,.png';
	export let maxFileSize: number = 5; // In MB

	let selectedFile: File | null = null;
	let errorMessage = '';

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;

		if (files && files.length > 0) {
			const file = files[0];

			// Check file size
			if (file.size > maxFileSize * 1024 * 1024) {
				errorMessage = `File size exceeds the maximum limit of ${maxFileSize}MB`;
				selectedFile = null;
				return;
			}

			selectedFile = file;
			errorMessage = '';
		}
	}
</script>

<div class="file-upload">
	<label for={id} class="mb-2 block">
		{label}
		{required ? '*' : ''}
	</label>

	<div class="upload-container">
		<input
			type="file"
			{id}
			accept={acceptedFileTypes}
			on:change={handleFileChange}
			class="file-input"
		/>

		<div class="upload-btn">
			<span>Choose file</span>
			<span class="file-name">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
		</div>
	</div>

	{#if errorMessage}
		<div class="error-message">{errorMessage}</div>
	{/if}

	<div class="help-text">
		Accepted file types: {acceptedFileTypes.split(',').join(', ')}
		<br />
		Maximum file size: {maxFileSize}MB
	</div>
</div>

<style>
	.file-upload {
		width: 100%;
	}

	.upload-container {
		position: relative;
		display: flex;
		margin-bottom: 8px;
	}

	.file-input {
		position: absolute;
		left: 0;
		top: 0;
		opacity: 0;
		width: 110px;
		height: 100%;
		cursor: pointer;
		z-index: 2;
	}

	.upload-btn {
		display: flex;
		width: 100%;
		align-items: center;
		border: 1px solid #ddd;
		border-radius: 4px;
		overflow: hidden;
	}

	.upload-btn span:first-child {
		background-color: #f0f0f0;
		padding: 8px 12px;
		border-right: 1px solid #ddd;
		white-space: nowrap;
	}

	.file-name {
		padding: 8px 12px;
		flex-grow: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.error-message {
		color: #e53e3e;
		font-size: 0.875rem;
		margin-bottom: 8px;
	}

	.help-text {
		font-size: 0.75rem;
		color: #666;
	}
</style>
