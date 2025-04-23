import { useState, useCallback } from 'react';

export function useDebugLogs() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs };
}