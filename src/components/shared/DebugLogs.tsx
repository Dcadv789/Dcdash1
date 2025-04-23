import React from 'react';
import { Terminal } from 'lucide-react';

interface DebugLogsProps {
  logs: string[];
}

export const DebugLogs: React.FC<DebugLogsProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700">
        <Terminal size={16} className="text-gray-400" />
        <h3 className="text-sm font-medium text-gray-300">Logs de execução</h3>
      </div>
      <div className="p-4 space-y-1 max-h-48 overflow-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-sm">
            <span className="text-gray-500">{log.split(': ')[0]}: </span>
            <span className="text-gray-300">{log.split(': ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};