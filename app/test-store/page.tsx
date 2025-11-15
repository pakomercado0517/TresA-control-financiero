'use client';

import { useState } from 'react';
import { useInvoiceStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileX,
  CheckCircle2,
  Trash2,
  FileText,
  Calendar,
} from 'lucide-react';
import type { CFDI } from '@/lib/types';
import { MESES } from '@/lib/types';

export default function TestStorePage() {
  const {
    invoices,
    isLoading,
    error,
    addInvoice,
    removeInvoice,
    clearInvoices,
    getReport,
    getAllReports,
  } = useInvoiceStore();

  const [selectedMes, setSelectedMes] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedAño, setSelectedAño] = useState<number>(
    new Date().getFullYear()
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name.endsWith('.xml') &&
      file.type !== 'application/xml' &&
      file.type !== 'text/xml'
    ) {
      return;
    }

    try {
      await addInvoice(file);
    } catch (err) {
      console.error('Error al agregar factura:', err);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name.endsWith('.xml') &&
      file.type !== 'application/xml' &&
      file.type !== 'text/xml'
    ) {
      return;
    }

    try {
      await addInvoice(file);
    } catch (err) {
      console.error('Error al agregar factura:', err);
    }
  };

  const reporteActual = getReport(selectedMes, selectedAño);
  const todosLosReportes = getAllReports();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Prueba del Store de Facturas</h1>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Facturas</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">PUE</p>
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter((inv) => inv.tipo === 'PUE').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">PPD</p>
          <p className="text-2xl font-bold text-yellow-600">
            {invoices.filter((inv) => inv.tipo === 'PPD').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Complementos</p>
          <p className="text-2xl font-bold text-blue-600">
            {invoices.filter((inv) => inv.tipo === 'COMPLEMENTO_PAGO').length}
          </p>
        </div>
      </div>

      {/* Área de carga */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-primary transition-colors"
      >
        <input
          type="file"
          accept=".xml,application/xml,text/xml"
          onChange={handleFileChange}
          className="hidden"
          id="xml-file-input"
          disabled={isLoading}
        />
        <label
          htmlFor="xml-file-input"
          className="cursor-pointer flex flex-col items-center gap-4"
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-gray-600 mb-2">
              Arrastra archivos XML aquí o haz clic para seleccionar
            </p>
            <Button type="button" variant="outline" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Seleccionar archivos XML'}
            </Button>
          </div>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
          <FileX className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Acciones */}
      {invoices.length > 0 && (
        <div className="mb-6 flex gap-2">
          <Button
            variant="destructive"
            onClick={clearInvoices}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar Todas las Facturas
          </Button>
        </div>
      )}

      {/* Filtros para reporte */}
      {invoices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Reporte
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(parseInt(e.target.value, 10))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {MESES.map((mes, index) => (
                  <option key={index} value={index + 1}>
                    {mes}
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
                value={selectedAño}
                onChange={(e) =>
                  setSelectedAño(parseInt(e.target.value, 10))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="2020"
                max="2030"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reporte actual */}
      {reporteActual && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            Reporte: {MESES[selectedMes - 1]} {selectedAño}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Facturado</p>
              <p className="text-2xl font-bold text-blue-600">
                ${reporteActual.totalFacturado.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                ${reporteActual.totalPagado.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Compras</p>
              <p className="text-2xl font-bold">
                ${reporteActual.totalCompras.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendiente por Pagar</p>
              <p className="text-2xl font-bold text-red-600">
                ${reporteActual.pendientePagar.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de facturas */}
      {invoices.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Facturas ({invoices.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">UUID</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-left p-2">Emisor</th>
                  <th className="text-left p-2">Mes/Año</th>
                  <th className="text-center p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.uuid}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-2 font-mono text-xs">
                      {invoice.uuid.substring(0, 8)}...
                    </td>
                    <td className="p-2">
                      {invoice.fecha.toLocaleDateString('es-MX')}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          invoice.tipo === 'PUE'
                            ? 'bg-green-100 text-green-700'
                            : invoice.tipo === 'PPD'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {invoice.tipo}
                      </span>
                    </td>
                    <td className="p-2 text-right font-semibold">
                      ${invoice.total.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-xs">
                      {invoice.nombreEmisor || 'N/A'}
                    </td>
                    <td className="p-2">
                      {invoice.mes}/{invoice.año}
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoice(invoice.uuid)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No hay facturas cargadas. Sube archivos XML para comenzar.
          </p>
        </div>
      )}

      {/* Todos los reportes */}
      {todosLosReportes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Todos los Reportes</h2>
          <div className="space-y-2">
            {todosLosReportes.map((reporte) => (
              <div
                key={`${reporte.año}-${reporte.mes}`}
                className="border border-gray-200 rounded p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {MESES[reporte.mes - 1]} {reporte.año}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reporte.facturas.length} factura(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Facturado</p>
                    <p className="font-semibold">
                      ${reporte.totalFacturado.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Pagado</p>
                    <p className="font-semibold text-green-600">
                      ${reporte.totalPagado.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Pendiente</p>
                    <p className="font-semibold text-red-600">
                      ${reporte.pendientePagar.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

