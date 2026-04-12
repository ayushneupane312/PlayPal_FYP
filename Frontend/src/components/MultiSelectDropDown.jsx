import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { RequiredMark } from './RequiredMark';

const MultiSelectDropdown = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  error,
  helperText,
  disabled = false,
  required = false,
  maxSelections,
  searchable = false,
  className = "",
  fullWidth = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter(option => 
        (option.label || option).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Handle option toggle
  const handleToggle = (optionValue) => {
    if (disabled) return;

    const isSelected = value.includes(optionValue);
    let newValue;

    if (isSelected) {
      newValue = value.filter(v => v !== optionValue);
    } else {
      if (maxSelections && value.length >= maxSelections) return;
      newValue = [...value, optionValue];
    }

    onChange && onChange(newValue);
  };

  // Remove selected item
  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange && onChange(newValue);
  };

  // Get label for value
  const getLabel = (val) => {
    const option = options.find(opt => (opt.value || opt) === val);
    return option ? (option.label || option) : val;
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required ? <RequiredMark className="inline ml-1" /> : null}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full bg-white border rounded-xl px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
          transition-all text-left
          ${error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-200 hover:border-gray-300'
          }
          ${disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
            : 'cursor-pointer'
          }
        `}
      >
        {/* Selected Items */}
        <div className="flex flex-wrap gap-2 min-h-[24px] pr-8">
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            value.map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-sm font-medium"
              >
                <span className="truncate max-w-[150px]">{getLabel(val)}</span>
                {!disabled && (
                  <button
                    onClick={(e) => handleRemove(val, e)}
                    className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        {/* Chevron */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${
              error ? 'text-red-400' : 'text-gray-400'
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="relative z-50">
          <div className="absolute top-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search Input */}
            {searchable && (
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto max-h-52 py-2">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const optionValue = option.value || option;
                  const optionLabel = option.label || option;
                  const isSelected = value.includes(optionValue);
                  const isDisabled = option.disabled || (maxSelections && value.length >= maxSelections && !isSelected);

                  return (
                    <button
                      key={index}
                      onClick={() => handleToggle(optionValue)}
                      disabled={isDisabled}
                      className={`
                        w-full px-4 py-2.5 text-left flex items-center justify-between
                        transition-all text-sm
                        ${isSelected 
                          ? 'bg-emerald-50 text-emerald-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className="truncate">{optionLabel}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Max Selections Info */}
            {maxSelections && (
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                  {value.length} / {maxSelections} selected
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper Text / Error Message */}
      {(helperText || error) && (
        <p className={`text-xs mt-2 ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default MultiSelectDropdown;