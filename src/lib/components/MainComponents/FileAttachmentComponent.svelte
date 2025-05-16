<script lang="ts">
	export let id: string;
	export let label: string;
	export let src: string = '';
	export let required: boolean = false;

	function getFileExtension(filename: string) {
		return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
	}

	function getFileIcon(filename: string) {
		const ext = getFileExtension(filename).toLowerCase();

		if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return '📷';
		if (['pdf'].includes(ext)) return '📄';
		if (['doc', 'docx'].includes(ext)) return '📝';
		if (['xls', 'xlsx'].includes(ext)) return '📊';
		if (['ppt', 'pptx'].includes(ext)) return '📑';
		if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';

		return '📎';
	}

	// Extract filename from source path
	let filename: string;
	let fileIcon: string;

	$: filename = src?.split('/').pop() || '';
	$: fileIcon = getFileIcon(filename);
</script>

<div class="file-attachment">
	<label for={id} class="file-label">
		{label}
		{required ? '*' : ''}
	</label>

	{#if src}
		<div class="file-preview">
			<span class="file-icon">{fileIcon}</span>
			<span class="file-name">{filename}</span>
			<a href={src} download class="download-btn" target="_blank" rel="noopener noreferrer">
				Download
			</a>
		</div>
	{:else}
		<div class="no-file">No file attached</div>
	{/if}
</div>

<style>
	.file-attachment {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.file-label {
		margin-bottom: 8px;
		font-weight: 500;
	}

	.file-preview {
		display: flex;
		align-items: center;
		padding: 10px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background-color: #f9fafb;
	}

	.file-icon {
		font-size: 1.5em;
		margin-right: 10px;
	}

	.file-name {
		flex-grow: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #4b5563;
	}

	.download-btn {
		background-color: #3b82f6;
		color: white;
		padding: 4px 10px;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.download-btn:hover {
		background-color: #2563eb;
	}

	.no-file {
		padding: 12px;
		border: 1px dashed #d1d5db;
		border-radius: 6px;
		color: #6b7280;
		text-align: center;
		background-color: #f9fafb;
	}
</style>
