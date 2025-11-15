'use client';

import { useExpenseStore } from '@/store/expense-store';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, FileX, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { Gasto, GastoXML, GastoManual } from '@/lib/types';

export function ExpenseList() {
  const { gastos, removeExpense } = useExpenseStore();

  if (gastos.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No hay gastos cargados aún</p>
        <p className="text-gray-500 text-sm mt-2">
          Sube archivos XML o ingresa gastos manualmente para comenzar
        </p>
      </div>
    );
  }

  const gastosXML = gastos.filter((g): g is GastoXML => g.tipoOrigen === 'XML');
  const gastosManuales = gastos.filter((g): g is GastoManual => g.tipoOrigen === 'MANUAL');

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Gastos Cargados ({gastos.length})
          </h2>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>XML: {gastosXML.length}</span>
            <span>Manual: {gastosManuales.length}</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Origen
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                UUID/ID
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Fecha
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Tipo
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                Monto
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Proveedor/Concepto
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
            {gastos.map((gasto) => (
              <ExpenseRow key={gasto.id} gasto={gasto} onRemove={removeExpense} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ExpenseRowProps {
  gasto: Gasto;
  onRemove: (id: string) => void;
}

function ExpenseRow({ gasto, onRemove }: ExpenseRowProps) {
  if (gasto.tipoOrigen === 'MANUAL') {
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
            Manual
          </span>
        </td>
        <td className="px-6 py-4">
          <p className="font-mono text-xs text-gray-600">{gasto.id.substring(0, 12)}...</p>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {gasto.fecha.toLocaleDateString('es-MX')}
        </td>
        <td className="px-6 py-4">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              gasto.tipo === 'PUE'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {gasto.tipo}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <p className="font-semibold text-gray-900">
            ${gasto.monto.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm text-gray-900">{gasto.concepto}</p>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {gasto.mes}/{gasto.año}
        </td>
        <td className="px-6 py-4">
          <span className="text-xs text-gray-400">-</span>
        </td>
        <td className="px-6 py-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(gasto.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </td>
      </tr>
    );
  }

  // Gasto XML
  const tipoColors = {
    PUE: 'bg-green-100 text-green-700',
    PPD: 'bg-yellow-100 text-yellow-700',
    COMPLEMENTO_PAGO: 'bg-blue-100 text-blue-700',
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
          XML
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="font-mono text-xs text-gray-600">
          {gasto.uuid.substring(0, 8)}...
        </p>
      </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {gasto.fecha.toLocaleDateString('es-MX')}
        </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            tipoColors[gasto.tipo]
          }`}
        >
          {gasto.tipo}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">
          ${gasto.total.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-900">{gasto.nombreEmisor || 'N/A'}</p>
        <p className="text-xs text-gray-500">{gasto.rfcEmisor}</p>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {gasto.mes}/{gasto.año}
      </td>
      <td className="px-6 py-4">
        {gasto.validacion ? (
          <div className="flex flex-col gap-1">
            {gasto.validacion.rfcVerificado ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Verificado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                <AlertTriangle className="h-3 w-3" />
                Error RFC
              </span>
            )}
            {gasto.validacion.advertencias.length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 cursor-help"
                title={gasto.validacion.advertencias.join('; ')}
              >
                <Info className="h-3 w-3" />
                {gasto.validacion.advertencias.length} advertencia(s)
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
          onClick={() => onRemove(gasto.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

