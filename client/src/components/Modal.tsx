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
  lg: 'max-w-lg',
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div
        className={`bg-[#1a1a1a] rounded-2xl w-full ${sizeMap[size]} p-6 text-white shadow-lg border border-gray-700`}
      >
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="text-sm text-gray-300 mb-6 leading-relaxed">{description}</div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[#2C3E50] hover:bg-[#34495E] text-white transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={confirmDisabled ? undefined : onConfirm}
            disabled={confirmDisabled}
            className={`px-4 py-2 rounded-xl bg-[#6DAEDB] text-black font-semibold transition-all ${
              confirmDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4F91C3]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
