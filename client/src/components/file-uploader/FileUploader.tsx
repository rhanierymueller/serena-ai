import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  placeholder?: string;
  currentFile?: File | null;
  error?: string;
  isLoading?: boolean;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxSizeInMB = 5,
  placeholder = 'Clique ou arraste um arquivo',
  currentFile,
  error,
  isLoading = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {

    if (file.size > maxSizeInMB * 1024 * 1024) {
      onFileSelect(null);
      return;
    }
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!isValidType) {
      onFileSelect(null);
      return;
    }

    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return Image;
    }
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${
            dragActive
              ? 'border-[#6DAEDB] bg-[#6DAEDB]/10'
              : 'border-white/20 hover:border-white/40'
          }
          ${error ? 'border-red-400' : ''}
          ${currentFile ? 'border-green-400' : ''}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isLoading ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          disabled={isLoading}
        />

        {currentFile ? (
          <div className="flex items-center justify-center gap-3">
            {(() => {
              const FileIcon = getFileIcon(currentFile);
              return <FileIcon className="h-8 w-8 text-green-400" />;
            })()}
            <div className="text-left">
              <p className="text-white font-medium">{currentFile.name}</p>
              <p className="text-gray-400 text-sm">{formatFileSize(currentFile.size)}</p>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                handleRemove();
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-300">{placeholder}</p>
            <p className="text-gray-500 text-sm">
              Máximo {maxSizeInMB}MB • {acceptedTypes.join(', ')}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6DAEDB]"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {currentFile && !error && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle className="h-4 w-4" />
          Arquivo selecionado com sucesso
        </div>
      )}
    </div>
  );
};

export default FileUploader;