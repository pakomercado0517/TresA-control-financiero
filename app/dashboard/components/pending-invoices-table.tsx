'use client';

import type { CFDI } from '@/lib/types';

interface PendingInvoicesTableProps {
  facturasPPD: CFDI[];
}

export function PendingInvoicesTable({
  facturasPPD,
}: PendingInvoicesTableProps) {
  if (facturasPPD.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No hay facturas pendientes por pagar</p>
        <p className="text-gray-500 text-sm mt-2">
          Todas las facturas están pagadas o no hay facturas PPD en este período
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
        <h2 className="text-xl font-bold text-gray-900">
          Facturas Pendientes por Pagar (PPD)
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {facturasPPD.length} factura(s) con pagos parciales o diferidos
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                UUID
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Fecha
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                Pagado
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                Pendiente
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Emisor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {facturasPPD.map((factura) => {
              const totalPagado =
                factura.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
              const pendiente = factura.total - totalPagado;

              return (
                <tr key={factura.uuid} className="hover:bg-gray-50 transition-colors">
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
    </div>
  );
}

