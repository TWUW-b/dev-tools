import { useState, useRef, useCallback, useEffect } from 'react';
import { DEBUG_COLORS as COLORS } from '../../styles/colors';

export interface ImageDropZoneProps {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxFiles?: number;
  maxFileSize?: number;
  disabled?: boolean;
  /** PiP ウィンドウの document（paste イベント用） */
  pipDocument?: Document | null;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageDropZone({
  files,
  onAdd,
  onRemove,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  disabled = false,
  pipDocument,
}: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const validateAndAdd = useCallback((incoming: File[]) => {
    setError(null);
    const remaining = maxFiles - files.length;
    if (remaining <= 0) {
      setError(`最大${maxFiles}枚まで添付できます`);
      return;
    }

    const valid: File[] = [];
    for (const file of incoming) {
      if (valid.length >= remaining) break;
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name}: 対応していない形式です（PNG/JPEG/WebP/GIF）`);
        continue;
      }
      if (file.size > maxFileSize) {
        setError(`${file.name}: ファイルサイズが大きすぎます（最大5MB）`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length > 0) {
      onAdd(valid);
    }
  }, [files.length, maxFiles, maxFileSize, onAdd]);

  // Clipboard paste handler
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (disabled) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && ALLOWED_TYPES.includes(item.type)) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      validateAndAdd(imageFiles);
    }
  }, [disabled, validateAndAdd]);

  // Bind paste to both main document and PiP document
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    pipDocument?.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
      pipDocument?.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste, pipDocument]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    if (dragCountRef.current === 1) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setIsDragging(false);

    if (disabled) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAdd(droppedFiles);
  }, [disabled, validateAndAdd]);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length > 0) validateAndAdd(selected);
    // Reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  }, [validateAndAdd]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="debug-field">
      <label>画像添付（{files.length}/{maxFiles}）</label>

      {/* Drop zone */}
      <div
        className={`debug-dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      >
        <span className="debug-icon" style={{ fontSize: '24px', color: COLORS.gray500 }}>
          {isDragging ? 'file_download' : 'add_photo_alternate'}
        </span>
        <span style={{ fontSize: '12px', color: COLORS.gray500 }}>
          {isDragging ? 'ドロップして追加' : 'クリック / ドラッグ / Ctrl+V で画像を追加'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Error */}
      {error && (
        <div style={{ fontSize: '11px', color: COLORS.error }}>{error}</div>
      )}

      {/* Thumbnails */}
      {files.length > 0 && (
        <div className="debug-thumbnails">
          {files.map((file, index) => (
            <ThumbnailPreview
              key={`${file.name}-${file.size}-${index}`}
              file={file}
              onRemove={() => onRemove(index)}
              formatSize={formatSize}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThumbnailPreview({ file, onRemove, formatSize }: {
  file: File;
  onRemove: () => void;
  formatSize: (bytes: number) => string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="debug-thumbnail">
      {url && (
        <img src={url} alt={file.name} className="debug-thumbnail-img" />
      )}
      <button
        type="button"
        className="debug-thumbnail-remove"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        aria-label="削除"
      >
        <span className="debug-icon" style={{ fontSize: '14px' }}>close</span>
      </button>
      <div className="debug-thumbnail-info">
        {formatSize(file.size)}
      </div>
    </div>
  );
}
