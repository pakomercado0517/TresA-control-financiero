"use client";

import { useState, useMemo } from "react";
import { useExpenseStore } from "@/store/expense-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  FileText,
  FileX,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { Gasto, GastoXML, GastoManual } from "@/lib/types";
import { MESES } from "@/lib/types";

type SortField = "fecha" | "monto" | "tipo" | "mes" | "año";
type SortDirection = "asc" | "desc";

export function ExpenseList() {
  const { gastos, removeExpense } = useExpenseStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [filterOrigen, setFilterOrigen] = useState<string>("");
  const today = new Date();
  const defaultMes = today.getMonth() + 1;
  const defaultAño = today.getFullYear();
  const [filterMes, setFilterMes] = useState<number | "">(defaultMes);
  const [filterAño, setFilterAño] = useState<number | "">(defaultAño);
  const [sortField, setSortField] = useState<SortField>("fecha");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filtrar y ordenar gastos
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...gastos];

    // Búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((g) => {
        const uuidMatch =
          "uuid" in g && g.uuid?.toLowerCase().includes(searchLower);
        const idMatch = g.id.toLowerCase().includes(searchLower);
        const rfcMatch =
          "rfcEmisor" in g && g.rfcEmisor?.toLowerCase().includes(searchLower);
        const nombreMatch =
          "nombreEmisor" in g &&
          g.nombreEmisor?.toLowerCase().includes(searchLower);
        const conceptoMatch = g.concepto?.toLowerCase().includes(searchLower);
        return uuidMatch || idMatch || rfcMatch || nombreMatch || conceptoMatch;
      });
    }

    // Filtros
    if (filterTipo) {
      filtered = filtered.filter((g) => g.tipo === filterTipo);
    }
    if (filterOrigen) {
      filtered = filtered.filter((g) => g.tipoOrigen === filterOrigen);
    }
    if (filterMes) {
      filtered = filtered.filter((g) => g.mes === filterMes);
    }
    if (filterAño) {
      filtered = filtered.filter((g) => g.año === filterAño);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "fecha":
          comparison = a.fecha.getTime() - b.fecha.getTime();
          break;
        case "monto":
          const montoA = "total" in a ? a.total : a.monto;
          const montoB = "total" in b ? b.total : b.monto;
          comparison = montoA - montoB;
          break;
        case "tipo":
          comparison = a.tipo.localeCompare(b.tipo);
          break;
        case "mes":
          comparison = a.mes - b.mes;
          break;
        case "año":
          comparison = a.año - b.año;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    gastos,
    searchTerm,
    filterTipo,
    filterOrigen,
    filterMes,
    filterAño,
    sortField,
    sortDirection,
  ]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedExpenses.slice(start, start + itemsPerPage);
  }, [filteredAndSortedExpenses, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterTipo("");
    setFilterOrigen("");
    setFilterMes("");
    setFilterAño("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || filterTipo || filterOrigen || filterMes || filterAño;

  const gastosXML = gastos.filter((g): g is GastoXML => g.tipoOrigen === "XML");
  const gastosManuales = gastos.filter(
    (g): g is GastoManual => g.tipoOrigen === "MANUAL",
  );

  if (gastos.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No hay gastos cargados aún</p>
        <p className="text-gray-500 text-sm mt-2">
          Sube archivos XML o ingresa gastos manualmente para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header con búsqueda y filtros */}
      <div className="px-6 py-4 border-b border-gray-200 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              Gastos Cargados ({filteredAndSortedExpenses.length} de{" "}
              {gastos.length})
            </h2>
            <div className="flex gap-4 text-sm text-gray-600 mt-1">
              <span>XML: {gastosXML.length}</span>
              <span>Manual: {gastosManuales.length}</span>
            </div>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por UUID, ID, RFC, nombre o concepto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Origen
            </label>
            <select
              value={filterOrigen}
              onChange={(e) => {
                setFilterOrigen(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              <option value="XML">XML</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filterTipo}
              onChange={(e) => {
                setFilterTipo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              <option value="PUE">PUE</option>
              <option value="PPD">PPD</option>
              <option value="COMPLEMENTO_PAGO">Complemento de Pago</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mes
            </label>
            <select
              value={filterMes}
              onChange={(e) => {
                setFilterMes(
                  e.target.value === "" ? "" : parseInt(e.target.value, 10),
                );
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              {MESES.map((mesNombre, index) => (
                <option key={index} value={index + 1}>
                  {mesNombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Año
            </label>
            <Input
              type="number"
              value={filterAño}
              onChange={(e) => {
                setFilterAño(
                  e.target.value === "" ? "" : parseInt(e.target.value, 10),
                );
                setCurrentPage(1);
              }}
              placeholder="Ej: 2024"
              className="text-sm"
              min="2020"
              max="2030"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Origen
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                UUID/ID
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort("fecha")}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  Fecha
                  {sortField === "fecha" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </button>
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort("tipo")}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  Tipo
                  {sortField === "tipo" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </button>
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort("monto")}
                  className="flex items-center gap-1 hover:text-gray-900 ml-auto"
                >
                  Monto
                  {sortField === "monto" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </button>
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Proveedor/Concepto
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort("mes")}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  Mes/Año
                  {sortField === "mes" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </button>
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Validación
              </th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No se encontraron gastos con los filtros aplicados
                </td>
              </tr>
            ) : (
              paginatedExpenses.map((gasto) => (
                <ExpenseRow
                  key={gasto.id}
                  gasto={gasto}
                  onRemove={removeExpense}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedExpenses.length,
            )}{" "}
            de {filteredAndSortedExpenses.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ExpenseRowProps {
  gasto: Gasto;
  onRemove: (id: string) => void;
}

function ExpenseRow({ gasto, onRemove }: ExpenseRowProps) {
  if (gasto.tipoOrigen === "MANUAL") {
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
            Manual
          </span>
        </td>
        <td className="px-6 py-4">
          <p className="font-mono text-xs text-gray-600">
            {gasto.id.substring(0, 12)}...
          </p>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {gasto.fecha.toLocaleDateString("es-MX")}
        </td>
        <td className="px-6 py-4">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              gasto.tipo === "PUE"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {gasto.tipo}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <p className="font-semibold text-gray-900">
            $
            {gasto.monto.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm text-gray-900">{gasto.concepto}</p>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {gasto.mes}/{gasto.año}
        </td>
        <td className="px-6 py-4">
          <span className="text-xs text-gray-400">-</span>
        </td>
        <td className="px-6 py-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(gasto.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </td>
      </tr>
    );
  }

  // Gasto XML
  const tipoColors = {
    PUE: "bg-green-100 text-green-700",
    PPD: "bg-yellow-100 text-yellow-700",
    COMPLEMENTO_PAGO: "bg-blue-100 text-blue-700",
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
          XML
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="font-mono text-xs text-gray-600">
          {gasto.uuid.substring(0, 8)}...
        </p>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {gasto.fecha.toLocaleDateString("es-MX")}
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            tipoColors[gasto.tipo]
          }`}
        >
          {gasto.tipo}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">
          $
          {gasto.total.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-900">{gasto.nombreEmisor || "N/A"}</p>
        <p className="text-xs text-gray-500">{gasto.rfcEmisor}</p>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {gasto.mes}/{gasto.año}
      </td>
      <td className="px-6 py-4">
        {gasto.validacion ? (
          <div className="flex flex-col gap-1">
            {gasto.validacion.rfcVerificado ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Verificado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                <AlertTriangle className="h-3 w-3" />
                Error RFC
              </span>
            )}
            {gasto.validacion.advertencias.length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 cursor-help"
                title={gasto.validacion.advertencias.join("; ")}
              >
                <Info className="h-3 w-3" />
                {gasto.validacion.advertencias.length} advertencia(s)
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">Sin validar</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(gasto.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
