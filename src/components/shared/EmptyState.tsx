import React from 'react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-300">
    {message}
  </div>
);