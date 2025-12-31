'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Gasto } from '@/lib/types';
import { calculatePaginationState } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';

interface ExpensesTableProps {
  gastos: Gasto[];
}

const PAGE_SIZE = 6;

export function ExpensesTable({ gastos }: ExpensesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const previousGastosLengthRef = useRef(gastos.length);

  useEffect(() => {
    if (previousGastosLengthRef.current !== gastos.length) {
      previousGastosLengthRef.current = gastos.length;
      setCurrentPage(1);
    }
  }, [gastos.length]);

  const pagination = useMemo(
    () => calculatePaginationState(currentPage, PAGE_SIZE, gastos.length),
    [currentPage, gastos.length]
  );

  const paginatedGastos = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return gastos.slice(startIndex, endIndex);
  }, [gastos, currentPage]);

  if (gastos.length === 0) {
    return (
      <div className="bg-white border-2 border-purple-200 rounded-lg p-8 text-center mb-6">
        <p className="text-gray-600">No hay gastos registrados</p>
        <p className="text-gray-500 text-sm mt-2">
          Los gastos del período seleccionado aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-purple-300 rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4 border-b-2 border-purple-200 bg-purple-50">
        <h2 className="text-xl font-bold text-purple-900">
          Gastos ({gastos.length})
        </h2>
        <p className="text-sm text-purple-700 mt-1">
          Gastos y compras del período seleccionado
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-100">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-purple-900">
                Origen
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-purple-900">
                Fecha
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-purple-900">
                Total
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-purple-900">
                Concepto
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-purple-900">
                Proveedor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {paginatedGastos.map((gasto) => {
              const montoTotal = gasto.tipoOrigen === 'MANUAL' ? gasto.monto : gasto.total;

              return (
                <tr key={gasto.id} className="hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        gasto.tipoOrigen === 'XML'
                          ? 'bg-purple-200 text-purple-800'
                          : 'bg-purple-300 text-purple-900'
                      }`}
                    >
                      {gasto.tipoOrigen === 'XML' ? 'XML' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {gasto.fecha.toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-purple-900">
                      ${montoTotal.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{gasto.concepto || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {gasto.tipoOrigen === 'XML' && 'rfcEmisor' in gasto ? (
                      <>
                        <p className="text-sm text-gray-900">
                          {gasto.nombreEmisor || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">{gasto.rfcEmisor}</p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination pagination={pagination} onPageChange={setCurrentPage} />
    </div>
  );
}

