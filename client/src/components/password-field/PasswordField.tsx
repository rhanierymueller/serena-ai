import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import FormField from '../form-field/FormField';

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder = '••••••••',
  required = false,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField label={label} icon={Lock} error={error} required={required} className={className}>
      <div className="relative">
        <input
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FormField>
  );
};

export default PasswordField;