import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDropdownProps {
  options: { label: string; value: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    handleClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
          isOpen && "ring-2 ring-blue-500"
        )}
      >
        <span>{options.find((option) => option.value === value)?.label || placeholder}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto bg-white border rounded-md shadow-lg"
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100",
                value === option.value && "bg-gray-200"
              )}
            >
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
