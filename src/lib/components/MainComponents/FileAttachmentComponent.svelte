<!-- src/lib/components/MainComponents  -->

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
	$: filename = src?.split('/').pop() || '';
	$: fileIcon = getFileIcon(filename);
</script>

<div class="file-attachment">
	<label for={id} class="mb-2 block">
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
	}

	.file-preview {
		display: flex;
		align-items: center;
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #f9f9f9;
	}

	.file-icon {
		font-size: 1.5em;
		margin-right: 8px;
	}

	.file-name {
		flex-grow: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.download-btn {
		background-color: #3b82f6;
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.875rem;
	}

	.no-file {
		padding: 8px;
		border: 1px dashed #ddd;
		border-radius: 4px;
		color: #666;
		text-align: center;
	}
</style>
