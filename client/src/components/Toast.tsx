import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const bgColor = type === 'success' ? 'bg-[#6DAEDB]' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div
      className={`fixed top-6 right-6 z-50 ${bgColor} text-black px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2`}
    >
      <Icon size={20} />
      <span className="font-semibold text-sm">{message}</span>
    </div>
  );
};

export default Toast;
