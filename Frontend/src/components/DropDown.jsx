import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const Dropdown = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select an option",
  disabled = false,
  icon: Icon,
  className = "",
  size = "medium", // small, medium, large
  /** dark: matches admin dark inputs; list uses solid emerald like primary buttons */
  variant = "light",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-3 text-base",
    large: "px-5 py-4 text-lg"
  };

  const isDark = variant === "dark";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between 
          focus:ring-2 focus:ring-emerald-500 focus:outline-none
          transition-all
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
          ${isDark
            ? 'border border-gray-700 rounded-lg bg-gray-900 hover:border-emerald-600/80 text-white'
            : 'border border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-emerald-500'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          <span className={value ? (isDark ? "text-white font-medium" : "text-gray-900 font-medium") : "text-gray-400"}>
            {selectedLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-400"} transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="py-2 max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  disabled={opt.disabled}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm transition-all
                    ${isDark
                      ? value === opt.value
                        ? "bg-emerald-500 text-white font-medium"
                        : "text-gray-800 hover:bg-emerald-500 hover:text-white"
                      : value === opt.value
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                    ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;