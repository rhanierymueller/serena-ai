import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  icon?: LucideIcon;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  icon: Icon,
  error,
  helpText,
  required = false,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-2 text-white mb-3 font-medium">
        {Icon && <Icon className="h-4 w-4 text-[#6DAEDB]" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <span className="text-red-400">⚠️</span>
          {error}
        </p>
      )}

      {helpText && !error && <p className="text-gray-400 text-sm">{helpText}</p>}
    </div>
  );
};

export default FormField;