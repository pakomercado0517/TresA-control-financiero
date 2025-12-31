'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generatePDFReport } from '@/lib/pdf-generator';
import type { Reporte, CFDI, Gasto } from '@/lib/types';
import { separarFacturasPorEstado } from '@/lib/utils/invoice-payment-status';

interface ExportPDFButtonProps {
  reporte: Reporte;
  invoices: CFDI[];
  gastos: Gasto[];
}

export function ExportPDFButton({ reporte, invoices, gastos }: ExportPDFButtonProps) {
  const handleExport = () => {
    const facturasSeparadas = separarFacturasPorEstado(invoices, reporte.mes, reporte.año);
    const gastosMes = gastos.filter((g) => g.mes === reporte.mes && g.año === reporte.año);
    
    generatePDFReport(reporte, facturasSeparadas, invoices, gastosMes);
  };

  return (
    <Button
      onClick={handleExport}
      size="default"
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
    >
      <Download className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}

