import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ 
  title, 
  onClose, 
  children,
  maxWidth = '2xl'
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className={`bg-gray-800 rounded-xl w-full ${maxWidthClasses[maxWidth]}`}>
      <div className="flex justify-between items-center p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);