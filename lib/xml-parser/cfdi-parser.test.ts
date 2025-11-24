import { describe, it, expect, beforeEach } from 'vitest';
import { CFDIParser } from './cfdi-parser';

// Helper to create a File object from string
const createMockFile = (content: string, name: string = 'test.xml'): File => {
  const file = new File([content], name, { type: 'text/xml' });
  // Mock text() method as it might not be implemented in jsdom's File
  Object.defineProperty(file, 'text', {
    value: async () => content,
    writable: true,
  });
  return file;
};

describe('CFDIParser', () => {
  let parser: CFDIParser;

  beforeEach(() => {
    parser = new CFDIParser();
  });

  describe('PUE Invoice', () => {
    it('should correctly parse a PUE invoice', async () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
      <cfdi:Comprobante
        xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
        Version="4.0"
        Fecha="2023-01-01T12:00:00"
        Total="1160.00"
        SubTotal="1000.00"
        Moneda="MXN"
        TipoDeComprobante="I"
        MetodoPago="PUE"
        LugarExpedicion="12345">
        <cfdi:Emisor Rfc="EMI123456789" Nombre="EMISOR SA DE CV" RegimenFiscal="601"/>
        <cfdi:Receptor Rfc="REC987654321" Nombre="RECEPTOR SA DE CV" UsoCFDI="G03" DomicilioFiscalReceptor="54321" RegimenFiscalReceptor="601"/>
        <cfdi:Conceptos>
          <cfdi:Concepto ClaveProdServ="01010101" Cantidad="1" ClaveUnidad="H87" Description="Servicio de prueba" ValorUnitario="1000.00" Importe="1000.00" ObjetoImp="02">
            <cfdi:Impuestos>
              <cfdi:Traslados>
                <cfdi:Traslado Base="1000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="160.00"/>
              </cfdi:Traslados>
            </cfdi:Impuestos>
          </cfdi:Concepto>
        </cfdi:Conceptos>
        <cfdi:Impuestos TotalImpuestosTrasladados="160.00">
          <cfdi:Traslados>
            <cfdi:Traslado Base="1000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="160.00"/>
          </cfdi:Traslados>
        </cfdi:Impuestos>
        <cfdi:Complemento>
            <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" UUID="12345678-1234-1234-1234-1234567890AB" FechaTimbrado="2023-01-01T12:05:00"/>
        </cfdi:Complemento>
      </cfdi:Comprobante>`;

      const file = createMockFile(xml);
      const cfdi = await parser.parseXML(file);

      expect(cfdi.tipo).toBe('PUE');
      expect(cfdi.total).toBe(1160);
      expect(cfdi.subtotal).toBe(1000);
      expect(cfdi.iva).toBe(160);
      expect(cfdi.rfcEmisor).toBe('EMI123456789');
      expect(cfdi.rfcReceptor).toBe('REC987654321');
      expect(cfdi.uuid).toBe('12345678-1234-1234-1234-1234567890AB');
    });
  });

  describe('PPD Invoice', () => {
    it('should correctly parse a PPD invoice', async () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
      <cfdi:Comprobante
        xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
        Version="4.0"
        Fecha="2023-02-01T12:00:00"
        Total="2320.00"
        SubTotal="2000.00"
        Moneda="MXN"
        TipoDeComprobante="I"
        MetodoPago="PPD"
        LugarExpedicion="12345">
        <cfdi:Emisor Rfc="EMI123456789" Nombre="EMISOR SA DE CV" RegimenFiscal="601"/>
        <cfdi:Receptor Rfc="REC987654321" Nombre="RECEPTOR SA DE CV" UsoCFDI="G03" DomicilioFiscalReceptor="54321" RegimenFiscalReceptor="601"/>
        <cfdi:Conceptos>
          <cfdi:Concepto ClaveProdServ="01010101" Cantidad="1" ClaveUnidad="H87" Description="Producto a crédito" ValorUnitario="2000.00" Importe="2000.00" ObjetoImp="02"/>
        </cfdi:Conceptos>
        <cfdi:Complemento>
            <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" UUID="87654321-4321-4321-4321-BA0987654321" FechaTimbrado="2023-02-01T12:05:00"/>
        </cfdi:Complemento>
      </cfdi:Comprobante>`;

      const file = createMockFile(xml);
      const cfdi = await parser.parseXML(file);

      expect(cfdi.tipo).toBe('PPD');
      expect(cfdi.total).toBe(2320);
      expect(cfdi.rfcEmisor).toBe('EMI123456789');
    });
  });

  describe('Complemento de Pago', () => {
    it('should correctly parse a Complemento de Pago', async () => {
      // Using a simplified version of the provided example
      const xml = `<?xml version="1.0" encoding="utf-8"?>
      <cfdi:Comprobante
        xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
        xmlns:pago20="http://www.sat.gob.mx/Pagos20"
        Version="4.0"
        Fecha="2024-05-06T15:22:07"
        Total="0"
        SubTotal="0"
        Moneda="XXX"
        TipoDeComprobante="P">
        <cfdi:Emisor Rfc="EBN1612278X4" Nombre="ESCUELA DE BUCEO Y NATACION TUXPAN, VER." RegimenFiscal="626"/>
        <cfdi:Receptor Rfc="EAT990520H81" Nombre="ELECTRICIDAD AGUILA DE TUXPAN" DomicilioFiscalReceptor="06600" RegimenFiscalReceptor="601" UsoCFDI="CP01"/>
        <cfdi:Conceptos>
          <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" ClaveUnidad="ACT" Descripcion="Pago" ValorUnitario="0" Importe="0" ObjetoImp="01"/>
        </cfdi:Conceptos>
        <cfdi:Complemento>
          <pago20:Pagos Version="2.0">
            <pago20:Totales MontoTotalPagos="21782.02"/>
            <pago20:Pago FechaPago="2024-04-24T12:00:00" FormaDePagoP="03" MonedaP="MXN" Monto="21782.02" TipoCambioP="1">
              <pago20:DoctoRelacionado IdDocumento="82A38D1C-10E4-4665-BFCD-B6B3B47FD55D" MonedaDR="MXN" NumParcialidad="1" ImpSaldoAnt="21782.02" ImpPagado="21782.02" ImpSaldoInsoluto="0.00" ObjetoImpDR="02">
                <pago20:ImpuestosDR>
                  <pago20:TrasladosDR>
                    <pago20:TrasladoDR BaseDR="18777.60" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="3004.42"/>
                  </pago20:TrasladosDR>
                </pago20:ImpuestosDR>
              </pago20:DoctoRelacionado>
            </pago20:Pago>
          </pago20:Pagos>
          <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" UUID="0AAAF1D6-BA22-4E76-8F3E-E7024A3184AD" FechaTimbrado="2024-05-06T15:22:37"/>
        </cfdi:Complemento>
      </cfdi:Comprobante>`;

      const file = createMockFile(xml);
      const cfdi = await parser.parseXML(file);

      expect(cfdi.tipo).toBe('COMPLEMENTO_PAGO');
      expect(cfdi.uuid).toBe('0AAAF1D6-BA22-4E76-8F3E-E7024A3184AD');

      // Verify extracted amounts from the payment complement
      // Total = ImpPagado (21782.02)
      // Subtotal = BaseDR (18777.60)
      // IVA = ImporteDR (3004.42)
      expect(cfdi.total).toBeCloseTo(21782.02);
      expect(cfdi.subtotal).toBeCloseTo(18777.60);
      expect(cfdi.iva).toBeCloseTo(3004.42);

      // Verify date is taken from Payment Date (2024-04-24) not Timbrado Date (2024-05-06)
      expect(cfdi.fecha.toISOString()).toContain('2024-04-24');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid XML', async () => {
      const xml = 'invalid xml content';
      const file = createMockFile(xml);
      await expect(parser.parseXML(file)).rejects.toThrow();
    });

    it('should throw error if Comprobante node is missing', async () => {
      const xml = '<root>No comprobante here</root>';
      const file = createMockFile(xml);
      await expect(parser.parseXML(file)).rejects.toThrow('No se encontró el nodo Comprobante');
    });
  });
});
