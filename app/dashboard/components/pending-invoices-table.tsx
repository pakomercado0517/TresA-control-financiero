'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { CFDI } from '@/lib/types';
import { calculatePaginationState } from '@/lib/types';
import { calcularTotalPagadoPPD } from '@/lib/utils/invoice-payment-status';
import { Pagination } from '@/components/ui/pagination';

interface PendingInvoicesTableProps {
  facturasPPD: CFDI[];
  todasLasFacturas: CFDI[]; // Para calcular total pagado
}

const PAGE_SIZE = 6;

export function PendingInvoicesTable({
  facturasPPD,
  todasLasFacturas,
}: PendingInvoicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const previousFacturasLengthRef = useRef(facturasPPD.length);

  useEffect(() => {
    if (previousFacturasLengthRef.current !== facturasPPD.length) {
      previousFacturasLengthRef.current = facturasPPD.length;
      setCurrentPage(1);
    }
  }, [facturasPPD.length]);

  const pagination = useMemo(
    () => calculatePaginationState(currentPage, PAGE_SIZE, facturasPPD.length),
    [currentPage, facturasPPD.length]
  );

  const paginatedFacturas = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return facturasPPD.slice(startIndex, endIndex);
  }, [facturasPPD, currentPage]);

  if (facturasPPD.length === 0) {
    return (
      <div className="bg-white border-2 border-yellow-200 rounded-lg p-8 text-center mb-6">
        <p className="text-gray-600">No hay facturas pendientes por pagar</p>
        <p className="text-gray-500 text-sm mt-2">
          Todas las facturas están pagadas o no hay facturas PPD pendientes en este período
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-yellow-300 rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4 border-b-2 border-yellow-200 bg-yellow-50">
        <h2 className="text-xl font-bold text-yellow-900">
          Facturas Pendientes por Pagar (PPD)
        </h2>
        <p className="text-sm text-yellow-700 mt-1">
          {facturasPPD.length} factura(s) con pagos parciales o diferidos pendientes
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-yellow-100">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-yellow-900">
                UUID
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-yellow-900">
                Fecha
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-yellow-900">
                Total
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-yellow-900">
                Pagado
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-yellow-900">
                Pendiente
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-yellow-900">
                Emisor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-100">
            {paginatedFacturas.map((factura) => {
              const totalPagado = calcularTotalPagadoPPD(factura, todasLasFacturas);
              const pendiente = factura.total - totalPagado;

              return (
                <tr key={factura.uuid} className="hover:bg-yellow-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-gray-600">
                      {factura.uuid.substring(0, 8)}...
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {factura.fecha.toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-gray-900">
                      ${factura.total.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-green-600 font-medium">
                      ${totalPagado.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-red-600 font-bold">
                      ${pendiente.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {factura.nombreEmisor || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">{factura.rfcEmisor}</p>
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

