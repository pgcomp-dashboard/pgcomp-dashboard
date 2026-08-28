import React from 'react';

interface ProgressProps {
  value: number; // Valor do progresso (0 a 100)
  className?: string; // Classe CSS opcional para estilização adicional
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};
