'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { CFDI } from '@/lib/types';
import { calculatePaginationState } from '@/lib/types';
import {
  calcularTotalPagadoPPD,
  obtenerComplementosRelacionados,
} from '@/lib/utils/invoice-payment-status';
import { Pagination } from '@/components/ui/pagination';
import { Receipt } from 'lucide-react';

interface PaidInvoicesTableProps {
  facturasPagadas: CFDI[];
  todasLasFacturas: CFDI[]; // Para calcular total pagado de PPD
}

const PAGE_SIZE = 6;

export function PaidInvoicesTable({
  facturasPagadas,
  todasLasFacturas,
}: PaidInvoicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const previousFacturasLengthRef = useRef(facturasPagadas.length);

  useEffect(() => {
    if (previousFacturasLengthRef.current !== facturasPagadas.length) {
      previousFacturasLengthRef.current = facturasPagadas.length;
      setCurrentPage(1);
    }
  }, [facturasPagadas.length]);

  const pagination = useMemo(
    () => calculatePaginationState(currentPage, PAGE_SIZE, facturasPagadas.length),
    [currentPage, facturasPagadas.length]
  );

  const paginatedFacturas = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return facturasPagadas.slice(startIndex, endIndex);
  }, [facturasPagadas, currentPage]);

  if (facturasPagadas.length === 0) {
    return (
      <div className="bg-white border-2 border-green-200 rounded-lg p-8 text-center mb-6">
        <p className="text-gray-600">No hay facturas pagadas</p>
        <p className="text-gray-500 text-sm mt-2">
          Las facturas pagadas aparecerán aquí cuando estén completamente pagadas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-green-300 rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4 border-b-2 border-green-200 bg-green-50">
        <h2 className="text-xl font-bold text-green-900">
          Facturas Pagadas ({facturasPagadas.length})
        </h2>
        <p className="text-sm text-green-700 mt-1">
          Facturas PUE y PPD completamente pagadas del período seleccionado
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-100">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-green-900">
                UUID
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-green-900">
                Fecha
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-green-900">
                Tipo
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-green-900">
                Total
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-green-900">
                Pagado
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-green-900">
                Emisor
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-green-900">
                Complementos de Pago
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-100">
            {paginatedFacturas.map((factura) => {
              const esPPD = factura.tipo === 'PPD';
              const totalPagado = esPPD
                ? calcularTotalPagadoPPD(factura, todasLasFacturas)
                : factura.total;
              const complementos = esPPD
                ? obtenerComplementosRelacionados(factura, todasLasFacturas)
                : [];

              return (
                <>
                  <tr key={factura.uuid} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs text-gray-600">
                        {factura.uuid.substring(0, 8)}...
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {factura.fecha.toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          factura.tipo === 'PUE'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-green-300 text-green-900'
                        }`}
                      >
                        {factura.tipo}
                      </span>
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
                      <p className="text-green-700 font-bold">
                        ${totalPagado.toLocaleString('es-MX', {
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
                    <td className="px-6 py-4">
                      {esPPD && complementos.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-green-700" />
                          <span className="text-xs font-medium text-green-700">
                            {complementos.length} complemento{complementos.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                  {/* Fila expandida con información de complementos para facturas PPD */}
                  {esPPD && complementos.length > 0 && (
                    <tr className="bg-green-50/50">
                      <td colSpan={7} className="px-6 py-3">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-green-800 mb-2">
                            Complementos de Pago Relacionados:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {complementos.map((complemento) => {
                              const montoComplemento =
                                complemento.complementoPago?.monto || complemento.total;
                              const fechaPago = complemento.complementoPago?.fechaPago;

                              return (
                                <div
                                  key={complemento.uuid}
                                  className="bg-white border border-green-200 rounded-md p-3"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="text-xs font-mono text-gray-600 mb-1">
                                        {complemento.uuid.substring(0, 12)}...
                                      </p>
                                      {fechaPago && (
                                        <p className="text-xs text-gray-600">
                                          Fecha Pago:{' '}
                                          <span className="font-medium">
                                            {fechaPago.toLocaleDateString('es-MX')}
                                          </span>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm font-bold text-green-700">
                                    ${montoComplemento.toLocaleString('es-MX', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                  {complemento.complementoPago?.numParcialidad && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Parcialidad: {complemento.complementoPago.numParcialidad}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination pagination={pagination} onPageChange={setCurrentPage} />
    </div>
  );
}

