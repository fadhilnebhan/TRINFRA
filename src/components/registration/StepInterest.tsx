'use client';

import { useState, useCallback } from 'react';
import { StepProps } from './types';
import { CheckCircle2, Upload, X, FileText, AlertCircle } from 'lucide-react';
import { validateFile, validateFileCount, MAX_FILE_SIZE, MAX_FILES } from '@/lib/validators';
import { DocumentMeta } from '@/lib/submissions';

const POOLING_OPTIONS = [
  {
    value: 'join' as const,
    title: 'Join an Existing Opportunity',
    description: 'I want to be part of an existing land pooling opportunity in my area.',
  },
  {
    value: 'create' as const,
    title: 'Create a New Opportunity',
    description: 'I want to start a new land pooling opportunity with my land.',
  },
  {
    value: 'unsure' as const,
    title: 'Not Sure Yet',
    description: 'I\'d like to explore my options and learn more first.',
  },
];

export default function StepInterest({ data, updateField, errors }: StepProps) {
  const [fileError, setFileError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setFileError('');

    const currentCount = data.documents.length;
    const countResult = validateFileCount(currentCount + files.length);
    if (!countResult.valid) {
      setFileError(countResult.message);
      return;
    }

    const newDocs: DocumentMeta[] = [];

    Array.from(files).forEach((file) => {
      const result = validateFile(file);
      if (!result.valid) {
        setFileError(result.message);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const doc: DocumentMeta = {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUri: reader.result as string,
        };
        newDocs.push(doc);

        if (newDocs.length === files.length || newDocs.length + data.documents.length >= MAX_FILES) {
          updateField('documents', [...data.documents, ...newDocs]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [data.documents, updateField]);

  const removeFile = (index: number) => {
    const updated = data.documents.filter((_, i) => i !== index);
    updateField('documents', updated);
    setFileError('');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <h3 className="text-[22px] md:text-[24px] font-heading font-bold text-foreground mb-2">
        What would you like to do?
      </h3>
      <p className="text-[14px] text-gray-500 mb-8">
        Select the option that best matches your interest.
      </p>

      {/* Pooling Interest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {POOLING_OPTIONS.map((option) => {
          const isSelected = data.poolingInterest === option.value;

          return (
            <button
              key={option.value}
              type="button"
              id={`pooling-${option.value}`}
              onClick={() => updateField('poolingInterest', option.value)}
              className={`relative flex flex-col items-center text-center p-6 md:p-7 rounded-xl transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-2 border-dashed border-primary bg-primary/[0.03] shadow-sm'
                  : 'border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Selection indicator */}
              <div className="absolute top-3 right-3">
                {isSelected ? (
                  <CheckCircle2 size={20} className="text-primary fill-primary stroke-white" />
                ) : (
                  <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-300" />
                )}
              </div>

              <h4 className={`text-[14px] font-bold mb-1.5 mt-2 ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                {option.title}
              </h4>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
      {errors.poolingInterest && <p className="text-red-500 text-[13px] mb-6">{errors.poolingInterest}</p>}

      {/* Document Upload — Optional */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-[16px] font-heading font-bold text-foreground">
              Supporting Documents
              <span className="text-[12px] font-normal text-gray-400 ml-2 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
            </h4>
            <p className="text-[13px] text-gray-500 mt-1">
              Detailed documentation can be provided during verification.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-accent bg-accent/5'
              : 'border-gray-200 bg-white hover:border-gray-300'
          } ${data.documents.length >= MAX_FILES ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => {
            if (data.documents.length < MAX_FILES) {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx';
              input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
              input.click();
            }
          }}
        >
          <Upload size={28} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[14px] font-medium text-foreground/70">
            {isDragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">
            PDF, JPG, PNG, DOCX — Max {MAX_FILE_SIZE / (1024 * 1024)} MB per file, up to {MAX_FILES} files
          </p>
        </div>

        {/* File Error */}
        {fileError && (
          <div className="flex items-center gap-2 mt-3 text-red-500">
            <AlertCircle size={14} />
            <p className="text-[12px]">{fileError}</p>
          </div>
        )}

        {/* Uploaded Files List */}
        {data.documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 bg-surface-alt border border-gray-100 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-[11px] text-gray-400">{formatSize(doc.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors shrink-0 ml-3"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
