'use client';

import { useState, useEffect } from 'react';
import { MESES } from '@/lib/types';

interface DashboardFiltersProps {
  onFilterChange: (mes: number, año: number) => void;
  defaultMes?: number;
  defaultAño?: number;
}

export function DashboardFilters({
  onFilterChange,
  defaultMes,
  defaultAño,
}: DashboardFiltersProps) {
  const [mes, setMes] = useState<number>(
    defaultMes || new Date().getMonth() + 1
  );
  const [año, setAño] = useState<number>(
    defaultAño || new Date().getFullYear()
  );

  useEffect(() => {
    onFilterChange(mes, año);
  }, [mes, año, onFilterChange]);

  const handleMesChange = (value: string) => {
    const mesValue = parseInt(value, 10);
    setMes(mesValue);
  };

  const handleAñoChange = (value: string) => {
    const añoValue = parseInt(value, 10);
    setAño(añoValue);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mes
          </label>
          <select
            value={mes}
            onChange={(e) => handleMesChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {MESES.map((mesNombre, index) => (
              <option key={index} value={index + 1}>
                {mesNombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año
          </label>
          <input
            type="number"
            value={año}
            onChange={(e) => handleAñoChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            min="2020"
            max="2030"
          />
        </div>
      </div>
    </div>
  );
}

