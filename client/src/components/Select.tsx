import React from "react";
import { ChevronDown } from "lucide-react";

interface Option<T> {
  value: T;
  label: string;
}

interface SelectProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  className?: string;
  name?: string;
  id?: string;
}

const Select = <T extends string | number>({
  value,
  onChange,
  options,
  className = "",
  name,
  id,
}: SelectProps<T>) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        name={name}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none bg-gray-700 text-white px-4 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none"
      />
    </div>
  );
};

export default Select;
