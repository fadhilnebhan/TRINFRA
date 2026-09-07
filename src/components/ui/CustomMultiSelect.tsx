'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Plus } from 'lucide-react';
import { SelectOption } from '@/components/opportunities/CustomSelect';

export interface CustomMultiSelectProps {
  id?: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  'aria-label'?: string;
}

export default function CustomMultiSelect({
  id,
  values,
  onChange,
  options,
  placeholder = 'Select options...',
  className = '',
  disabled = false,
  allowCustom = true,
  'aria-label': ariaLabel,
}: CustomMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || `custom-multiselect-${generatedId}`;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOption = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const handleRemoveChip = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== val));
  };

  const handleAddCustom = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setCustomInput('');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? 'z-50' : 'z-10'} ${className}`}
      data-custom-multiselect={selectId}
    >
      {/* Trigger Box with Selected Chips */}
      <div
        ref={triggerRef}
        id={selectId}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${selectId}-listbox`}
        aria-haspopup="listbox"
        aria-label={ariaLabel || placeholder}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full min-h-[44px] p-2 flex items-center justify-between gap-2 bg-white border rounded-lg cursor-pointer transition-all duration-200 select-none ${
          isOpen
            ? 'border-primary/40 ring-2 ring-primary/10 shadow-xs'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {values.length === 0 ? (
            <span className="text-gray-400 text-[14px] px-2 font-normal">
              {placeholder}
            </span>
          ) : (
            values.map((val) => {
              const label = options.find((o) => o.value === val)?.label || val;
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0E2115]/[0.06] text-primary text-[12px] font-semibold border border-primary/15 animate-in fade-in"
                >
                  <span className="truncate max-w-[150px]">{label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveChip(val, e)}
                      className="p-0.5 rounded-full hover:bg-primary/15 text-primary/70 hover:text-primary transition-colors cursor-pointer"
                      title={`Remove ${label}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              );
            })
          )}
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 mr-1 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-xl border border-gray-200/90 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden max-w-[calc(100vw-32px)] text-[14px]"
          >
            {/* Custom tag entry */}
            {allowCustom && (
              <div
                className="p-2 border-b border-gray-100 bg-[#FAFBF9]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustom(e);
                      }
                    }}
                    placeholder="Add custom tag..."
                    className="flex-1 px-3 py-1.5 text-[13px] bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-primary/50 text-foreground placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    disabled={!customInput.trim()}
                    className="p-1.5 rounded-lg bg-primary hover:bg-primary-light text-white disabled:opacity-40 transition-colors"
                    title="Add Tag"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Options List */}
            <ul
              id={`${selectId}-listbox`}
              role="listbox"
              aria-multiselectable="true"
              className="max-h-60 overflow-y-auto py-1.5 divide-y divide-gray-50 overscroll-contain focus:outline-none"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E1 transparent',
              }}
            >
              {options.map((option) => {
                const isSelected = values.includes(option.value);

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleToggleOption(option.value)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-150 select-none ${
                      isSelected
                        ? 'bg-[#0E2115]/[0.07] text-primary font-semibold'
                        : 'text-gray-700 hover:bg-[#0E2115]/[0.03]'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-2 transition-colors ${
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
