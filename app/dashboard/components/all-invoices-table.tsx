'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { AllInvoicesTableProps } from '@/lib/types';
import { calculatePaginationState } from '@/lib/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

const PAGE_SIZE = 6;

export function AllInvoicesTable({ facturas }: AllInvoicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const previousFacturasLengthRef = useRef(facturas.length);

  // Resetear a la primera página cuando cambian las facturas
  useEffect(() => {
    if (previousFacturasLengthRef.current !== facturas.length) {
      previousFacturasLengthRef.current = facturas.length;
      setCurrentPage(1);
    }
  }, [facturas.length]);

  // Calcular paginación
  const pagination = useMemo(
    () => calculatePaginationState(currentPage, PAGE_SIZE, facturas.length),
    [currentPage, facturas.length]
  );

  // Obtener facturas de la página actual
  const paginatedFacturas = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return facturas.slice(startIndex, endIndex);
  }, [facturas, currentPage]);

  if (facturas.length === 0) {
    return null;
  }

  const tipoColors = {
    PUE: 'bg-green-100 text-green-700',
    PPD: 'bg-yellow-100 text-yellow-700',
    COMPLEMENTO_PAGO: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4 border-b-2 border-blue-200 bg-blue-50">
        <h2 className="text-xl font-bold text-blue-900">
          Todas las Facturas ({facturas.length})
        </h2>
        <p className="text-sm text-blue-700 mt-1">
          Facturas, complementos de pago y documentos relacionados del período seleccionado
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">
                UUID
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">
                Fecha
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">
                Tipo
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-blue-900">
                Total
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">
                Emisor
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">
                Receptor
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">
                Validación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {paginatedFacturas.map((factura) => {
              // Para complementos de pago, mostrar información adicional
              const esComplemento = factura.tipo === 'COMPLEMENTO_PAGO';
              const uuidRelacionado = factura.complementoPago?.uuidRelacionado;

              return (
                <tr
                  key={factura.uuid}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-gray-600">
                      {factura.uuid.substring(0, 8)}...
                    </p>
                    {esComplemento && uuidRelacionado && (
                      <p className="text-xs text-blue-600 mt-1">
                        Relacionado: {uuidRelacionado.substring(0, 8)}...
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {factura.fecha.toLocaleDateString('es-MX')}
                    {esComplemento && factura.complementoPago && (
                      <p className="text-xs text-gray-500 mt-1">
                        Pago: {factura.complementoPago.fechaPago.toLocaleDateString('es-MX')}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        tipoColors[factura.tipo]
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
                    {esComplemento && factura.complementoPago && (
                      <p className="text-xs text-gray-500 mt-1">
                        Monto: ${factura.complementoPago.monto.toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {factura.nombreEmisor || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">{factura.rfcEmisor}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {factura.nombreReceptor || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">{factura.rfcReceptor}</p>
                  </td>
                  <td className="px-6 py-4">
                    {factura.validacion ? (
                      <div className="flex flex-col gap-1">
                        {factura.validacion.rfcVerificado ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                            <AlertCircle className="h-3 w-3" />
                            Pendiente
                          </span>
                        )}
                        {factura.validacion.advertencias.length > 0 && (
                          <span className="text-xs text-blue-600">
                            {factura.validacion.advertencias.length} advertencia(s)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin validar</span>
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

