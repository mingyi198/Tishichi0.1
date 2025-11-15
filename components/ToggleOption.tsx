
import React from 'react';

interface ToggleOptionProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  selectedValue: T;
  onChange: (value: T) => void;
  name: string; // Unique name for the radio group
}

const ToggleOption = <T extends string>({
  label,
  options,
  selectedValue,
  onChange,
  name,
}: ToggleOptionProps<T>) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-300 text-sm font-bold mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button" // Important for buttons inside a form to not submit
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              transition-colors duration-200 ease-in-out
              ${selectedValue === option.value
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
            `}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToggleOption;
