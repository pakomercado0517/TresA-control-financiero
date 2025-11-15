'use client';

import { useState, useMemo } from 'react';
import { useInvoiceStore } from '@/store/invoice-store';
import { useExpenseStore } from '@/store/expense-store';
import { DashboardFilters } from './dashboard-filters';
import { MetricsCards } from './metrics-cards';
import { PendingInvoicesTable } from './pending-invoices-table';
import { AllInvoicesTable } from './all-invoices-table';
import { ExportPDFButton } from './export-pdf-button';
import { calculateReport } from '@/lib/utils/report-calculator';
import type { Reporte } from '@/lib/types';

export function DashboardView() {
  const { invoices } = useInvoiceStore();
  const { gastos } = useExpenseStore();
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [año, setAño] = useState<number>(new Date().getFullYear());

  const reporte: Reporte | null = useMemo(() => {
    if (invoices.length === 0 && gastos.length === 0) {
      return null;
    }
    return calculateReport(invoices, gastos, mes, año);
  }, [invoices, gastos, mes, año]);

  const handleFilterChange = (nuevoMes: number, nuevoAño: number) => {
    setMes(nuevoMes);
    setAño(nuevoAño);
  };

  if (!reporte) {
    return (
      <div>
        <DashboardFilters onFilterChange={handleFilterChange} />
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">
            No hay datos para el período seleccionado
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Selecciona otro mes/año o carga facturas y gastos para ese período
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardFilters onFilterChange={handleFilterChange} />
      <MetricsCards reporte={reporte} />
      <PendingInvoicesTable facturasPPD={reporte.facturasPPD} />
      <AllInvoicesTable facturas={reporte.facturas} />
      <div className="mt-6 flex justify-end">
        <ExportPDFButton reporte={reporte} />
      </div>
    </div>
  );
}

