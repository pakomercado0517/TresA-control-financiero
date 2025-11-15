/**
 * Parser para archivos XML de CFDI (Comprobante Fiscal Digital por Internet)
 *
 * Identifica y extrae información de facturas CFDI, incluyendo:
 * - Tipo de comprobante (PUE, PPD, COMPLEMENTO_PAGO)
 * - Datos del emisor y receptor
 * - Montos y conceptos
 * - Información de pagos
 */

import { XMLParser } from "fast-xml-parser";
import type {
  CFDI,
  TipoComprobante,
  Pago,
  ComplementoPago,
  EmisorData,
  ReceptorData,
} from "@/lib/types";

/**
 * Estructura del XML parseado (estructura interna del parser)
 */
interface ParsedXML {
  "cfdi:Comprobante"?: ComprobanteNode;
  Comprobante?: ComprobanteNode;
}

interface ComprobanteNode {
  "@_Fecha"?: string;
  "@_Total"?: string | number;
  "@_SubTotal"?: string | number;
  "@_TipoDeComprobante"?: string;
  "@_MetodoPago"?: string;
  "cfdi:Emisor"?: EmisorNode;
  Emisor?: EmisorNode;
  "cfdi:Receptor"?: ReceptorNode;
  Receptor?: ReceptorNode;
  "cfdi:Conceptos"?: ConceptosNode;
  Conceptos?: ConceptosNode;
  "cfdi:Complemento"?: ComplementoNode;
  Complemento?: ComplementoNode;
}

interface EmisorNode {
  "@_Rfc"?: string;
  "@_RFC"?: string;
  "@_Nombre"?: string;
}

interface ReceptorNode {
  "@_Rfc"?: string;
  "@_RFC"?: string;
  "@_Nombre"?: string;
}

interface ConceptosNode {
  "cfdi:Concepto"?: ConceptoNode | ConceptoNode[];
  Concepto?: ConceptoNode | ConceptoNode[];
}

interface ConceptoNode {
  "@_Descripcion"?: string;
  "@_descripcion"?: string;
}

interface ComplementoNode {
  "pago10:Pagos"?: Pagos10Node;
  "pago:Pagos"?: Pagos20Node;
  Pagos?: Pagos10Node | Pagos20Node;
  "pago20:Pagos"?: Pagos20Node;
  "pago20:ComplementoPago"?: ComplementoPago20Node;
  "pago:ComplementoPago"?: ComplementoPago20Node;
  ComplementoPago?: ComplementoPago20Node;
  "tfd:TimbreFiscalDigital"?: TimbreFiscalNode;
  TimbreFiscalDigital?: TimbreFiscalNode;
}

interface Pagos20TotalesNode {
  "@_MontoTotalPagos"?: string | number;
  "@_TotalTrasladosBaseIVA16"?: string | number;
  "@_TotalTrasladosImpuestoIVA16"?: string | number;
}

interface TrasladoDRNode {
  "@_BaseDR"?: string | number;
  "@_baseDR"?: string | number;
  "@_ImporteDR"?: string | number;
  "@_importeDR"?: string | number;
}

interface TrasladosDRNode {
  "pago20:TrasladoDR"?: TrasladoDRNode | TrasladoDRNode[];
}

interface ImpuestosDRNode {
  "pago20:TrasladosDR"?: TrasladosDRNode;
}

interface Pagos10Node {
  "pago10:Pago"?: Pago10Node | Pago10Node[];
  Pago?: Pago10Node | Pago10Node[];
}

interface Pago10Node {
  "@_FechaPago"?: string;
  "@_fechaPago"?: string;
  "@_FormaPago"?: string;
  "@_formaPago"?: string;
  "@_MonedaP"?: string;
  "@_monedaP"?: string;
  "@_Monto"?: string | number;
  "@_monto"?: string | number;
  "@_NumOperacion"?: string;
  "@_numOperacion"?: string;
  "@_NumParcialidad"?: string | number;
  "@_numParcialidad"?: string | number;
}

