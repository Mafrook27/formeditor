import React, { useState, useEffect, useCallback, useRef } from 'react';

// Import from data file
const availablePlaceholders = [
  { value: '@CustomerName', label: 'Customer Name', category: 'Customer' },
  { value: '@CustomerEmail', label: 'Customer Email', category: 'Customer' },
  { value: '@CustomerPhone', label: 'Customer Phone', category: 'Customer' },
  { value: '@AccountNumber', label: 'Account Number', category: 'Account' },
  { value: '@AccountType', label: 'Account Type', category: 'Account' },
  { value: '@CurrentDate', label: 'Current Date', category: 'System' },
  { value: '@ExpiryDate', label: 'Expiry Date', category: 'System' },
  { value: '@CompanyName', label: 'Company Name', category: 'Company' },
  { value: '@CompanyAddress', label: 'Company Address', category: 'Company' },
  { value: '@AgentName', label: 'Agent Name', category: 'Agent' },
  { value: '@AgentEmail', label: 'Agent Email', category: 'Agent' },
  // PH@ style placeholders (FinTech format)
  { value: 'PH@FirstName', label: 'First Name', category: 'Customer' },
  { value: 'PH@LastName', label: 'Last Name', category: 'Customer' },
  { value: 'PH@LoanAmount', label: 'Loan Amount', category: 'Loan' },
  { value: 'PH@APR', label: 'APR %', category: 'Loan' },
  { value: 'PH@InterestRate', label: 'Interest Rate', category: 'Loan' },
  { value: 'PH@DateNow', label: 'Date Now', category: 'System' },
  { value: 'PH@PortfolioName', label: 'Portfolio Name', category: 'Company' },
];

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
  const [filteredPlaceholders, setFilteredPlaceholders] = useState(availablePlaceholders);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const term = searchTerm.toLowerCase().replace(/^(ph)?@/, '');
    if (term) {
      const filtered = availablePlaceholders.filter(p => 
        p.label.toLowerCase().includes(term) || 
        p.value.toLowerCase().includes(term)
      );
      setFilteredPlaceholders(filtered);
      setSelectedIndex(0);
    } else {
      setFilteredPlaceholders(availablePlaceholders);
      setSelectedIndex(0);
    }
  }, [searchTerm]);
  
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
  
  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current && isOpen) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, isOpen]);
  
  // Group by category
  const groupedPlaceholders = filteredPlaceholders.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof availablePlaceholders>);
  
  if (!isOpen) return null;
  
  let currentGlobalIndex = 0;
  
  return (
    <div 
      ref={dropdownRef}
      className="fixed z-[100] bg-popover rounded-lg border border-border shadow-lg w-80 max-h-80 overflow-auto"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="p-2">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border mb-2">
          Insert Placeholder
        </div>
        {Object.keys(groupedPlaceholders).length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No placeholders found for "{searchTerm}"
          </div>
        ) : (
          Object.entries(groupedPlaceholders).map(([category, items]) => (
            <div key={category} className="mb-2">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </div>
              {items.map((placeholder) => {
                const itemIndex = currentGlobalIndex++;
                return (
                  <div
                    key={placeholder.value}
                    data-index={itemIndex}
                    className={`flex items-center justify-between gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                      itemIndex === selectedIndex 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      onSelect(placeholder.value);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {placeholder.label}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground truncate">
                        {placeholder.value}
                      </span>
                    </div>
                    {itemIndex === selectedIndex && (
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">↵</span>
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground bg-muted/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

interface UsePlaceholderTriggerOptions {
  onInsert: (placeholder: string, cursorPosition: number) => void;
}

export function usePlaceholderTrigger(options: UsePlaceholderTriggerOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerStart, setTriggerStart] = useState(-1);
  const inputElementRef = useRef<HTMLElement | null>(null);
  const savedCursorPosRef = useRef<number>(0);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent, inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement) => {
    inputElementRef.current = inputElement;
    
    // Don't interfere with dropdown navigation
    if (isOpen && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
      return;
    }
    
    // Get cursor position and text content
    let cursorPos = 0;
    let text = '';
    
    if ('selectionStart' in inputElement && typeof inputElement.selectionStart === 'number') {
      cursorPos = inputElement.selectionStart;
      text = 'value' in inputElement && typeof inputElement.value === 'string' ? inputElement.value : '';
    } else {
      // For contentEditable elements
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
    
    if (e.key === '@') {
      // Calculate position for dropdown
      const rect = inputElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setPosition({ 
        top: rect.bottom + scrollTop + 4, 
        left: rect.left + scrollLeft 
      });
      setIsOpen(true);
      setSearchTerm('@');
      setTriggerStart(cursorPos);
      savedCursorPosRef.current = cursorPos; // Save cursor position
    } else if (isOpen) {
      if (e.key === 'Backspace') {
        // Check if we're deleting the @ symbol
        const textBeforeCursor = text.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const lastPhAtIndex = textBeforeCursor.lastIndexOf('PH@');
        const actualTriggerPos = Math.max(lastAtIndex, lastPhAtIndex);
        
        if (cursorPos <= actualTriggerPos + 1) {
          // Deleting the @ or right after it
          setIsOpen(false);
          setSearchTerm('');
          setTriggerStart(-1);
        } else {
          // Update search term
          const newSearchTerm = text.substring(actualTriggerPos, cursorPos - 1);
          setSearchTerm(newSearchTerm);
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Regular character typed
        const textBeforeCursor = text.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const lastPhAtIndex = textBeforeCursor.lastIndexOf('PH@');
        const actualTriggerPos = Math.max(lastAtIndex, lastPhAtIndex);
        
        if (actualTriggerPos >= 0) {
          const newSearchTerm = text.substring(actualTriggerPos, cursorPos) + e.key;
          setSearchTerm(newSearchTerm);
        }
      } else if (e.key === ' ') {
        // Space closes the dropdown
        setIsOpen(false);
        setSearchTerm('');
        setTriggerStart(-1);
      }
    }
  }, [isOpen]);
  
  const handleSelect = useCallback((placeholder: string) => {
    if (inputElementRef.current) {
      let text = '';
      
      if ('value' in inputElementRef.current && typeof inputElementRef.current.value === 'string') {
        text = inputElementRef.current.value;
      } else {
        // For contentEditable elements
        text = inputElementRef.current.textContent || '';
      }
      
      // Use saved cursor position to find @ symbol
      const textBeforeCursor = text.substring(0, savedCursorPosRef.current + searchTerm.length);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      const lastPhAtIndex = textBeforeCursor.lastIndexOf('PH@');
      const actualTriggerPos = Math.max(lastAtIndex, lastPhAtIndex);
      
      options.onInsert(placeholder, actualTriggerPos >= 0 ? actualTriggerPos : savedCursorPosRef.current);
    }
    
    setIsOpen(false);
    setSearchTerm('');
    setTriggerStart(-1);
  }, [options, searchTerm]);
  
  const close = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
    setTriggerStart(-1);
  }, []);
  
  return {
    isOpen,
    position,
    searchTerm,
    handleKeyDown,
    handleSelect,
    close,
  };
}

// Helper to insert placeholder into text
export function insertPlaceholderIntoText(
  text: string, 
  placeholder: string, 
  position: number
): string {
  // Find the @ or PH@ symbol position to replace it along with any typed characters
  let atPosition = position;
  
  // Look backwards to find @ or PH@
  for (let i = position; i >= 0; i--) {
    if (text.substring(i, i + 3) === 'PH@') {
      atPosition = i;
      break;
    } else if (text[i] === '@') {
      atPosition = i;
      break;
    }
  }
  
  // Find the end of the search term (next space or end of text)
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

