'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

interface ImageUploadFieldProps {
  label?: string;
  sublabel?: string;
  currentImageUrl?: string;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ImageUploadField({
  label = 'Opportunity Image',
  sublabel = 'Choose an image from your computer',
  currentImageUrl,
  onFileSelect,
  onRemove,
  disabled = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync preview when currentImageUrl changes (e.g. when opening edit modal)
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(currentImageUrl || '');
    }
  }, [currentImageUrl, selectedFile]);

  // Clean up object URL when unmounting or selecting new file
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleValidateAndProcess = (file: File) => {
    setError(null);

    // 1. Validate file format
    const mimeType = (file.type || '').toLowerCase();
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const isAllowedMime = ALLOWED_TYPES.includes(mimeType);
    const isAllowedExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);

    if (!isAllowedMime && !isAllowedExt) {
      setError('Please select a JPG, PNG, or WEBP image.');
      return;
    }

    // 2. Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    // Revoke previous blob if any
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleValidateAndProcess(file);
    }
    // Reset input value so the same file can be re-selected if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setError(null);
    onFileSelect(null);
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleValidateAndProcess(file);
    }
  };

  const hasImage = Boolean(previewUrl);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[13px] font-semibold text-gray-700">
          {label}
        </label>
        {selectedFile && (
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Ready to upload
          </span>
        )}
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload Image File"
      />

      {/* Preview View */}
      {hasImage ? (
        <div className="bg-[#FAFBF9] border border-gray-200/90 rounded-xl p-4 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Image Thumbnail */}
            <div className="relative w-28 h-20 sm:w-32 sm:h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-2xs">
              <Image
                src={previewUrl}
                alt="Selected Image Preview"
                fill
                unoptimized={previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')}
                className="object-cover"
              />
            </div>

            {/* Metadata & Actions */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[13px] font-semibold text-foreground truncate">
                {selectedFile?.name || previewUrl.split('/').pop() || 'Current Image'}
              </p>
              <p className="text-[11px] text-gray-500 font-mono">
                {selectedFile ? formatBytes(selectedFile.size) : 'Configured platform image'}
              </p>

              <div className="pt-2 flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[12px] font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} />
                  <span>Change Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-700 text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 select-none ${
            isDragOver
              ? 'border-primary bg-primary/[0.04] scale-[0.99]'
              : 'border-gray-200 hover:border-gray-300 bg-[#FCFDFB] hover:bg-[#F9FAF8]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-primary flex items-center justify-center border border-emerald-100/60 shadow-2xs">
              <UploadCloud size={22} className="text-primary" />
            </div>

            <div className="space-y-0.5">
              <p className="text-[14px] font-bold text-foreground">
                Upload {label.toLowerCase().includes('image') ? label : `${label} image`}
              </p>
              <p className="text-[12px] text-gray-500">
                {sublabel}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
              disabled={disabled}
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-white text-[13px] font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <ImageIcon size={15} />
              <span>Browse Images</span>
            </button>

            <p className="text-[11px] text-gray-400 font-medium pt-1">
              JPG, JPEG, PNG, WEBP • Max 5 MB
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[12px] font-medium animate-in fade-in duration-150">
          <AlertCircle size={15} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