interface Pagos20Node {
  "pago20:Pago"?: Pago20Node | Pago20Node[];
  "pago20:Totales"?: Pagos20TotalesNode;
}

interface Pago20Node {
  "@_FechaPago"?: string;
  "@_fechaPago"?: string;
  "@_Monto"?: string | number;
  "@_monto"?: string | number;
  "@_ImpPagado"?: string | number;
  "@_impPagado"?: string | number;
  "@_NumParcialidad"?: string | number;
  "@_numParcialidad"?: string | number;
  "pago20:DoctoRelacionado"?: DoctoRelacionadoNode | DoctoRelacionadoNode[];
  "pago:DoctoRelacionado"?: DoctoRelacionadoNode | DoctoRelacionadoNode[];
  DoctoRelacionado?: DoctoRelacionadoNode | DoctoRelacionadoNode[];
  "pago20:ImpuestosP"?: ImpuestosPNode;
}

interface ImpuestosPNode {
  "pago20:TrasladosP"?: TrasladosPNode;
}

interface TrasladosPNode {
  "pago20:TrasladoP"?: TrasladoPNode | TrasladoPNode[];
}

interface TrasladoPNode {
  "@_BaseP"?: string | number;
  "@_ImporteP"?: string | number;
}

interface DoctoRelacionadoNode {
  "@_IdDocumento"?: string;
  "@_idDocumento"?: string;
  "@_ImpPagado"?: string | number;
  "@_impPagado"?: string | number;
  "@_BaseDR"?: string | number;
  "@_baseDR"?: string | number;
  "@_ImporteDR"?: string | number;
  "@_importeDR"?: string | number;
  "@_NumParcialidad"?: string | number;
  "@_numParcialidad"?: string | number;
  "pago20:ImpuestosDR"?: ImpuestosDRNode;
}

interface ComplementoPago20Node {
  "pago20:Pago"?: Pago20Node | Pago20Node[];
  "pago:Pago"?: Pago20Node | Pago20Node[];
  Pago?: Pago20Node | Pago20Node[];
}

interface TimbreFiscalNode {
  "@_UUID"?: string;
  "@_uuid"?: string;
}

/**
 * Clase principal para parsear archivos XML de CFDI
 */
