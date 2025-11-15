'use client';

import { useState } from 'react';
import { MESES } from '@/lib/types';

interface FiltersProps {
  onFilterChange: (filtros: {
    mes?: number;
    año?: number;
    tipo?: string;
  }) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [mes, setMes] = useState<number | undefined>(undefined);
  const [año, setAño] = useState<number | undefined>(
    new Date().getFullYear()
  );
  const [tipo, setTipo] = useState<string>('');

  const handleMesChange = (value: string) => {
    const mesValue = value === '' ? undefined : parseInt(value, 10);
    setMes(mesValue);
    onFilterChange({ mes: mesValue, año, tipo: tipo || undefined });
  };

  const handleAñoChange = (value: string) => {
    const añoValue = value === '' ? undefined : parseInt(value, 10);
    setAño(añoValue);
    onFilterChange({ mes, año: añoValue, tipo: tipo || undefined });
  };

  const handleTipoChange = (value: string) => {
    setTipo(value);
    onFilterChange({ mes, año, tipo: value || undefined });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mes
          </label>
          <select
            value={mes || ''}
            onChange={(e) => handleMesChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los meses</option>
            {MESES.map((mesNombre, index) => (
              <option key={index} value={index + 1}>
                {mesNombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año
          </label>
          <input
            type="number"
            value={año || ''}
            onChange={(e) => handleAñoChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: 2024"
            min="2020"
            max="2030"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => handleTipoChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los tipos</option>
            <option value="PUE">PUE</option>
            <option value="PPD">PPD</option>
            <option value="COMPLEMENTO_PAGO">Complemento de Pago</option>
          </select>
        </div>
      </div>
    </div>
  );
}

