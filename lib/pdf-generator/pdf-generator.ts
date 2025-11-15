/**
 * Generador de PDFs para reportes financieros
 * Diseño profesional y completo
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Reporte } from '@/lib/types';
import { MESES } from '@/lib/types';

/**
 * Genera un PDF con el reporte financiero completo
 */
export function generatePDFReport(reporte: Reporte): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let y = margin;

  // ==================== HEADER ====================
  // Fondo azul para el header
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Título principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte Financiero', margin, 20);

  // Período
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${MESES[reporte.mes - 1]} ${reporte.año}`,
    margin,
    30
  );

  // Fecha de generación
  doc.setFontSize(10);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-MX')}`,
    pageWidth - margin - doc.getTextWidth(`Generado: ${new Date().toLocaleDateString('es-MX')}`),
    30
  );

  y = 50;

  // ==================== RESUMEN FINANCIERO ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Financiero', margin, y);
  y += 10;

  // Cajas de métricas (2 filas: 3 en la primera, 2 en la segunda)
  const boxWidth = (contentWidth - 20) / 3; // 3 columnas con espacios
  const boxHeight = 28;
  const metrics = [
    {
      label: 'Total Facturado',
      value: reporte.totalFacturado,
      color: [59, 130, 246], // blue
    },
    {
      label: 'Total Pagado',
      value: reporte.totalPagado,
      color: [34, 197, 94], // green
    },
    {
      label: 'Total Compras',
      value: reporte.totalCompras,
      color: [168, 85, 247], // purple
    },
    {
      label: 'Pendiente por Pagar',
      value: reporte.pendientePagar,
      color: [239, 68, 68], // red
    },
    {
      label: 'Diferencia Ingresos - Gastos',
      value: reporte.diferenciaIngresosGastos,
      color:
        reporte.diferenciaIngresosGastos >= 0
          ? [34, 197, 94]
          : [239, 68, 68],
    },
  ];

  let x = margin;
  metrics.forEach((metric, index) => {
    // Primera fila: 3 métricas
    if (index === 3) {
      x = margin + (contentWidth - boxWidth * 2 - 10) / 2; // Centrar las últimas 2
      y += boxHeight + 8;
    }
    // Nueva fila cada 3 métricas (excepto para las últimas 2)
    if (index > 0 && index < 3 && index % 3 === 0) {
      x = margin;
      y += boxHeight + 8;
    }

    // Calcular color de fondo más claro (mezclar con blanco para efecto de transparencia)
    // Aumentar cada componente RGB hacia 255 (blanco) para crear un color más claro
    const lightColor: [number, number, number] = [
      Math.min(255, Math.round(metric.color[0] + (255 - metric.color[0]) * 0.85)),
      Math.min(255, Math.round(metric.color[1] + (255 - metric.color[1]) * 0.85)),
      Math.min(255, Math.round(metric.color[2] + (255 - metric.color[2]) * 0.85)),
    ];

    // Fondo de la caja
    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.rect(x, y, boxWidth, boxHeight, 'F');

    // Borde
    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setLineWidth(0.5);
    doc.rect(x, y, boxWidth, boxHeight, 'S');

    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label, x + 5, y + 8);

    // Value
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    const valueText = `$${metric.value.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    
    // Ajustar posición Y según el tamaño del texto
    const textWidth = doc.getTextWidth(valueText);
    if (textWidth > boxWidth - 10) {
      doc.setFontSize(9);
    }
    doc.text(valueText, x + 5, y + 20);

    // Si estamos en la última fila (índices 3 y 4), ajustar el espaciado
    if (index < 3) {
      x += boxWidth + 10;
    } else {
      x += boxWidth + 10;
    }
  });

  y += boxHeight + 15;

  // ==================== FACTURAS PENDIENTES ====================
  if (reporte.facturasPPD.length > 0) {
    // Verificar si hay espacio suficiente antes de agregar la sección
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Facturas Pendientes por Pagar (PPD)', margin, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['UUID', 'Fecha', 'Total', 'Pagado', 'Pendiente', 'Emisor']],
      body: reporte.facturasPPD.map((factura) => {
        const totalPagado =
          factura.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
        const pendiente = factura.total - totalPagado;

        return [
          factura.uuid.substring(0, 8) + '...',
          factura.fecha.toLocaleDateString('es-MX'),
          `$${factura.total.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          `$${totalPagado.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          `$${pendiente.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          (factura.nombreEmisor || 'N/A').substring(0, 25),
        ];
      }),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [239, 68, 68], // red
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242], // red-50
      },
      // margin.top controla dónde comienza la tabla en páginas nuevas
      // startY controla dónde comienza en la primera página
      margin: { top: 10, left: margin, right: margin },
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
    });

    // Obtener la posición Y final de la tabla
    // jspdf-autotable actualiza lastAutoTable.finalY después de cada tabla
    const finalY = (doc as any).lastAutoTable?.finalY;
    
    if (finalY !== undefined) {
      // La posición final Y está en relación a la página actual donde terminó la tabla
      // Si finalY es menor que un margen razonable, significa que la tabla terminó
      // muy arriba en una nueva página (lo cual es normal)
      y = finalY + 15;
      
      // Verificar si necesitamos una nueva página para la siguiente sección
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin + 10;
      }
    } else {
      // Fallback: si no hay finalY, usar la posición Y anterior
      y = y + 15;
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin + 10;
      }
    }
  }

  // ==================== TODAS LAS FACTURAS ====================
  // Verificar si hay espacio suficiente antes de agregar la sección
  if (y > pageHeight - 80) {
    doc.addPage();
    y = margin + 10;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Todas las Facturas (${reporte.facturas.length})`,
    margin,
    y
  );
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['UUID', 'Fecha', 'Tipo', 'Total', 'Emisor']],
    body: reporte.facturas.map((inv) => [
      inv.uuid.substring(0, 8) + '...',
      inv.fecha.toLocaleDateString('es-MX'),
      inv.tipo,
      `$${inv.total.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      (inv.nombreEmisor || 'N/A').substring(0, 30),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255], // blue-50
    },
    // margin.top controla dónde comienza la tabla en páginas nuevas
    // startY controla dónde comienza en la primera página
    margin: { top: 10, left: margin, right: margin },
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
  });

  // Obtener la posición Y final de la tabla
  // jspdf-autotable actualiza lastAutoTable.finalY después de cada tabla
  const finalYFacturas = (doc as any).lastAutoTable?.finalY;
  
  if (finalYFacturas !== undefined) {
    // La posición final Y está en relación a la página actual donde terminó la tabla
    y = finalYFacturas + 15;
    
    // Verificar si necesitamos una nueva página para la siguiente sección
    if (y > pageHeight - 70) {
      doc.addPage();
      y = margin + 10;
    }
  } else {
    // Fallback: si no hay finalY, usar la posición Y anterior
    y = y + 15;
    if (y > pageHeight - 70) {
      doc.addPage();
      y = margin + 10;
    }
  }

  // ==================== GASTOS ====================
  if (reporte.gastos.length > 0) {
    // Verificar si hay espacio suficiente antes de agregar la sección
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Gastos Registrados (${reporte.gastos.length})`, margin, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['ID/UUID', 'Fecha', 'Tipo', 'Origen', 'Monto', 'Concepto/Proveedor']],
      body: reporte.gastos.map((gasto) => {
        const id =
          gasto.tipoOrigen === 'XML'
            ? gasto.uuid.substring(0, 8) + '...'
            : gasto.id.substring(0, 12) + '...';
        const monto =
          gasto.tipoOrigen === 'MANUAL' ? gasto.monto : gasto.total;
        const concepto =
          gasto.tipoOrigen === 'MANUAL'
            ? gasto.concepto.substring(0, 30)
            : (gasto.nombreEmisor || 'N/A').substring(0, 30);
        const tipo = gasto.tipoOrigen === 'MANUAL' ? gasto.tipo : gasto.tipo;

        return [
          id,
          gasto.fecha.toLocaleDateString('es-MX'),
          tipo,
          gasto.tipoOrigen,
          `$${monto.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          concepto,
        ];
      }),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [168, 85, 247], // purple
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [250, 245, 255], // purple-50
      },
      // margin.top controla dónde comienza la tabla en páginas nuevas
      // startY controla dónde comienza en la primera página
      margin: { top: 10, left: margin, right: margin },
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
    });
  }

  // ==================== FOOTER ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // ==================== GUARDAR ====================
  const nombreArchivo = `reporte-${MESES[reporte.mes - 1].toLowerCase()}-${reporte.año}.pdf`;
  doc.save(nombreArchivo);
}
