'use client';

import { useState, useRef } from 'react';
import { useInvoiceStore } from '@/store/invoice-store';
import { useExpenseStore } from '@/store/expense-store';
import { Button } from '@/components/ui/button';
import { Download, Upload as UploadIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportAllData, importData } from '@/lib/utils/data-export';

export function DataExportActions() {
  const { invoices, clearInvoices, importInvoices } = useInvoiceStore();
  const { gastos, clearExpenses, importExpenses } = useExpenseStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAllData(invoices, gastos);
      setMessage({
        type: 'success',
        text: 'Datos exportados correctamente',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al exportar datos',
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const { invoices: importedInvoices, expenses: importedExpenses } = await importData(file);

      // Confirmar antes de reemplazar
      const confirmMessage = `¿Deseas reemplazar todos los datos actuales con los del archivo?\n\nIngresos: ${importedInvoices.length}\nGastos: ${importedExpenses.length}`;
      
      if (!confirm(confirmMessage)) {
        setIsImporting(false);
        return;
      }

      // Limpiar datos actuales
      clearInvoices();
      clearExpenses();

      // Agregar nuevos datos
      importInvoices(importedInvoices);
      importExpenses(importedExpenses);

      setMessage({
        type: 'success',
        text: `Datos importados correctamente: ${importedInvoices.length} ingresos, ${importedExpenses.length} gastos`,
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al importar datos',
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
        id="import-data-input"
        disabled={isImporting}
      />
      <label htmlFor="import-data-input">
        <Button
          variant="outline"
          size="sm"
          disabled={isImporting}
          className="flex items-center gap-2"
        >
          <UploadIcon className="h-4 w-4" />
          Importar
        </Button>
      </label>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting || (invoices.length === 0 && gastos.length === 0)}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar
      </Button>

      {message && (
        <div
          className={`fixed top-20 right-4 z-50 p-3 rounded-lg shadow-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          )}
          <p
            className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}

