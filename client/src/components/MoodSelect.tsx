import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import React, { JSX } from 'react';

export interface MoodOption {
  value: string;
  label: string;
  icon: JSX.Element;
}

interface MoodSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: MoodOption[];
  placeholder: string;
}

const MoodSelect: React.FC<MoodSelectProps> = ({ value, onChange, options, placeholder }) => {
  const selected = options.find(opt => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="w-full bg-[#111] text-white border border-[#2a3b47] rounded-lg p-2 flex justify-between items-center">
          <span className="flex items-center gap-2">
            {selected?.icon}
            {selected?.label || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Listbox.Button>

        <Listbox.Options className="absolute z-10 mt-1 w-full bg-[#1a1a1a] border border-[#2a3b47] rounded-lg shadow-lg text-white max-h-60 overflow-y-auto">
          {options.map(option => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ active }) =>
                `px-4 py-2 cursor-pointer flex items-center gap-2 ${active ? 'bg-[#2a3b47]' : ''}`
              }
            >
              {({ selected }) => (
                <>
                  {option.icon}
                  <span>{option.label}</span>
                  {selected && <Check className="ml-auto w-4 h-4 text-[#6DAEDB]" />}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default MoodSelect;
