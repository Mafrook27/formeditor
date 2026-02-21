// ============================================================
// src/shared/components/NumberInput.tsx
// ============================================================
import { useRef } from 'react';
import { cn } from '@/shared/utils/cn';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit,
  disabled,
  className,
  'aria-label': ariaLabel,
}: NumberInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  function clamp(v: number) {
    return Math.min(max, Math.max(min, v));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clamp(value + (e.shiftKey ? 10 : step)));
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clamp(value - (e.shiftKey ? 10 : step)));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const raw = parseFloat(e.target.value);
    onChange(isNaN(raw) ? min : clamp(raw));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseFloat(e.target.value);
    if (!isNaN(raw)) onChange(clamp(raw));
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <input
        ref={ref}
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        disabled={disabled}
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        className={cn(
          'w-16 rounded border border-slate-200 bg-white px-2 py-1 text-right text-sm',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />
      {unit && (
        <span className="min-w-[1.5rem] text-xs text-slate-400">{unit}</span>
      )}
    </div>
  );
}


// ============================================================
// src/shared/components/ColorPicker.tsx
// ============================================================
import { useRef } from 'react';
import { cn } from '@/shared/utils/cn';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = /^#[0-9A-Fa-f]{6}$/.test(value);

  function handleSwatchClick() {
    inputRef.current?.click();
  }

  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
      onChange(v);
    }
  }

  function handleTextBlur(e: React.FocusEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (!/^#[0-9A-Fa-f]{6}$/.test(v)) {
      onChange(''); // reset invalid
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Hidden native color input */}
      <input
        ref={inputRef}
        type="color"
        value={isValid ? value : '#ffffff'}
        onChange={handleColorChange}
        className="sr-only"
        aria-label={label ?? 'Color picker'}
      />

      {/* Color swatch */}
      <button
        type="button"
        onClick={handleSwatchClick}
        className="h-7 w-7 flex-shrink-0 rounded border border-slate-300 cursor-pointer shadow-sm"
        style={{
          backgroundColor: isValid ? value : undefined,
          backgroundImage: !isValid
            ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
            : undefined,
          backgroundSize: !isValid ? '8px 8px' : undefined,
          backgroundPosition: !isValid ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
        }}
        aria-label={`${label ?? 'Color'}: ${value || 'none'}`}
      />

      {/* Hex input */}
      <input
        type="text"
        value={value}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        placeholder="#000000"
        maxLength={7}
        className={cn(
          'w-24 rounded border border-slate-200 px-2 py-1 text-sm font-mono',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          !isValid && value ? 'border-red-300 text-red-500' : '',
        )}
        aria-label={`${label ?? 'Color'} hex value`}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-slate-400 hover:text-slate-600"
          aria-label="Clear color"
        >
          ✕
        </button>
      )}
    </div>
  );
}


// ============================================================
// src/shared/components/PropertyRow.tsx
// ============================================================
import { cn } from '@/shared/utils/cn';

interface PropertyRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  vertical?: boolean;
}

export function PropertyRow({ label, hint, children, className, vertical }: PropertyRowProps) {
  return (
    <div className={cn(
      vertical ? 'flex flex-col gap-1' : 'flex items-center gap-3',
      'py-1.5',
      className,
    )}>
      <div className={cn(
        'flex-shrink-0 text-xs font-medium text-slate-500',
        vertical ? '' : 'w-24',
      )}>
        {label}
        {hint && <p className="mt-0.5 text-[10px] font-normal text-slate-400">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}


// ============================================================
// src/shared/components/SliderWithInput.tsx
// ============================================================
import * as Slider from '@radix-ui/react-slider';
import { NumberInput } from './NumberInput';
import { cn } from '@/shared/utils/cn';

interface SliderWithInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
}

export function SliderWithInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  className,
}: SliderWithInputProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Slider.Root
        className="relative flex flex-1 touch-none select-none items-center"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track className="relative h-1 flex-1 rounded-full bg-slate-200">
          <Slider.Range className="absolute h-full rounded-full bg-blue-500" />
        </Slider.Track>
        <Slider.Thumb
          className="block h-4 w-4 rounded-full border border-slate-300 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Slider"
        />
      </Slider.Root>
      <NumberInput value={value} onChange={onChange} min={min} max={max} step={step} unit={unit} />
    </div>
  );
}


// ============================================================
// src/shared/components/InspectorSection.tsx
// ============================================================
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface InspectorSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function InspectorSection({ title, children, defaultOpen = true }: InspectorSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50"
      >
        {title}
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}


// ============================================================
// src/shared/components/ConfirmDialog.tsx
// ============================================================
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


// ============================================================
// src/features/form-editor/blocks/_blockUtils.ts
// ============================================================
// Utility used by ALL block components

import type { BaseBlock } from '../editorConfig';

export function getLayoutStyle(block: BaseBlock): React.CSSProperties {
  return {
    width: `${block.width ?? 100}%`,
    marginTop: block.marginTop ?? 0,
    marginBottom: block.marginBottom ?? 0,
    marginLeft: block.marginLeft ?? 0,
    marginRight: block.marginRight ?? 0,
    paddingTop: block.paddingY ?? 0,
    paddingBottom: block.paddingY ?? 0,
    paddingLeft: block.paddingX ?? 0,
    paddingRight: block.paddingX ?? 0,
    backgroundColor: block.backgroundColor || undefined,
    border: block.borderWidth
      ? `${block.borderWidth}px ${(block as any).borderStyle ?? 'solid'} ${block.borderColor ?? '#e5e7eb'}`
      : undefined,
    borderRadius: block.borderRadius ? `${block.borderRadius}px` : undefined,
    boxSizing: 'border-box' as const,
  };
}

// Form field shared styles — used by text-input, textarea, select, date-picker
export const fieldBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #D1D5DB',
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: 'inherit',
  backgroundColor: 'white',
  color: '#111827',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export const labelBaseStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
};

export const helperTextStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '11px',
  color: '#9CA3AF',
};
