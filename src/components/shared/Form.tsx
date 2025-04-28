import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface FormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({
  title,
  onSubmit,
  onClose,
  loading,
  error,
  children
}) => {
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}
        
        {children}
        
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  error?: string;
}> = ({ label, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-1">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);

export const FormRow: React.FC<{
  children: React.ReactNode;
  cols?: number;
}> = ({ children, cols = 2 }) => (
  <div className={`grid grid-cols-${cols} gap-4`}>
    {children}
  </div>
);