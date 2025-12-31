/**
 * Generador de PDFs para reportes financieros
 * Diseño profesional y completo
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Reporte, CFDI, Gasto } from '@/lib/types';
import { MESES } from '@/lib/types';
import {
  calcularTotalPagadoPPD,
  obtenerComplementosRelacionados,
} from '@/lib/utils/invoice-payment-status';

interface FacturasSeparadas {
  facturasPendientes: CFDI[];
  facturasPagadas: CFDI[];
  facturasPUE: CFDI[];
  facturasPPD: CFDI[];
  complementos: CFDI[];
}

/**
 * Genera un PDF con el reporte financiero completo
 */
export function generatePDFReport(
  reporte: Reporte,
  facturasSeparadas: FacturasSeparadas,
  todasLasFacturas: CFDI[],
  gastosMes: Gasto[]
): void {
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
  doc.text(`${MESES[reporte.mes - 1]} ${reporte.año}`, margin, 30);

  // Fecha de generación
  doc.setFontSize(10);
  const fechaTexto = `Generado: ${new Date().toLocaleDateString('es-MX')}`;
  doc.text(
    fechaTexto,
    pageWidth - margin - doc.getTextWidth(fechaTexto),
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
  const boxWidth = (contentWidth - 20) / 3;
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
    if (index === 3) {
      x = margin + (contentWidth - boxWidth * 2 - 10) / 2;
      y += boxHeight + 8;
    }
    if (index > 0 && index < 3 && index % 3 === 0) {
      x = margin;
      y += boxHeight + 8;
    }

    const lightColor: [number, number, number] = [
      Math.min(255, Math.round(metric.color[0] + (255 - metric.color[0]) * 0.85)),
      Math.min(255, Math.round(metric.color[1] + (255 - metric.color[1]) * 0.85)),
      Math.min(255, Math.round(metric.color[2] + (255 - metric.color[2]) * 0.85)),
    ];

    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.rect(x, y, boxWidth, boxHeight, 'F');

    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setLineWidth(0.5);
    doc.rect(x, y, boxWidth, boxHeight, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label, x + 5, y + 8);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    const valueText = `$${metric.value.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const textWidth = doc.getTextWidth(valueText);
    if (textWidth > boxWidth - 10) {
      doc.setFontSize(9);
    }
    doc.text(valueText, x + 5, y + 20);

    if (index < 3) {
      x += boxWidth + 10;
    } else {
      x += boxWidth + 10;
    }
  });

  y += boxHeight + 15;

  // ==================== FACTURAS PENDIENTES (AMARILLO) ====================
  if (facturasSeparadas.facturasPendientes.length > 0) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(234, 179, 8); // yellow-600
    doc.text(
      `Facturas Pendientes por Pagar (${facturasSeparadas.facturasPendientes.length})`,
      margin,
      y
    );
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['UUID', 'Fecha', 'Total', 'Pagado', 'Pendiente', 'Emisor']],
      body: facturasSeparadas.facturasPendientes.map((factura) => {
        const totalPagado = calcularTotalPagadoPPD(factura, todasLasFacturas);
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
        fillColor: [250, 204, 21], // yellow-400
        textColor: 0,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [254, 249, 195], // yellow-100
      },
      margin: { top: 10, left: margin, right: margin },
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    if (finalY !== undefined) {
      y = finalY + 15;
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin + 10;
      }
    } else {
      y = y + 15;
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin + 10;
      }
    }
  }

  // ==================== FACTURAS PAGADAS (VERDE) ====================
  if (facturasSeparadas.facturasPagadas.length > 0) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74); // green-600
    doc.text(
      `Facturas Pagadas (${facturasSeparadas.facturasPagadas.length})`,
      margin,
      y
    );
    y += 10;

    // Crear cuerpo de la tabla con información expandida para PPD
    const bodyRows: (string | number)[][] = [];
    facturasSeparadas.facturasPagadas.forEach((factura) => {
      const esPPD = factura.tipo === 'PPD';
      const totalPagado = esPPD
        ? calcularTotalPagadoPPD(factura, todasLasFacturas)
        : factura.total;
      const complementos = esPPD
        ? obtenerComplementosRelacionados(factura, todasLasFacturas)
        : [];

      // Fila principal
      bodyRows.push([
        factura.uuid.substring(0, 8) + '...',
        factura.fecha.toLocaleDateString('es-MX'),
        factura.tipo,
        `$${factura.total.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        `$${totalPagado.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        (factura.nombreEmisor || 'N/A').substring(0, 25),
        complementos.length > 0
          ? `${complementos.length} complemento${complementos.length > 1 ? 's' : ''}`
          : '—',
      ]);

      // Filas de complementos si existen
      if (complementos.length > 0) {
        complementos.forEach((complemento, idx) => {
          const montoComplemento =
            complemento.complementoPago?.monto || complemento.total;
          const fechaPago = complemento.complementoPago?.fechaPago;
          const numParcialidad = complemento.complementoPago?.numParcialidad;

          const complementoText = [
            '',
            fechaPago ? fechaPago.toLocaleDateString('es-MX') : '',
            `Complemento ${idx + 1}`,
            '',
            `$${montoComplemento.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            complemento.uuid.substring(0, 12) + '...',
            numParcialidad ? `Parcialidad ${numParcialidad}` : '',
          ];

          bodyRows.push(complementoText);
        });
      }
    });

    autoTable(doc, {
      startY: y,
      head: [['UUID', 'Fecha', 'Tipo', 'Total', 'Pagado', 'Emisor', 'Complementos']],
      body: bodyRows,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [74, 222, 128], // green-400
        textColor: 0,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [220, 252, 231], // green-100
      },
      didParseCell: (data) => {
        // Estilos especiales para filas de complementos
        if (data.row.index > 0 && data.cell.text[0] === '') {
          // Es una fila de complemento
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'italic';
          data.cell.styles.textColor = [75, 85, 99];
        }
      },
      margin: { top: 10, left: margin, right: margin },
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    if (finalY !== undefined) {
      y = finalY + 15;
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin + 10;
      }
    } else {
      y = y + 15;
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin + 10;
      }
    }
  }

  // ==================== GASTOS (PÚRPURA) ====================
  if (gastosMes.length > 0) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(147, 51, 234); // purple-600
    doc.text(`Gastos (${gastosMes.length})`, margin, y);
    y += 10;

    // Calcular total de gastos
    const totalGastos = gastosMes.reduce((sum, gasto) => {
      return sum + (gasto.tipoOrigen === 'MANUAL' ? gasto.monto : gasto.total);
    }, 0);

    autoTable(doc, {
      startY: y,
      head: [['Origen', 'Fecha', 'Total', 'Concepto', 'Proveedor']],
      body: gastosMes.map((gasto) => {
        const montoTotal = gasto.tipoOrigen === 'MANUAL' ? gasto.monto : gasto.total;
        const proveedor =
          gasto.tipoOrigen === 'XML' && 'nombreEmisor' in gasto
            ? gasto.nombreEmisor || 'N/A'
            : '—';

        return [
          gasto.tipoOrigen,
          gasto.fecha.toLocaleDateString('es-MX'),
          `$${montoTotal.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          (gasto.concepto || 'N/A').substring(0, 30),
          proveedor.substring(0, 25),
        ];
      }),
      foot: [
        [
          'TOTAL',
          '',
          `$${totalGastos.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          '',
          '',
        ],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [167, 139, 250], // purple-400
        textColor: 0,
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: [167, 139, 250], // purple-400
        textColor: 0,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [250, 245, 255], // purple-100
      },
      margin: { top: 10, left: margin, right: margin },
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    if (finalY !== undefined) {
      y = finalY + 15;
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin + 10;
      }
    } else {
      y = y + 15;
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin + 10;
      }
    }
  }

  // ==================== TODAS LAS FACTURAS (AZUL) ====================
  if (reporte.facturas.length > 0) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(`Todas las Facturas (${reporte.facturas.length})`, margin, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['UUID', 'Fecha', 'Tipo', 'Total', 'Emisor', 'Receptor']],
      body: reporte.facturas.map((inv) => [
        inv.uuid.substring(0, 8) + '...',
        inv.fecha.toLocaleDateString('es-MX'),
        inv.tipo,
        `$${inv.total.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        (inv.nombreEmisor || 'N/A').substring(0, 20),
        (inv.nombreReceptor || 'N/A').substring(0, 20),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [96, 165, 250], // blue-400
        textColor: 0,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [239, 246, 255], // blue-100
      },
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
