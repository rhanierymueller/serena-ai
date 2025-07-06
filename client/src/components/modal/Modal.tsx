import React from 'react';

interface ModalProps {
  title: string;
  description: string | React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string | React.ReactNode;
  cancelText?: string | React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  confirmDisabled?: boolean;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

const heightMap = {
  sm: 'max-h-[60vh] sm:max-h-[70vh]',
  md: 'max-h-[70vh] sm:max-h-[80vh]',
  lg: 'max-h-[80vh] sm:max-h-[85vh]',
};

const Modal: React.FC<ModalProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Entendi',
  cancelText = 'Voltar',
  size = 'md',
  confirmDisabled = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-3xl w-full ${sizeMap[size]} ${heightMap[size]} flex flex-col text-white shadow-2xl border border-[#6DAEDB]/20`}
      >
        <div className="p-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-300 dark:scrollbar-thumb-slate-400 dark:scrollbar-track-slate-800">
          <div className="text-sm text-gray-300 leading-relaxed pb-4">{description}</div>
        </div>
        <div className="p-6 pt-4 flex-shrink-0 border-t border-[#6DAEDB]/10">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2C3E50] to-[#34495E] hover:from-[#34495E] hover:to-[#415f73] text-white transition-all duration-300 transform hover:scale-105 border border-white/10 text-sm"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={confirmDisabled ? undefined : onConfirm}
              disabled={confirmDisabled}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform text-sm ${
                confirmDisabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-600'
                  : 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-black hover:scale-105 shadow-lg'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;