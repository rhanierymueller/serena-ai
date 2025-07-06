import React from 'react';
import { ChevronDown } from 'lucide-react';

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
  className = '',
  name,
  id,
}: SelectProps<T>) => {
  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="appearance-none bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white px-3 py-2.5 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300 w-full"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6DAEDB] pointer-events-none"
      />
    </div>
  );
};

export default Select;