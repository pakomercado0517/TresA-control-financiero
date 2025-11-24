import { describe, it, expect } from 'vitest';
import { calculateReport } from './report-calculator';
import type { CFDI, Gasto } from '@/lib/types';

describe('calculateReport', () => {
    it('should calculate report correctly for PUE invoices', () => {
        const invoices: CFDI[] = [
            {
                uuid: '1',
                fecha: new Date('2023-01-15'),
                tipo: 'PUE',
                total: 1000,
                subtotal: 800,
                iva: 160,
                rfcEmisor: 'ABC',
                nombreEmisor: 'Emisor',
                rfcReceptor: 'XYZ',
                nombreReceptor: 'Receptor',
                concepto: 'Test',
                mes: 1,
                año: 2023,
            },
            {
                uuid: '2',
                fecha: new Date('2023-01-20'),
                tipo: 'PUE',
                total: 2000,
                subtotal: 1600,
                iva: 320,
                rfcEmisor: 'ABC',
                nombreEmisor: 'Emisor',
                rfcReceptor: 'XYZ',
                nombreReceptor: 'Receptor',
                concepto: 'Test 2',
                mes: 1,
                año: 2023,
            },
        ];

        const expenses: Gasto[] = [];

        const report = calculateReport(invoices, expenses, 1, 2023);

        expect(report.totalFacturado).toBe(3000);
        expect(report.totalPagado).toBe(3000);
        expect(report.pendientePagar).toBe(0);
    });
});
