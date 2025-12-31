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
import { DashboardFilters } from "./DashboardFilters";

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
        <DashboardFilters
          mes={mes}
          año={año}
          searchTerm={searchTerm}
          onMesChange={(m) => {
            setMes(m);
            handleFilterChange({ mes: m, año });
          }}
          onAñoChange={(a) => {
            setAño(a);
            handleFilterChange({ mes, año: a });
          }}
          onSearchChange={setSearchTerm}
        />

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
        <div className="shrink-0">
          <ExportPDFButton
            reporte={reporte}
            invoices={invoices}
            gastos={gastos}
          />
        </div>
      </div>

      {/* Filtros y Búsqueda unificados */}
      <DashboardFilters
        mes={mes}
        año={año}
        searchTerm={searchTerm}
        onMesChange={(m) => {
          setMes(m);
          handleFilterChange({ mes: m, año });
        }}
        onAñoChange={(a) => {
          setAño(a);
          handleFilterChange({ mes, año: a });
        }}
        onSearchChange={setSearchTerm}
      />

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
