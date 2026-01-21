
import React from 'react';

interface StatusMessageProps {
  message: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  if (!message) return null;

  const isError = message.toLowerCase().startsWith('erreur');

  return (
    <p className={`text-center text-sm font-medium p-2 rounded-md ${isError ? 'text-red-700 bg-red-100' : 'text-slate-600 bg-slate-100'}`}>
      {message}
    </p>
  );
};

export default StatusMessage;
