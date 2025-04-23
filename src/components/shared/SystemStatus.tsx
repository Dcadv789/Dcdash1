import React from 'react';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';

interface SystemStatusProps {
  status: {
    database: boolean;
    api: boolean;
    storage: boolean;
  };
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  const allSystemsUp = Object.values(status).every(Boolean);

  return (
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Status do Sistema</span>
      </div>
      
      <div className="space-y-2">
        <StatusItem
          label="Banco de Dados"
          isOnline={status.database}
        />
        <StatusItem
          label="API"
          isOnline={status.api}
        />
        <StatusItem
          label="Storage"
          isOnline={status.storage}
        />
        
        <div className="pt-2 mt-2 border-t border-gray-800">
          <StatusItem
            label="Sistema"
            isOnline={allSystemsUp}
            className="font-medium"
          />
        </div>
      </div>
    </div>
  );
};

interface StatusItemProps {
  label: string;
  isOnline: boolean;
  className?: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, isOnline, className = '' }) => (
  <div className={`flex items-center justify-between ${className}`}>
    <span className="text-sm text-gray-400">{label}</span>
    {isOnline ? (
      <CheckCircle2 size={16} className="text-green-500" />
    ) : (
      <XCircle size={16} className="text-red-500" />
    )}
  </div>
);