"use client";

import { useState, useMemo } from "react";
import { useInvoiceStore } from "@/store/invoice-store";
import { useExpenseStore } from "@/store/expense-store";
import { MetricsCards } from "./metrics-cards";
import { PendingInvoicesTable } from "./pending-invoices-table";
import { PaidInvoicesTable } from "./paid-invoices-table";
import { ExpensesTable } from "./expenses-table";
import { AllInvoicesTable } from "./all-invoices-table";
import { ExportPDFButton } from "./export-pdf-button";
import { SearchSummary } from "./search-summary";
import { calculateReport } from "@/lib/utils/report-calculator";
import { separarFacturasPorEstado } from "@/lib/utils/invoice-payment-status";
import { searchInvoices, searchExpenses } from "@/lib/utils/search-utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MESES } from "@/lib/types";
import type {
  Reporte,
  DashboardFilters as DashboardFiltersType,
} from "@/lib/types";

export function DashboardView() {
  const { invoices } = useInvoiceStore();
  const { gastos } = useExpenseStore();
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [año, setAño] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>("");

  const reporte: Reporte | null = useMemo(() => {
    if (invoices.length === 0 && gastos.length === 0) {
      return null;
    }
    return calculateReport(invoices, gastos, mes, año);
  }, [invoices, gastos, mes, año]);

  // Separar facturas por estado usando la nueva lógica
  const facturasSeparadas = useMemo(() => {
    if (!reporte) {
      return null;
    }
    return separarFacturasPorEstado(invoices, mes, año);
  }, [invoices, mes, año, reporte]);

  // Filtrar gastos del mes/año
  const gastosMes = useMemo(() => {
    return gastos.filter((g) => g.mes === mes && g.año === año);
  }, [gastos, mes, año]);

  // Aplicar búsqueda a cada categoría
  const facturasPendientesFiltradas = useMemo(() => {
    if (!facturasSeparadas) return [];
    const facturas = facturasSeparadas.facturasPendientes;
    return searchTerm ? searchInvoices(facturas, searchTerm) : facturas;
  }, [facturasSeparadas, searchTerm]);

  const facturasPagadasFiltradas = useMemo(() => {
    if (!facturasSeparadas) return [];
    const facturas = facturasSeparadas.facturasPagadas;
    return searchTerm ? searchInvoices(facturas, searchTerm) : facturas;
  }, [facturasSeparadas, searchTerm]);

  const gastosMesFiltrados = useMemo(() => {
    return searchTerm ? searchExpenses(gastosMes, searchTerm) : gastosMes;
  }, [gastosMes, searchTerm]);

  const todasLasFacturasFiltradas = useMemo(() => {
    if (!reporte) return [];
    return searchTerm
      ? searchInvoices(reporte.facturas, searchTerm)
      : reporte.facturas;
  }, [reporte, searchTerm]);

  // Calcular resumen de búsqueda
  const searchSummary = useMemo(() => {
    if (!searchTerm.trim()) {
      return null;
    }

    const sections = [
      { name: "Pendientes", count: facturasPendientesFiltradas.length },
      { name: "Pagadas", count: facturasPagadasFiltradas.length },
      { name: "Gastos", count: gastosMesFiltrados.length },
      { name: "Todas", count: todasLasFacturasFiltradas.length },
    ];

    const sectionsWithResults = sections.filter((s) => s.count > 0).length;
    const totalResults =
      facturasPendientesFiltradas.length +
      facturasPagadasFiltradas.length +
      gastosMesFiltrados.length +
      todasLasFacturasFiltradas.length;

    return {
      totalResults,
      sectionsWithResults,
      sections,
    };
  }, [
    searchTerm,
    facturasPendientesFiltradas.length,
    facturasPagadasFiltradas.length,
    gastosMesFiltrados.length,
    todasLasFacturasFiltradas.length,
  ]);

  const handleFilterChange = (filters: DashboardFiltersType) => {
    setMes(filters.mes);
    setAño(filters.año);
  };

  if (!reporte || !facturasSeparadas) {
    return (
      <div>
        {/* Header con título (sin botón cuando no hay datos) */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Visualiza tus métricas financieras y gestiona tus facturas
          </p>
        </div>

        {/* Filtros y Búsqueda unificados (versión sin datos) */}
        <div className="mb-6 bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Search className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🔍 Filtros y Búsqueda
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Selecciona el período y busca por UUID, RFC, nombre o concepto
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Filtro de Mes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span className="text-sm">📅</span>
                Mes
              </label>

              {/* CONTENEDOR CON ALTURA FIJA */}
              <div className="relative h-10 group">
                <select
                  value={mes}
                  onChange={(e) => {
                    const newMes = parseInt(e.target.value, 10);
                    setMes(newMes);
                    handleFilterChange({ mes: newMes, año });
                  }}
                  className="w-full h-full text-sm border-2 border-blue-300
                 focus:border-blue-500 focus:ring-3 focus:ring-blue-200
                 bg-white shadow-md hover:shadow-lg transition-all duration-200
                 rounded-md px-3 pr-10 appearance-none cursor-pointer"
                >
                  {MESES.map((mesNombre, index) => (
                    <option key={index} value={index + 1}>
                      {mesNombre}
                    </option>
                  ))}
                </select>

                {/* FLECHA */}
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4
                 text-blue-600 group-focus-within:text-blue-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span className="text-sm">📅</span>
                Mes
              </label>

              {/* CONTENEDOR CON ALTURA FIJA */}
              <div className="relative h-10 group">
                <select
                  value={mes}
                  onChange={(e) => {
                    const newMes = parseInt(e.target.value, 10);
                    setMes(newMes);
                    handleFilterChange({ mes: newMes, año });
                  }}
                  className="w-full h-full text-sm border-2 border-blue-300
                focus:border-blue-500 focus:ring-3 focus:ring-blue-200
                bg-white shadow-md hover:shadow-lg transition-all duration-200
                rounded-md px-3 pr-10 appearance-none cursor-pointer"
                >
                  {MESES.map((mesNombre, index) => (
                    <option key={index} value={index + 1}>
                      {mesNombre}
                    </option>
                  ))}
                </select>

                {/* FLECHA */}
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4
                text-blue-600 group-focus-within:text-blue-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            ``
            {/* Filtro de Año */}
            <div className="relative group">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <span className="text-sm">📆</span>
                Año
              </label>
              <Input
                type="number"
                value={año}
                onChange={(e) => {
                  const newAño = parseInt(e.target.value, 10);
                  setAño(newAño);
                  handleFilterChange({ mes, año: newAño });
                }}
                min="2020"
                max="2030"
                className="h-10 text-sm border-2 border-blue-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-200 bg-white shadow-md hover:shadow-lg transition-all duration-200"
              />
            </div>
            {/* Campo de Búsqueda */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span className="text-sm">🔎</span>
                Búsqueda
              </label>

              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 group-focus-within:text-blue-700 transition-colors" />

                <Input
                  type="text"
                  placeholder="UUID, RFC, nombre, concepto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 h-10 text-sm border-2 border-blue-300
                focus:border-blue-500 focus:ring-3 focus:ring-blue-200
                bg-white shadow-md hover:shadow-lg transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Indicadores de estado */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {!searchTerm && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="bg-white/60 px-2 py-1 rounded border border-gray-200 text-xs">
                  💡 Tip: Usa los filtros y búsqueda para encontrar información
                  rápidamente
                </span>
              </div>
            )}
            <div className="ml-auto text-xs text-gray-500">
              Período: {MESES[mes - 1]} {año}
            </div>
          </div>
        </div>

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
      {/* Header con título y botón de exportar */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Visualiza tus métricas financieras y gestiona tus facturas
          </p>
        </div>
        <div className="flex-shrink-0">
          <ExportPDFButton
            reporte={reporte}
            invoices={invoices}
            gastos={gastos}
          />
        </div>
      </div>

      {/* Filtros y Búsqueda unificados */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
            <Search className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              🔍 Filtros y Búsqueda
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Selecciona el período y busca por UUID, RFC, nombre o concepto
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Filtro de Mes */}
          <div className="relative group">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="text-sm">📅</span>
              Mes
            </label>
            <select
              value={mes}
              onChange={(e) => {
                const newMes = parseInt(e.target.value, 10);
                setMes(newMes);
                handleFilterChange({ mes: newMes, año });
              }}
              className="w-full h-10 text-sm border-2 border-blue-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-200 bg-white shadow-md hover:shadow-lg transition-all duration-200 rounded-md px-3 appearance-none cursor-pointer"
            >
              {MESES.map((mesNombre, index) => (
                <option key={index} value={index + 1}>
                  {mesNombre}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-[calc(1.5rem+0.375rem+1.25rem)] -translate-y-1/2 pointer-events-none">
              <svg
                className="h-4 w-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Filtro de Año */}
          <div className="relative group">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="text-sm">📆</span>
              Año
            </label>
            <Input
              type="number"
              value={año}
              onChange={(e) => {
                const newAño = parseInt(e.target.value, 10);
                setAño(newAño);
                handleFilterChange({ mes, año: newAño });
              }}
              min="2020"
              max="2030"
              className="h-10 text-sm border-2 border-blue-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-200 bg-white shadow-md hover:shadow-lg transition-all duration-200"
            />
          </div>

          {/* Campo de Búsqueda */}
          <div className="relative group">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="text-sm">🔎</span>
              Búsqueda
            </label>
            <Search className="absolute left-3 top-[calc(1.5rem+0.375rem+1.25rem)] -translate-y-1/2 h-4 w-4 text-blue-600 group-focus-within:text-blue-700 transition-colors" />
            <Input
              type="text"
              placeholder="UUID, RFC, nombre, concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 h-10 text-sm border-2 border-blue-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-200 bg-white shadow-md hover:shadow-lg transition-all duration-200"
            />
          </div>
        </div>

        {/* Indicadores de estado */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {searchTerm && (
            <div className="flex items-center gap-1.5 text-blue-700">
              <span className="font-semibold">Buscando:</span>
              <span className="bg-blue-100 px-2 py-1 rounded-md font-mono text-xs border border-blue-200">
                &quot;{searchTerm}&quot;
              </span>
              <span className="text-xs text-gray-500">
                ({searchSummary?.totalResults || 0} resultado
                {searchSummary?.totalResults !== 1 ? "s" : ""})
              </span>
            </div>
          )}
          {!searchTerm && (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="bg-white/60 px-2 py-1 rounded border border-gray-200 text-xs">
                💡 Tip: Usa los filtros y búsqueda para encontrar información
                rápidamente
              </span>
            </div>
          )}
          <div className="ml-auto text-xs text-gray-500">
            Período: {MESES[mes - 1]} {año}
          </div>
        </div>
      </div>

      {/* Resumen de búsqueda */}
      {searchSummary && (
        <SearchSummary
          searchTerm={searchTerm}
          totalResults={searchSummary.totalResults}
          sectionsWithResults={searchSummary.sectionsWithResults}
          onClear={() => setSearchTerm("")}
        />
      )}

      <MetricsCards reporte={reporte} />

      {/* Facturas Pendientes por Pagar (PPD no completamente pagadas) */}
      {/* Solo mostrar si no hay búsqueda o si hay resultados */}
      {(!searchTerm || facturasPendientesFiltradas.length > 0) && (
        <PendingInvoicesTable
          facturasPPD={facturasPendientesFiltradas}
          todasLasFacturas={invoices}
        />
      )}

      {/* Facturas Pagadas (PUE + PPD completamente pagadas) */}
      {/* Solo mostrar si no hay búsqueda o si hay resultados */}
      {(!searchTerm || facturasPagadasFiltradas.length > 0) && (
        <PaidInvoicesTable
          facturasPagadas={facturasPagadasFiltradas}
          todasLasFacturas={invoices}
        />
      )}

      {/* Gastos */}
      {/* Solo mostrar si no hay búsqueda o si hay resultados */}
      {(!searchTerm || gastosMesFiltrados.length > 0) && (
        <ExpensesTable gastos={gastosMesFiltrados} />
      )}

      {/* Todas las Facturas (vista completa) */}
      {/* Solo mostrar si no hay búsqueda o si hay resultados */}
      {(!searchTerm || todasLasFacturasFiltradas.length > 0) && (
        <AllInvoicesTable facturas={todasLasFacturasFiltradas} />
      )}

      {/* Mensaje cuando hay búsqueda pero no hay resultados */}
      {searchTerm && searchSummary && searchSummary.totalResults === 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">
            No se encontraron resultados para &quot;{searchTerm}&quot;
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Intenta con otro término de búsqueda o{" "}
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              limpia la búsqueda
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
