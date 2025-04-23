import React from 'react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
    {message}
  </div>
);