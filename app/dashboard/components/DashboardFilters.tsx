"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MESES } from "@/lib/types";

type DashboardFiltersProps = {
  mes: number;
  año: number;
  searchTerm: string;
  onMesChange: (mes: number) => void;
  onAñoChange: (año: number) => void;
  onSearchChange: (value: string) => void;
};

export function DashboardFilters({
  mes,
  año,
  searchTerm,
  onMesChange,
  onAñoChange,
  onSearchChange,
}: DashboardFiltersProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg">
          <Search className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🔍 Filtros y Búsqueda
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Selecciona el período y busca por UUID, RFC, nombre o concepto
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Mes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="text-sm">📅</span>
            Mes
          </label>

          <div className="relative h-10 group">
            <select
              value={mes}
              onChange={(e) => onMesChange(Number(e.target.value))}
              className="w-full h-full text-sm border-2 border-blue-300
                         focus:border-blue-500 focus:ring-3 focus:ring-blue-200
                         bg-white shadow-md hover:shadow-lg transition-all duration-200
                         rounded-md px-3 pr-10 appearance-none cursor-pointer"
            >
              {MESES.map((mesNombre, index) => (
                <option key={index} value={index + 1}>
                  {mesNombre}
                </option>
              ))}
            </select>

            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
                         h-4 w-4 text-blue-600 group-focus-within:text-blue-700 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Año */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="text-sm">📆</span>
            Año
          </label>

          <Input
            type="number"
            value={año}
            min={2020}
            max={2030}
            onChange={(e) => onAñoChange(Number(e.target.value))}
            className="h-10 text-sm border-2 border-blue-300
                       focus:border-blue-500 focus:ring-3 focus:ring-blue-200
                       bg-white shadow-md hover:shadow-lg transition-all duration-200"
          />
        </div>

        {/* Búsqueda */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="text-sm">🔎</span>
            Búsqueda
          </label>

          <div className="relative h-10 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4
                              text-blue-600 group-focus-within:text-blue-700 transition-colors"
            />

            <Input
              type="text"
              placeholder="UUID, RFC, nombre, concepto..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-3 h-full text-sm border-2 border-blue-300
                         focus:border-blue-500 focus:ring-3 focus:ring-blue-200
                         bg-white shadow-md hover:shadow-lg transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
