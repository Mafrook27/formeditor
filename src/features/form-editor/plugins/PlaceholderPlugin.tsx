import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';

const availablePlaceholders = [
  { value: '@CustomerName', label: 'Customer Name', category: 'Customer', format: 'standard' },
  { value: '@CustomerEmail', label: 'Customer Email', category: 'Customer', format: 'standard' },
  { value: '@CustomerPhone', label: 'Customer Phone', category: 'Customer', format: 'standard' },
  { value: '@AccountNumber', label: 'Account Number', category: 'Account', format: 'standard' },
  { value: '@AccountType', label: 'Account Type', category: 'Account', format: 'standard' },
  { value: '@CurrentDate', label: 'Current Date', category: 'System', format: 'standard' },
  { value: '@ExpiryDate', label: 'Expiry Date', category: 'System', format: 'standard' },
  { value: '@CompanyName', label: 'Company Name', category: 'Company', format: 'standard' },
  { value: '@CompanyAddress', label: 'Company Address', category: 'Company', format: 'standard' },
  { value: '@AgentName', label: 'Agent Name', category: 'Agent', format: 'standard' },
  { value: '@AgentEmail', label: 'Agent Email', category: 'Agent', format: 'standard' },
  { value: 'PH@FirstName', label: 'First Name', category: 'Customer', format: 'fintech' },
  { value: 'PH@LastName', label: 'Last Name', category: 'Customer', format: 'fintech' },
  { value: 'PH@PortfolioName', label: 'Portfolio Name', category: 'Company', format: 'fintech' },
  { value: 'PH@PortfolioAddress', label: 'Portfolio Address', category: 'Company', format: 'fintech' },
  { value: 'PH@PortfolioCity', label: 'Portfolio City', category: 'Company', format: 'fintech' },
  { value: 'PH@PortfolioState', label: 'Portfolio State', category: 'Company', format: 'fintech' },
  { value: 'PH@PortfolioZip', label: 'Portfolio Zip', category: 'Company', format: 'fintech' },
  { value: 'PH@PortfolioPhone', label: 'Portfolio Phone', category: 'Company', format: 'fintech' },
  { value: 'PH@PortfolioEmail', label: 'Portfolio Email', category: 'Company', format: 'fintech' },
  { value: 'PH@LoanAmount', label: 'Loan Amount', category: 'Loan', format: 'fintech' },
  { value: 'PH@APR', label: 'APR %', category: 'Loan', format: 'fintech' },
  { value: 'PH@InterestRate', label: 'Interest Rate', category: 'Loan', format: 'fintech' },
  { value: 'PH@CABFeeRate', label: 'CAB Fee Rate', category: 'Loan', format: 'fintech' },
  { value: 'PH@TotalPayment', label: 'Total Payment', category: 'Loan', format: 'fintech' },
  { value: 'PH@DateNow', label: 'Date Now', category: 'System', format: 'fintech' },
  { value: 'PH@LoanID', label: 'Loan ID', category: 'Account', format: 'fintech' },
  { value: 'PH@CustomerAddress', label: 'Customer Address', category: 'Customer', format: 'fintech' },
  { value: 'PH@CustomerCity', label: 'Customer City', category: 'Customer', format: 'fintech' },
  { value: 'PH@CustomerState', label: 'Customer State', category: 'Customer', format: 'fintech' },
  { value: 'PH@CustomerZip', label: 'Customer Zip', category: 'Customer', format: 'fintech' },
  { value: 'PH@MobilePhone', label: 'Mobile Phone', category: 'Customer', format: 'fintech' },
  { value: 'PH@SSN', label: 'SSN', category: 'Customer', format: 'fintech' },
  { value: 'PH@DOB', label: 'Date of Birth', category: 'Customer', format: 'fintech' },
  { value: 'PH@IP', label: 'IP Address', category: 'System', format: 'fintech' },
];

type FormatTab = 'all' | 'standard' | 'fintech';

function getElementBottomPos(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  return { top: rect.bottom, left: rect.left };
}

interface PlaceholderDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (placeholder: string) => void;
  position: { top: number; left: number };
  searchTerm: string;
}

