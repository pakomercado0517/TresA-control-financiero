"use client";

import { useState } from "react";
import { CFDIParser } from "@/lib/xml-parser";
import type { CFDI } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Upload, FileX, CheckCircle2 } from "lucide-react";

export default function TestParserPage() {
  const [resultado, setResultado] = useState<CFDI | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState<string>("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validar que sea XML
    if (
      !file.name.endsWith(".xml") &&
      file.type !== "application/xml" &&
      file.type !== "text/xml"
    ) {
      setError("Por favor, selecciona un archivo XML válido");
      setResultado(null);
      return;
    }

    setNombreArchivo(file.name);
    setError(null);
    setResultado(null);
    setIsLoading(true);

    try {
      const parser = new CFDIParser();
      const cfdi = await parser.parseXML(file);
      setResultado(cfdi);
      console.log(cfdi);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error desconocido al parsear XML"
      );
      setResultado(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name.endsWith(".xml") &&
      file.type !== "application/xml" &&
      file.type !== "text/xml"
    ) {
      setError("Por favor, arrastra un archivo XML válido");
      setResultado(null);
      return;
    }

    setNombreArchivo(file.name);
    setError(null);
    setResultado(null);
    setIsLoading(true);

    try {
      const parser = new CFDIParser();
      const cfdi = await parser.parseXML(file);
      setResultado(cfdi);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error desconocido al parsear XML"
      );
      setResultado(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Prueba del Parser CFDI</h1>

      {/* Área de carga */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-primary transition-colors"
      >
        <input
          type="file"
          accept=".xml,application/xml,text/xml"
          onChange={handleFileChange}
          className="hidden"
          id="xml-file-input"
          disabled={isLoading}
        />
        <label
          htmlFor="xml-file-input"
          className="cursor-pointer flex flex-col items-center gap-4"
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-gray-600 mb-2">
              Arrastra un archivo XML aquí o haz clic para seleccionar
            </p>
            <Button type="button" variant="outline" disabled={isLoading}>
              {isLoading ? "Procesando..." : "Seleccionar archivo XML"}
            </Button>
          </div>
        </label>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700">Procesando archivo: {nombreArchivo}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
          <FileX className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Resultado exitoso */}
      {resultado && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-green-700 font-semibold">
              XML parseado correctamente
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Resumen</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">UUID</p>
                <p className="font-mono text-sm">{resultado.uuid}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-semibold">{resultado.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p>{resultado.fecha.toLocaleDateString("es-MX")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold">
                  $
                  {resultado.total.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subtotal</p>
                <p>
                  $
                  {resultado.subtotal.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IVA</p>
                <p>
                  $
                  {resultado.iva.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Emisor</p>
                <p className="text-sm">{resultado.nombreEmisor || "N/A"}</p>
                <p className="text-xs text-gray-400">{resultado.rfcEmisor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Receptor</p>
                <p className="text-sm">{resultado.nombreReceptor || "N/A"}</p>
                <p className="text-xs text-gray-400">{resultado.rfcReceptor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mes/Año</p>
                <p>
                  {resultado.mes}/{resultado.año}
                </p>
              </div>
            </div>
          </div>

          {/* Pagos (si aplica) */}
          {resultado.pagos && resultado.pagos.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Pagos</h2>
              <div className="space-y-2">
                {resultado.pagos.map((pago, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded p-3"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Fecha</p>
                        <p>{pago.fechaPago.toLocaleDateString("es-MX")}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Monto</p>
                        <p className="font-semibold">
                          $
                          {pago.monto.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Forma de Pago</p>
                        <p>{pago.formaPago || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Parcialidad</p>
                        <p>{pago.numParcialidad || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complemento de Pago (si aplica) */}
          {resultado.complementoPago && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Complemento de Pago</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha de Pago</p>
                  <p>
                    {resultado.complementoPago.fechaPago.toLocaleDateString(
                      "es-MX"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto</p>
                  <p className="font-semibold">
                    $
                    {resultado.complementoPago.monto.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">UUID Relacionado</p>
                  <p className="font-mono text-xs">
                    {resultado.complementoPago.uuidRelacionado}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parcialidad</p>
                  <p>{resultado.complementoPago.numParcialidad || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* JSON completo */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">JSON Completo</h2>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
