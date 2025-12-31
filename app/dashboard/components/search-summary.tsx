'use client';

import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';

interface SearchSummaryProps {
  searchTerm: string;
  totalResults: number;
  sectionsWithResults: number;
  onClear: () => void;
}

export function SearchSummary({
  searchTerm,
  totalResults,
  sectionsWithResults,
  onClear,
}: SearchSummaryProps) {
  if (!searchTerm.trim()) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Search className="h-5 w-5 text-blue-700 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900">
              Búsqueda: <span className="font-normal">"{searchTerm}"</span>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado
              {totalResults !== 1 ? 's' : ''} en {sectionsWithResults} sección
              {sectionsWithResults !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
        >
          <X className="h-4 w-4" />
          Limpiar búsqueda
        </Button>
      </div>
    </div>
  );
}