export function PlaceholderDropdown({
  isOpen,
  onClose,
  onSelect,
  position,
  searchTerm
}: PlaceholderDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<FormatTab>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);

  const filteredPlaceholders = useMemo(() => {
    const term = searchTerm.toLowerCase().replace(/^(ph)?@/, '');
    let items = availablePlaceholders;

    if (activeTab === 'standard') items = items.filter(p => p.format === 'standard');
    else if (activeTab === 'fintech') items = items.filter(p => p.format === 'fintech');

    if (term) {
      items = items.filter(p =>
        p.label.toLowerCase().includes(term) ||
        p.value.toLowerCase().includes(term)
      );
    }

    return items;
  }, [searchTerm, activeTab]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, activeTab]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    setAdjustedPos({ top: position.top + 4, left: position.left });
  }, [isOpen, position.top, position.left]);

  useLayoutEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const el = dropdownRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = position.top + 4;
    let left = position.left;

    if (left + rect.width > vw - 8) left = Math.max(8, vw - rect.width - 8);
    if (left < 8) left = 8;

    if (top + rect.height > vh - 8) {
      top = position.top - rect.height - 8;
      if (top < 8) top = 8;
    }

    setAdjustedPos({ top, left });
  }, [isOpen, position.top, position.left]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      if (!dropdownRef.current) return;
      const el = dropdownRef.current;
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = position.top + 4;
      let left = position.left;

      if (left + rect.width > vw - 8) left = Math.max(8, vw - rect.width - 8);
      if (left < 8) left = 8;

      if (top + rect.height > vh - 8) {
        top = position.top - rect.height - 8;
        if (top < 8) top = 8;
      }

      setAdjustedPos({ top, left });
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, position.top, position.left]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => Math.min(prev + 1, filteredPlaceholders.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredPlaceholders[selectedIndex]) {
          onSelect(filteredPlaceholders[selectedIndex].value);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filteredPlaceholders, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    if (dropdownRef.current && isOpen) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const groupedPlaceholders = useMemo(() => {
    return filteredPlaceholders.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {} as Record<string, typeof availablePlaceholders>);
  }, [filteredPlaceholders]);

  if (!isOpen) return null;

  let currentGlobalIndex = 0;

  const dropdown = (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-popover rounded-lg border border-border shadow-lg w-80 max-h-96 flex flex-col"
      style={{
        top: `${adjustedPos.top}px`,
        left: `${adjustedPos.left}px`,
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.08)'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="px-2 pt-2 pb-1 border-b border-border flex-shrink-0">
        <div className="flex gap-1 mb-1.5">
          {(['all', 'standard', 'fintech'] as FormatTab[]).map(tab => (
            <button
              key={tab}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              onMouseDown={(e) => { e.preventDefault(); setActiveTab(tab); }}
            >
              {tab === 'all' ? 'All' : tab === 'standard' ? '@ Standard' : 'PH@ FinTech'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto flex-1 p-1.5">
        {Object.keys(groupedPlaceholders).length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No placeholders found
          </div>
        ) : (
          Object.entries(groupedPlaceholders).map(([category, items]) => (
            <div key={category} className="mb-1.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              {items.map((placeholder) => {
                const itemIndex = currentGlobalIndex++;
                return (
                  <div
                    key={placeholder.value}
                    data-index={itemIndex}
                    className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      itemIndex === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => { onSelect(placeholder.value); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                  >
                    <div className="flex flex-col gap-0 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{placeholder.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate">{placeholder.value}</span>
                    </div>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      placeholder.format === 'fintech'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {placeholder.format === 'fintech' ? 'PH@' : '@'}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground bg-muted/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border bg-background px-1 font-mono text-[9px]">@</kbd>
            Trigger
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border bg-background px-1 font-mono text-[9px]">&uarr;&darr;</kbd>
            Nav
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border bg-background px-1 font-mono text-[9px]">&crarr;</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border bg-background px-1 font-mono text-[9px]">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dropdown, document.body);
}

interface UsePlaceholderTriggerOptions {
  onInsert: (placeholder: string, cursorPosition: number) => void;
}

export function usePlaceholderTrigger(options: UsePlaceholderTriggerOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const inputElementRef = useRef<HTMLElement | null>(null);
  const savedCursorPosRef = useRef<number>(0);
  const isOpenRef = useRef(false);

  const openDropdown = useCallback((pos: { top: number; left: number }, term: string, cursorPos: number) => {
    isOpenRef.current = true;
    setPosition(pos);
    setSearchTerm(term);
    setIsOpen(true);
    savedCursorPosRef.current = cursorPos;
  }, []);

  const closeDropdown = useCallback(() => {
    isOpenRef.current = false;
    setIsOpen(false);
    setSearchTerm('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement) => {
    inputElementRef.current = inputElement;
    const currentlyOpen = isOpenRef.current;

    // Only handle keys when dropdown is actually open
    if (!currentlyOpen) {
      // Only trigger dropdown on @ key
      if (e.key === '@') {
        let cursorPos = 0;
        if ('selectionStart' in inputElement && typeof inputElement.selectionStart === 'number') {
          cursorPos = inputElement.selectionStart;
        } else {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(inputElement);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            cursorPos = preCaretRange.toString().length;
          }
        }
        const pos = getElementBottomPos(inputElement);
        openDropdown(pos, '@', cursorPos);
      }
      return; // Don't interfere with other keys when dropdown is closed
    }

    // Dropdown is open - handle navigation and search
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
      return; // Let dropdown handle these
    }

    let cursorPos = 0;
    let text = '';

    if ('selectionStart' in inputElement && typeof inputElement.selectionStart === 'number') {
      cursorPos = inputElement.selectionStart;
      text = 'value' in inputElement && typeof inputElement.value === 'string' ? inputElement.value : '';
    } else {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(inputElement);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorPos = preCaretRange.toString().length;
      }
      text = inputElement.textContent || '';
    }

    if (e.key === 'Backspace') {
      const textBeforeCursor = text.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      const lastPhAtIndex = textBeforeCursor.lastIndexOf('PH@');
      const actualTriggerPos = Math.max(lastAtIndex, lastPhAtIndex);

      if (cursorPos <= actualTriggerPos + 1) {
        closeDropdown();
      } else {
        setSearchTerm(text.substring(actualTriggerPos, cursorPos - 1));
      }
    } else if (e.key === ' ') {
      // Close dropdown on space when it's open
      closeDropdown();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const textBeforeCursor = text.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      const lastPhAtIndex = textBeforeCursor.lastIndexOf('PH@');
      const actualTriggerPos = Math.max(lastAtIndex, lastPhAtIndex);

      if (actualTriggerPos >= 0) {
        setSearchTerm(text.substring(actualTriggerPos, cursorPos) + e.key);
      }
    }
  }, [openDropdown, closeDropdown]);

  const handleInput = useCallback((inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement) => {
    inputElementRef.current = inputElement;

    let cursorPos = 0;
    let text = '';

    if ('selectionStart' in inputElement && typeof inputElement.selectionStart === 'number') {
      cursorPos = inputElement.selectionStart;
      text = 'value' in inputElement && typeof inputElement.value === 'string' ? inputElement.value : '';
    } else {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(inputElement);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorPos = preCaretRange.toString().length;
      }
      text = inputElement.textContent || '';
    }

    const charBefore = cursorPos > 0 ? text[cursorPos - 1] : '';

    if (charBefore === '@' && !isOpenRef.current) {
      const pos = getElementBottomPos(inputElement);
      openDropdown(pos, '@', cursorPos - 1);
      return;
    }

    if (isOpenRef.current) {
      const textBeforeCursor = text.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      const lastPhAtIndex = textBeforeCursor.lastIndexOf('PH@');
      const actualTriggerPos = Math.max(lastAtIndex, lastPhAtIndex);

      if (actualTriggerPos < 0) {
        closeDropdown();
      } else {
        const term = text.substring(actualTriggerPos, cursorPos);
        if (term.includes(' ')) {
          closeDropdown();
        } else {
          setSearchTerm(term);
        }
      }
    }
  }, [openDropdown, closeDropdown]);

  const handleSelect = useCallback((placeholder: string) => {
    if (inputElementRef.current) {
      let text = '';

      if ('value' in inputElementRef.current && typeof inputElementRef.current.value === 'string') {
        text = inputElementRef.current.value;
      } else {
        text = inputElementRef.current.textContent || '';
      }

      const textBeforeCursor = text.substring(0, savedCursorPosRef.current + searchTerm.length);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      const lastPhAtIndex = textBeforeCursor.lastIndexOf('PH@');
      const actualTriggerPos = Math.max(lastAtIndex, lastPhAtIndex);

      options.onInsert(placeholder, actualTriggerPos >= 0 ? actualTriggerPos : savedCursorPosRef.current);
    }

    closeDropdown();
  }, [options, searchTerm, closeDropdown]);

  return {
    isOpen,
    position,
    searchTerm,
    handleKeyDown,
    handleInput,
    handleSelect,
    close: closeDropdown,
  };
}

export function insertPlaceholderIntoText(
  text: string,
  placeholder: string,
  position: number
): string {
  let atPosition = position;

  for (let i = position; i >= 0; i--) {
    if (text.substring(i, i + 3) === 'PH@') {
      atPosition = i;
      break;
    } else if (text[i] === '@') {
      atPosition = i;
      break;
    }
  }

  let endPosition = position;
  for (let i = position; i < text.length; i++) {
    if (text[i] === ' ' || text[i] === '\n') {
      endPosition = i;
      break;
    }
    endPosition = i + 1;
  }

  const before = text.substring(0, atPosition);
  const after = text.substring(endPosition);

  return before + placeholder + ' ' + after;
}
