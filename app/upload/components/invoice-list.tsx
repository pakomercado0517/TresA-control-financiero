'use client';

import { useInvoiceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { CFDI } from '@/lib/types';

export function InvoiceList() {
  const { invoices, removeInvoice } = useInvoiceStore();

  if (invoices.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          No hay facturas cargadas aún
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Sube archivos XML para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">
          Facturas Cargadas ({invoices.length})
        </h2>
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
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Tipo
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Emisor
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Mes/Año
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Validación
              </th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <InvoiceRow
                key={invoice.uuid}
                invoice={invoice}
                onRemove={removeInvoice}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface InvoiceRowProps {
  invoice: CFDI;
  onRemove: (uuid: string) => void;
}

function InvoiceRow({ invoice, onRemove }: InvoiceRowProps) {
  const tipoColors = {
    PUE: 'bg-green-100 text-green-700',
    PPD: 'bg-yellow-100 text-yellow-700',
    COMPLEMENTO_PAGO: 'bg-blue-100 text-blue-700',
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <p className="font-mono text-xs text-gray-600">
          {invoice.uuid.substring(0, 8)}...
        </p>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {invoice.fecha.toLocaleDateString('es-MX')}
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            tipoColors[invoice.tipo]
          }`}
        >
          {invoice.tipo}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">
          ${invoice.total.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-900">{invoice.nombreEmisor || 'N/A'}</p>
        <p className="text-xs text-gray-500">{invoice.rfcEmisor}</p>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {invoice.mes}/{invoice.año}
      </td>
      <td className="px-6 py-4">
        {invoice.validacion ? (
          <div className="flex flex-col gap-1">
            {invoice.validacion.rfcVerificado ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Verificado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                <AlertTriangle className="h-3 w-3" />
                Pendiente
              </span>
            )}
            {invoice.validacion.advertencias.length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 cursor-help"
                title={invoice.validacion.advertencias.join('; ')}
              >
                <Info className="h-3 w-3" />
                {invoice.validacion.advertencias.length} advertencia(s)
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">Sin validar</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(invoice.uuid)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

