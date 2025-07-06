import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import React, { JSX } from 'react';
import { createPortal } from 'react-dom';

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
  const [buttonRef, setButtonRef] = React.useState<HTMLButtonElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState({ left: 0, top: 0, width: 0 });

  React.useEffect(() => {
    const updatePosition = () => {
      if (buttonRef) {
        const rect = buttonRef.getBoundingClientRect();
        setDropdownPosition({
          left: rect.left,
          top: rect.bottom + 8,
          width: rect.width,
        });
      }
    };

    if (buttonRef) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [buttonRef]);

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button
              ref={setButtonRef}
              className="w-full bg-gray-900/80 text-white border border-[#6DAEDB]/30 rounded-xl p-4 flex justify-between items-center hover:border-[#6DAEDB]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent"
            >
              <span className="flex items-center gap-3">
                {selected?.icon}
                <span className="font-medium">{selected?.label || placeholder}</span>
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#6DAEDB] transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </Listbox.Button>
          </div>

          {open &&
            buttonRef &&
            createPortal(
              <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm">
                <div
                  className="absolute bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-[#6DAEDB]/20 rounded-xl shadow-2xl text-white max-h-60 overflow-y-auto"
                  style={{
                    left: dropdownPosition.left,
                    top: dropdownPosition.top,
                    width: dropdownPosition.width,
                    maxHeight: Math.min(240, window.innerHeight - dropdownPosition.top - 20),
                  }}
                >
                  <Listbox.Options static className="outline-none">
                    {options.map(option => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        className={({ active }) =>
                          `px-4 py-3 cursor-pointer flex items-center gap-3 transition-all ${
                            active
                              ? 'bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20'
                              : 'hover:bg-gray-700/50'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className="text-[#6DAEDB]">{option.icon}</span>
                            <span className="font-medium">{option.label}</span>
                            {selected && <Check className="ml-auto w-5 h-5 text-[#6DAEDB]" />}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </div>,
              document.body
            )}
        </>
      )}
    </Listbox>
  );
};

export default MoodSelect;