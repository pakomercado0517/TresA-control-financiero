'use client';

import { useState } from 'react';
import { useExpenseStore } from '@/store/expense-store';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, CheckCircle2 } from 'lucide-react';

const manualExpenseSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  monto: z
    .string()
    .min(1, 'El monto es requerido')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'El monto debe ser un número mayor a 0',
    }),
  concepto: z.string().min(1, 'El concepto es requerido'),
});

type ManualExpenseFormData = z.infer<typeof manualExpenseSchema>;

export function ManualExpenseForm() {
  const { addExpenseManual } = useExpenseStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ManualExpenseFormData>({
    resolver: zodResolver(manualExpenseSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      monto: '',
      concepto: '',
    },
  });

  const onSubmit = async (data: ManualExpenseFormData) => {
    try {
      const fecha = new Date(data.fecha);
      const monto = parseFloat(data.monto);

      await addExpenseManual({
        fecha,
        monto,
        concepto: data.concepto,
      });

      setSuccessMessage('Gasto agregado correctamente');
      reset({
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        concepto: '',
      });

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error al agregar gasto manual:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Ingresar Gasto Manual</h2>
      <p className="text-sm text-gray-600 mb-4">
        Si no tienes el XML, puedes ingresar el gasto manualmente
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="fecha"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Fecha
          </label>
          <input
            type="date"
            id="fecha"
            {...register('fecha')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.fecha && (
            <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="monto"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Monto Total
          </label>
          <input
            type="number"
            id="monto"
            step="0.01"
            min="0.01"
            {...register('monto')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0.00"
          />
          {errors.monto && (
            <p className="mt-1 text-sm text-red-600">{errors.monto.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="concepto"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Concepto
          </label>
          <textarea
            id="concepto"
            {...register('concepto')}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Descripción del gasto..."
          />
          {errors.concepto && (
            <p className="mt-1 text-sm text-red-600">{errors.concepto.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Agregando...' : 'Agregar Gasto'}
        </Button>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-green-700 text-sm font-medium">{successMessage}</p>
          </div>
        )}
      </form>
    </div>
  );
}

