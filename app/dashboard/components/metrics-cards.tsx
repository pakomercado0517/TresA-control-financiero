'use client';

import { DollarSign, TrendingUp, ShoppingCart, AlertCircle, TrendingDown } from 'lucide-react';
import type { Reporte } from '@/lib/types';

interface MetricsCardsProps {
  reporte: Reporte;
}

export function MetricsCards({ reporte }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Facturado',
      value: reporte.totalFacturado,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Total Pagado',
      value: reporte.totalPagado,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Total Compras',
      value: reporte.totalCompras,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Pendiente por Pagar',
      value: reporte.pendientePagar,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Diferencia Ingresos - Gastos',
      value: reporte.diferenciaIngresosGastos,
      icon: TrendingDown,
      color:
        reporte.diferenciaIngresosGastos >= 0
          ? 'text-green-600'
          : 'text-red-600',
      bgColor:
        reporte.diferenciaIngresosGastos >= 0
          ? 'bg-green-50'
          : 'bg-red-50',
      borderColor:
        reporte.diferenciaIngresosGastos >= 0
          ? 'border-green-200'
          : 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.bgColor} border-2 ${card.borderColor} rounded-lg p-6 shadow-sm`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">{card.title}</h3>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <p className={`text-2xl font-bold ${card.color}`}>
            ${card.value.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

