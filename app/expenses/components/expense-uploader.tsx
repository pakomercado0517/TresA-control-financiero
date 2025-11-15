'use client';

import { useState, useCallback } from 'react';
import { useExpenseStore } from '@/store/expense-store';
import { useProfileGuard } from '@/lib/hooks/use-profile-guard';
import { Button } from '@/components/ui/button';
import { Upload, FileX, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ExpenseUploader() {
  const { addExpenseXML, isLoading, error } = useExpenseStore();
  const { canUpload } = useProfileGuard();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;

      if (!files || files.length === 0) {
        return;
      }

      // Verificar si se puede cargar
      if (!canUpload) {
        toast.error(
          'Debes configurar tu perfil antes de cargar gastos. Ve a Configuración para configurar tu RFC.'
        );
        event.target.value = '';
        return;
      }

      setSuccessMessage(null);

      let successCount = 0;
      let errorCount = 0;
      let warningCount = 0;
      const warnings: string[] = [];

      for (const file of Array.from(files)) {
        if (
          !file.name.endsWith('.xml') &&
          file.type !== 'application/xml' &&
          file.type !== 'text/xml'
        ) {
          errorCount++;
          continue;
        }

        try {
          const result = await addExpenseXML(file);
          successCount++;

          // Verificar si hay advertencias
          if (result.validacion) {
            if (result.validacion.advertencias.length > 0) {
              warningCount++;
              warnings.push(...result.validacion.advertencias);
            }
          }
        } catch (err) {
          errorCount++;
          const errorMsg =
            err instanceof Error ? err.message : 'Error desconocido';
          toast.error(`Error en ${file.name}: ${errorMsg}`);
          console.error('Error al procesar archivo:', file.name, err);
        }
      }

      if (successCount > 0) {
        setSuccessMessage(
          `${successCount} gasto(s) cargado(s) correctamente${
            errorCount > 0 ? `. ${errorCount} error(es)` : ''
          }`
        );
        toast.success(`${successCount} gasto(s) cargado(s)`);
      }

      if (warningCount > 0) {
        warnings.forEach((warning) => {
          toast.warning(warning, { duration: 5000 });
        });
      }

      event.target.value = '';
    },
    [addExpenseXML, canUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;

      if (!files || files.length === 0) {
        return;
      }

      // Verificar si se puede cargar
      if (!canUpload) {
        toast.error(
          'Debes configurar tu perfil antes de cargar gastos. Ve a Configuración para configurar tu RFC.'
        );
        return;
      }

      setSuccessMessage(null);

      let successCount = 0;
      let errorCount = 0;
      let warningCount = 0;
      const warnings: string[] = [];

      for (const file of Array.from(files)) {
        if (
          !file.name.endsWith('.xml') &&
          file.type !== 'application/xml' &&
          file.type !== 'text/xml'
        ) {
          errorCount++;
          continue;
        }

        try {
          const result = await addExpenseXML(file);
          successCount++;

          // Verificar si hay advertencias
          if (result.validacion) {
            if (result.validacion.advertencias.length > 0) {
              warningCount++;
              warnings.push(...result.validacion.advertencias);
            }
          }
        } catch (err) {
          errorCount++;
          const errorMsg =
            err instanceof Error ? err.message : 'Error desconocido';
          toast.error(`Error en ${file.name}: ${errorMsg}`);
          console.error('Error al procesar archivo:', file.name, err);
        }
      }

      if (successCount > 0) {
        setSuccessMessage(
          `${successCount} gasto(s) cargado(s) correctamente${
            errorCount > 0 ? `. ${errorCount} error(es)` : ''
          }`
        );
        toast.success(`${successCount} gasto(s) cargado(s)`);
      }

      if (warningCount > 0) {
        warnings.forEach((warning) => {
          toast.warning(warning, { duration: 5000 });
        });
      }
    },
    [addExpenseXML, canUpload]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Cargar XML de Gastos</h2>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
      >
        <input
          type="file"
          accept=".xml,application/xml,text/xml"
          onChange={handleFileChange}
          className="hidden"
          id="expense-xml-file-input"
          disabled={isLoading || !canUpload}
          multiple
        />
        <label
          htmlFor="expense-xml-file-input"
          className={canUpload ? 'cursor-pointer flex flex-col items-center gap-4' : 'cursor-not-allowed flex flex-col items-center gap-4 opacity-50'}
        >
          <Upload className={canUpload ? 'h-12 w-12 text-gray-400' : 'h-12 w-12 text-gray-300'} />
          <div>
            <p className={`text-sm font-medium mb-2 ${canUpload ? 'text-gray-700' : 'text-gray-400'}`}>
              Arrastra facturas XML aquí o haz clic para seleccionar
            </p>
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading || !canUpload} 
              size="sm"
            >
              {isLoading ? 'Procesando...' : !canUpload ? 'Configura tu perfil primero' : 'Seleccionar archivos XML'}
            </Button>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <FileX className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-green-700 text-sm font-medium">{successMessage}</p>
        </div>
      )}
    </div>
  );
}