export class CFDIParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      trimValues: true,
    });
  }

  /**
   * Parsea un archivo XML y retorna un objeto CFDI
   *
   * @param file - Archivo XML a parsear
   * @returns Promise con el objeto CFDI parseado
   * @throws Error si el XML no es válido o no contiene información de CFDI
   */
  async parseXML(file: File): Promise<CFDI> {
    try {
      const xmlText = await file.text();
      const parsed = this.parser.parse(xmlText) as ParsedXML;

      const comprobante = parsed["cfdi:Comprobante"] || parsed.Comprobante;

      if (!comprobante) {
        throw new Error("No se encontró el nodo Comprobante en el XML");
      }

      // Extraer datos básicos
      // NOTA: Para complementos de pago, usaremos FechaPago del complemento,
      // no la fecha de timbrado del comprobante
      const fechaTimbrado = this.extractFecha(comprobante);
      const uuid = this.extractUUID(parsed);

      // Identificar tipo de comprobante
      const tipo = this.identificarTipo(comprobante);

      // Extraer total, subtotal e IVA según el tipo
      // Si es complemento de pago, usar campos específicos
      let total: number;
      let subtotal: number;
      let iva: number;

      if (tipo === "COMPLEMENTO_PAGO") {
        const montosComplemento =
          this.extractMontosComplementoPago(comprobante);
        total = montosComplemento.total;
        subtotal = montosComplemento.subtotal;
        iva = montosComplemento.iva;
      } else {
        total = this.extractTotal(comprobante);
        subtotal = this.extractSubtotal(comprobante);
        iva = total - subtotal;
      }

      // Extraer emisor y receptor
      const emisor = this.extractEmisor(comprobante);
      const receptor = this.extractReceptor(comprobante);

      // Extraer concepto
      const concepto = this.extractConcepto(comprobante);

      // Extraer pagos o complemento según el tipo
      const pagos = tipo === "PPD" ? this.extractPagos(comprobante) : undefined;
      const complementoPago =
        tipo === "COMPLEMENTO_PAGO"
          ? this.extractComplementoPago(comprobante)
          : undefined;

      // Para complementos de pago, usar FechaPago del complemento como fecha principal
      // Esto es importante para reportes financieros, ya que la fecha de pago
      // es más relevante que la fecha de timbrado
      let fecha: Date;
      if (tipo === "COMPLEMENTO_PAGO") {
        if (complementoPago && complementoPago.fechaPago) {
          fecha = complementoPago.fechaPago;
          console.log(
            `[CFDI Parser] ✅ Complemento de pago detectado - Usando FechaPago: ${fecha.toISOString()} (timbrado: ${fechaTimbrado.toISOString()})`
          );
        } else {
          // Si no se pudo extraer el complemento, usar fecha de timbrado como fallback
          console.warn(
            `[CFDI Parser] ⚠️ Complemento de pago detectado pero no se pudo extraer FechaPago, usando fecha de timbrado: ${fechaTimbrado.toISOString()}`
          );
          fecha = fechaTimbrado;
        }
      } else {
        fecha = fechaTimbrado;
      }

      return {
        uuid,
        fecha,
        tipo,
        total,
        subtotal,
        iva,
        rfcEmisor: emisor.rfc,
        nombreEmisor: emisor.nombre,
        rfcReceptor: receptor.rfc,
        nombreReceptor: receptor.nombre,
        concepto,
        pagos,
        complementoPago,
        mes: fecha.getMonth() + 1,
        año: fecha.getFullYear(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al parsear XML: ${error.message}`);
      }
      throw new Error("Error desconocido al parsear XML");
    }
  }

  /**
   * Identifica el tipo de comprobante (PUE, PPD o COMPLEMENTO_PAGO)
   *
   * En CFDI 4.0:
   * - TipoDeComprobante: "I" = Ingreso (factura), "P" = Pago (complemento de pago)
   * - MetodoPago: "PUE" = Pago en una sola exhibición, "PPD" = Pago en parcialidades o diferido
   */
  private identificarTipo(comprobante: ComprobanteNode): TipoComprobante {
    // Primero verificar TipoDeComprobante para distinguir entre Ingreso y Complemento de Pago
    const tipoComprobante = comprobante["@_TipoDeComprobante"];

    if (tipoComprobante) {
      const tipo = String(tipoComprobante).toUpperCase().trim();

      // Si es "P", es complemento de pago
      if (tipo === "P") {
        return "COMPLEMENTO_PAGO";
      }

      // Si es "I" (Ingreso), entonces verificar el método de pago
      if (tipo === "I") {
        const metodoPago = comprobante["@_MetodoPago"];

        if (metodoPago) {
          const metodo = String(metodoPago).toUpperCase().trim();

          // Si el método de pago es "PPD", retornar PPD
          if (metodo === "PPD") {
            return "PPD";
          }

          // Si el método de pago es "PUE", retornar PUE
          if (metodo === "PUE") {
            return "PUE";
          }
        }
      }
    }

    // Fallback: Verificar complemento de pago (versión 2.0) para compatibilidad
    const complemento =
      comprobante["cfdi:Complemento"] || comprobante.Complemento;

    if (complemento) {
      // Buscar complemento de pago en diferentes variantes
      // Estructura 1: pago20:Pagos directamente en Complemento (CFDI 4.0)
      if (
        complemento["pago20:Pagos"] ||
        complemento["pago:Pagos"] ||
        (complemento.Pagos && "pago20:Pago" in complemento.Pagos)
      ) {
        return "COMPLEMENTO_PAGO";
      }
      // Estructura 2: pago20:ComplementoPago que contiene pago20:Pago
      if (
        complemento["pago20:ComplementoPago"] ||
        complemento["pago:ComplementoPago"] ||
        complemento.ComplementoPago
      ) {
        return "COMPLEMENTO_PAGO";
      }
    }

    // Fallback: Intentar inferir del método de pago directamente
    const metodoPago = comprobante["@_MetodoPago"];

    if (metodoPago) {
      const metodo = String(metodoPago).toUpperCase().trim();

      if (metodo === "PPD") {
        return "PPD";
      }

      if (metodo === "PUE") {
        return "PUE";
      }
    }

    // Por defecto, si no se puede determinar, asumir PUE
    return "PUE";
  }

  /**
   * Extrae la fecha del comprobante
   */
  private extractFecha(comprobante: ComprobanteNode): Date {
    const fechaStr = comprobante["@_Fecha"];

    if (!fechaStr) {
      throw new Error("No se encontró la fecha en el comprobante");
    }

    const fecha = new Date(fechaStr);

    if (isNaN(fecha.getTime())) {
      throw new Error(`Fecha inválida: ${fechaStr}`);
    }

    return fecha;
  }

  /**
   * Extrae el total del comprobante
   */
  private extractTotal(comprobante: ComprobanteNode): number {
    const total = comprobante["@_Total"];

    if (total === undefined || total === null) {
      throw new Error("No se encontró el total en el comprobante");
    }

    return typeof total === "string" ? parseFloat(total) : total;
  }

  /**
   * Extrae el subtotal del comprobante
   */
  private extractSubtotal(comprobante: ComprobanteNode): number {
    const subtotal = comprobante["@_SubTotal"];

    if (subtotal === undefined || subtotal === null) {
      throw new Error("No se encontró el subtotal en el comprobante");
    }

    return typeof subtotal === "string" ? parseFloat(subtotal) : subtotal;
  }

  /**
   * Extrae el UUID del timbre fiscal
   */
  private extractUUID(parsed: ParsedXML): string {
    const comprobante = parsed["cfdi:Comprobante"] || parsed.Comprobante;

    if (!comprobante) {
      return "N/A";
    }

    const complemento =
      comprobante["cfdi:Complemento"] || comprobante.Complemento;

    if (!complemento) {
      return "N/A";
    }

    const tfd =
      complemento["tfd:TimbreFiscalDigital"] || complemento.TimbreFiscalDigital;

    if (!tfd) {
      return "N/A";
    }

    return tfd["@_UUID"] || tfd["@_uuid"] || "N/A";
  }

  /**
   * Extrae datos del emisor
   */
  private extractEmisor(comprobante: ComprobanteNode): EmisorData {
    const emisor = comprobante["cfdi:Emisor"] || comprobante.Emisor;

    if (!emisor) {
      throw new Error("No se encontró el nodo Emisor en el comprobante");
    }

    const rfc = emisor["@_Rfc"] || emisor["@_RFC"] || "";
    const nombre = emisor["@_Nombre"] || "";

    if (!rfc) {
      throw new Error("No se encontró el RFC del emisor");
    }

    return { rfc, nombre };
  }

  /**
   * Extrae datos del receptor
   */
  private extractReceptor(comprobante: ComprobanteNode): ReceptorData {
    const receptor = comprobante["cfdi:Receptor"] || comprobante.Receptor;

    if (!receptor) {
      throw new Error("No se encontró el nodo Receptor en el comprobante");
    }

    const rfc = receptor["@_Rfc"] || receptor["@_RFC"] || "";
    const nombre = receptor["@_Nombre"] || "";

    if (!rfc) {
      throw new Error("No se encontró el RFC del receptor");
    }

    return { rfc, nombre };
  }

  /**
   * Extrae el concepto/descripción del comprobante
   */
  private extractConcepto(comprobante: ComprobanteNode): string {
    const conceptos = comprobante["cfdi:Conceptos"] || comprobante.Conceptos;

    if (!conceptos) {
      return "N/A";
    }

    const conceptoNode = conceptos["cfdi:Concepto"] || conceptos.Concepto;

    if (!conceptoNode) {
      return "N/A";
    }

    const conceptosArray = Array.isArray(conceptoNode)
      ? conceptoNode
      : [conceptoNode];

    const descripciones = conceptosArray
      .map((c: ConceptoNode) => c["@_Descripcion"] || c["@_descripcion"] || "")
      .filter((d: string) => d.length > 0);

    return descripciones.length > 0 ? descripciones.join(", ") : "N/A";
  }

  /**
   * Extrae los pagos del comprobante (versión 1.0)
   */
  private extractPagos(comprobante: ComprobanteNode): Pago[] | undefined {
    const complemento =
      comprobante["cfdi:Complemento"] || comprobante.Complemento;

    if (!complemento) {
      return undefined;
    }

    const pagos =
      complemento["pago10:Pagos"] ||
      (complemento.Pagos && "pago10:Pago" in complemento.Pagos
        ? complemento.Pagos
        : undefined);

    if (!pagos) {
      return undefined;
    }

    // Verificar que sea Pagos10Node (tiene pago10:Pago)
    if (!("pago10:Pago" in pagos) && !("Pago" in pagos)) {
      return undefined;
    }

    const pagosArray = this.extractPagosArray10(pagos as Pagos10Node);

    if (pagosArray.length === 0) {
      return undefined;
    }

    return pagosArray.map((pago: Pago10Node): Pago => {
      const fechaPagoStr = pago["@_FechaPago"] || pago["@_fechaPago"] || "";

      if (!fechaPagoStr) {
        throw new Error("No se encontró la fecha de pago");
      }

      const fechaPago = new Date(fechaPagoStr);

      if (isNaN(fechaPago.getTime())) {
        throw new Error(`Fecha de pago inválida: ${fechaPagoStr}`);
      }

      const monto =
        typeof pago["@_Monto"] === "string"
          ? parseFloat(pago["@_Monto"])
          : pago["@_Monto"] || pago["@_monto"] || 0;

      return {
        fechaPago,
        formaPago: pago["@_FormaPago"] || pago["@_formaPago"] || "",
        moneda: pago["@_MonedaP"] || pago["@_monedaP"] || "MXN",
        monto: typeof monto === "string" ? parseFloat(monto) : monto,
        numOperacion: pago["@_NumOperacion"] || pago["@_numOperacion"],
        numParcialidad:
          pago["@_NumParcialidad"] || pago["@_numParcialidad"]
            ? parseInt(
                String(pago["@_NumParcialidad"] || pago["@_numParcialidad"]),
                10
              )
            : undefined,
      };
    });
  }

  /**
   * Extrae array de pagos versión 1.0
   */
  private extractPagosArray10(pagos: Pagos10Node): Pago10Node[] {
    const pago = pagos["pago10:Pago"] || pagos.Pago;

    if (!pago) {
      return [];
    }

    return Array.isArray(pago) ? pago : [pago];
  }

  /**
   * Extrae array de pagos versión 2.0
   */
  private extractPagosArray20(pagos: Pagos20Node): Pago20Node[] {
    const pago = pagos["pago20:Pago"];

    if (!pago) {
      return [];
    }

    return Array.isArray(pago) ? pago : [pago];
  }

  /**
   * Extrae los montos del complemento de pago
   * En complementos de pago, los valores vienen en ceros en el comprobante,
   * por lo que se extraen de campos específicos del complemento
   *
   * Estructura en CFDI 4.0:
   * - Total: ImpPagado en pago20:DoctoRelacionado
   * - Subtotal: BaseDR en pago20:TrasladoDR
   * - IVA: ImporteDR en pago20:TrasladoDR
   */
  private extractMontosComplementoPago(comprobante: ComprobanteNode): {
    total: number;
    subtotal: number;
    iva: number;
  } {
    const complemento =
      comprobante["cfdi:Complemento"] || comprobante.Complemento;

    if (!complemento) {
      return { total: 0, subtotal: 0, iva: 0 };
    }

    // En CFDI 4.0, el complemento de pago está en pago20:Pagos (no en ComplementoPago)
    const pagos20 = complemento["pago20:Pagos"];

    if (!pagos20) {
      return { total: 0, subtotal: 0, iva: 0 };
    }

    // Obtener los pagos
    const pago = pagos20["pago20:Pago"];

    if (!pago) {
      return { total: 0, subtotal: 0, iva: 0 };
    }

    const pagoArray = Array.isArray(pago) ? pago : [pago];

    if (pagoArray.length === 0) {
      return { total: 0, subtotal: 0, iva: 0 };
    }

    // Sumar valores de todos los pagos
    let total = 0;
    let subtotal = 0;
    let iva = 0;

    for (const pagoItem of pagoArray) {
      // Buscar documentos relacionados
      const doctosRelacionados = pagoItem["pago20:DoctoRelacionado"];

      if (doctosRelacionados) {
        const doctosArray = Array.isArray(doctosRelacionados)
          ? doctosRelacionados
          : [doctosRelacionados];

        for (const docto of doctosArray) {
          // Total: ImpPagado del documento relacionado
          const impPagado = docto["@_ImpPagado"] || docto["@_impPagado"] || 0;
          const impPagadoNum =
            typeof impPagado === "string"
              ? parseFloat(String(impPagado))
              : impPagado;
          total += impPagadoNum || 0;

          // Subtotal e IVA: BaseDR e ImporteDR están en pago20:TrasladoDR
          const impuestosDR = docto["pago20:ImpuestosDR"];

          if (impuestosDR) {
            const trasladosDR = impuestosDR["pago20:TrasladosDR"];

            if (trasladosDR) {
              const trasladoDR = trasladosDR["pago20:TrasladoDR"];

              if (trasladoDR) {
                const trasladosArray = Array.isArray(trasladoDR)
                  ? trasladoDR
                  : [trasladoDR];

                for (const traslado of trasladosArray) {
                  // Subtotal: BaseDR
                  const baseDR =
                    traslado["@_BaseDR"] || traslado["@_baseDR"] || 0;
                  const baseDRNum =
                    typeof baseDR === "string"
                      ? parseFloat(String(baseDR))
                      : baseDR;
                  subtotal += baseDRNum || 0;

                  // IVA: ImporteDR
                  const importeDR =
                    traslado["@_ImporteDR"] || traslado["@_importeDR"] || 0;
                  const importeDRNum =
                    typeof importeDR === "string"
                      ? parseFloat(String(importeDR))
                      : importeDR;
                  iva += importeDRNum || 0;
                }
              }
            }
          }
        }
      }
    }

    return { total, subtotal, iva };
  }

  /**
   * Extrae el complemento de pago (versión 2.0)
   * En CFDI 4.0, la estructura es: Complemento -> pago20:Pagos -> pago20:Pago
   */
  private extractComplementoPago(
    comprobante: ComprobanteNode
  ): ComplementoPago | undefined {
    const complemento =
      comprobante["cfdi:Complemento"] || comprobante.Complemento;

    if (!complemento) {
      console.warn("[CFDI Parser] No se encontró nodo Complemento");
      return undefined;
    }

    // Estructura 1: pago20:Pagos directamente en Complemento (CFDI 4.0 - más común)
    let pagos20: Pagos20Node | undefined =
      complemento["pago20:Pagos"] ||
      complemento["pago:Pagos"] ||
      (complemento.Pagos && "pago20:Pago" in complemento.Pagos
        ? (complemento.Pagos as Pagos20Node)
        : undefined);

    // Estructura 2: pago20:ComplementoPago que contiene pago20:Pago (estructura alternativa)
    if (!pagos20) {
      const pago20Complemento =
        complemento["pago20:ComplementoPago"] ||
        complemento["pago:ComplementoPago"] ||
        complemento.ComplementoPago;

      if (pago20Complemento) {
        // Si encontramos ComplementoPago, buscar Pago dentro
        const pago =
          pago20Complemento["pago20:Pago"] ||
          pago20Complemento["pago:Pago"] ||
          pago20Complemento.Pago;

        if (pago) {
          // Convertir Pago a formato Pagos20Node para procesamiento uniforme
          pagos20 = {
            "pago20:Pago": Array.isArray(pago) ? pago : [pago],
          } as Pagos20Node;
        }
      }
    }

    if (!pagos20) {
      console.warn(
        "[CFDI Parser] No se encontró complemento de pago en ninguna variante"
      );
      console.log(
        "[CFDI Parser] Nodos disponibles en Complemento:",
        Object.keys(complemento)
      );
      return undefined;
    }

    console.log("[CFDI Parser] ✅ Pagos20 encontrado:", Object.keys(pagos20));

    // Buscar pago dentro de Pagos20Node
    const pago =
      pagos20["pago20:Pago"] ||
      (pagos20 as unknown as { Pago?: Pago20Node | Pago20Node[] }).Pago;

    if (!pago) {
      console.warn("[CFDI Parser] No se encontró Pago dentro de Pagos20Node");
      console.log(
        "[CFDI Parser] Nodos disponibles en Pagos20Node:",
        Object.keys(pagos20)
      );
      return undefined;
    }

    const pagoArray = Array.isArray(pago) ? pago : [pago];

    if (pagoArray.length === 0) {
      console.warn("[CFDI Parser] Array de pagos vacío");
      return undefined;
    }

    // Tomar el primer pago
    const primerPago = pagoArray[0];

    console.log(
      "[CFDI Parser] ✅ Primer pago encontrado, atributos:",
      Object.keys(primerPago)
    );

    const fechaPagoStr =
      primerPago["@_FechaPago"] || primerPago["@_fechaPago"] || "";

    if (!fechaPagoStr) {
      console.error(
        "[CFDI Parser] ❌ No se encontró FechaPago en el complemento. Atributos disponibles:",
        Object.keys(primerPago)
      );
      // Si no hay fecha de pago, lanzar error para que se use la fecha de timbrado como fallback
      throw new Error("No se encontró la fecha de pago en el complemento");
    }

    // La fecha viene en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss) o similar
    const fechaPago = new Date(fechaPagoStr);

    if (isNaN(fechaPago.getTime())) {
      console.error(`[CFDI Parser] ❌ Fecha de pago inválida: ${fechaPagoStr}`);
      throw new Error(`Fecha de pago inválida: ${fechaPagoStr}`);
    }

    console.log(
      `[CFDI Parser] ✅ Fecha de pago extraída: ${fechaPago.toISOString()} (string original: ${fechaPagoStr})`
    );

    const monto =
      typeof primerPago["@_Monto"] === "string"
        ? parseFloat(primerPago["@_Monto"])
        : primerPago["@_Monto"] || primerPago["@_monto"] || 0;

    // Buscar DoctoRelacionado en diferentes variantes
    const doctoRelacionado =
      primerPago["pago20:DoctoRelacionado"] ||
      primerPago["pago:DoctoRelacionado"] ||
      primerPago.DoctoRelacionado;

    const doctoRelacionadoArray = Array.isArray(doctoRelacionado)
      ? doctoRelacionado
      : doctoRelacionado
      ? [doctoRelacionado]
      : [];

    const primerDocto = doctoRelacionadoArray[0];

    const uuidRelacionado =
      primerDocto?.["@_IdDocumento"] || primerDocto?.["@_idDocumento"] || "";

    // NumParcialidad puede estar en el Pago o en el DoctoRelacionado
    const numParcialidadStr =
      primerPago["@_NumParcialidad"] ||
      primerPago["@_numParcialidad"] ||
      primerDocto?.["@_NumParcialidad"] ||
      primerDocto?.["@_numParcialidad"] ||
      "";

    const numParcialidad = numParcialidadStr
      ? parseInt(String(numParcialidadStr), 10)
      : undefined;

    return {
      fechaPago,
      uuidRelacionado,
      monto: typeof monto === "string" ? parseFloat(monto) : monto,
      numParcialidad,
    };
  }
}
