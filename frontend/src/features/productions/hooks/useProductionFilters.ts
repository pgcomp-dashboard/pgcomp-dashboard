import { useMemo, useState } from 'react';

export interface ProductionFilters {
  titulo: string;
  local: string;
  anoInicio: string;
  anoFim: string;
  tipo: string;
  origem: string;
  qualis: string;
}

const defaultFilters: ProductionFilters = {
  titulo: '',
  local: '',
  anoInicio: 'all',
  anoFim: 'all',
  tipo: 'all',
  origem: 'all',
  qualis: 'all',
};

type SortKey = 'titulo' | 'local' | 'year' | 'tipo' | 'origem' | 'pontuacao';

export function useProductionFilters() {
  const [filters, setFilters] = useState<ProductionFilters>(defaultFilters);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: 'asc' | 'desc';
  }>({ key: 'year', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => setFilters(defaultFilters);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const hasActiveFilters = useMemo(
    () => Object.entries(filters).some(([key, value]) => {
      if (key === 'titulo' || key === 'local') return value.trim() !== '';
      return value !== 'all';
    }),
    [filters],
  );

  return {
    filters,
    setFilters,
    clearFilters,
    sortConfig,
    handleSort,
    showFilters,
    setShowFilters,
    hasActiveFilters,
  };
}
