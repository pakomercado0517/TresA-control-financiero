'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generatePDFReport } from '@/lib/pdf-generator';
import type { Reporte } from '@/lib/types';

interface ExportPDFButtonProps {
  reporte: Reporte;
}

export function ExportPDFButton({ reporte }: ExportPDFButtonProps) {
  const handleExport = () => {
    generatePDFReport(reporte);
  };

  return (
    <Button
      onClick={handleExport}
      size="lg"
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
    >
      <Download className="h-5 w-5" />
      Exportar Reporte PDF
    </Button>
  );
}

