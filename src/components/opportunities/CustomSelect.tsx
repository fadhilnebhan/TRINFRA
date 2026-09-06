'use client';

import { useState, useRef, useEffect, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'md' | 'sm';
  align?: 'left' | 'right';
  disabled?: boolean;
  'aria-label'?: string;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  size = 'md',
  align = 'left',
  disabled = false,
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const selectId = id || `custom-select-${generatedId}`;

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  // Sync highlightedIndex when opening
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, selectedIndex]);

  // Click outside to close
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

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const activeElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, highlightedIndex]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            handleSelect(options[highlightedIndex].value);
          }
        } else {
          setIsOpen(true);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case 'End':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(options.length - 1);
        }
        break;

      default:
        // Type-ahead jump to matching option
        if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
          const char = e.key.toLowerCase();
          const nextIndex = options.findIndex((opt, idx) => {
            return idx > highlightedIndex && opt.label.toLowerCase().startsWith(char);
          });
          const fallbackIndex = options.findIndex((opt) =>
            opt.label.toLowerCase().startsWith(char)
          );
          const targetIndex = nextIndex !== -1 ? nextIndex : fallbackIndex;
          if (targetIndex !== -1) {
            setHighlightedIndex(targetIndex);
            if (!isOpen) {
              setIsOpen(true);
            }
          }
        }
        break;
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? 'z-50' : 'z-10'} ${className}`}
      data-custom-select={selectId}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        aria-controls={`${selectId}-listbox`}
        className={`group relative w-full flex items-center justify-between text-left bg-white border transition-all duration-200 select-none outline-none ${
          isSmall
            ? 'px-3 py-1.5 rounded-md text-[13px] font-semibold min-h-[34px]'
            : 'px-4 py-2.5 rounded-lg text-[14px] min-h-[42px]'
        } ${
          isOpen
            ? 'border-primary/40 ring-2 ring-primary/10 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
      >
        <span
          className={`truncate pr-2 ${
            selectedOption ? 'text-foreground font-normal' : 'text-gray-400 font-normal'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          size={isSmall ? 14 : 16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ease-out ${
            isOpen ? 'rotate-180 text-primary' : 'group-hover:text-gray-600'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-[calc(100%+4px)] z-50 bg-white rounded-xl border border-gray-200/90 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden max-w-[calc(100vw-32px)] ${
              align === 'right'
                ? 'right-0 left-auto min-w-[150px] sm:min-w-[170px]'
                : 'left-0 right-0 w-full min-w-full sm:min-w-[200px]'
            } ${isSmall ? 'text-[13px]' : 'text-[14px]'}`}
          >
            <ul
              ref={listRef}
              id={`${selectId}-listbox`}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `${selectId}-option-${highlightedIndex}`
                  : undefined
              }
              className="max-h-64 overflow-y-auto py-1.5 focus:outline-none divide-y divide-gray-50 overscroll-contain"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E1 transparent',
              }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={option.value || `opt-${index}`}
                    id={`${selectId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    data-value={option.value}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-150 select-none ${
                      isSelected
                        ? 'bg-[#0E2115]/[0.07] text-primary font-semibold'
                        : isHighlighted
                        ? 'bg-[#0E2115]/[0.04] text-primary'
                        : 'text-gray-700 hover:bg-[#0E2115]/[0.03]'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check
                        size={15}
                        className="text-accent shrink-0 ml-2 stroke-[2.5]"
                        aria-hidden="true"
                      />
                    )}
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
