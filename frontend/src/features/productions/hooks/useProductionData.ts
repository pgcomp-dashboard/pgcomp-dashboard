import useAuth from '@/hooks/auth';
import { productionService } from '@/services/modules/production.service';
import { professorService } from '@/services/modules/professor.service';
import { qualisService } from '@/services/modules/qualis.service';
import { Production, StratumQualis } from '@/types/academic';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useTransition } from 'react';
import { useSearchParams } from 'react-router';
import { ProductionFilters } from './useProductionFilters';

interface UseProductionDataOptions {
  filters: ProductionFilters;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
}

export function useProductionData({ filters, sortConfig }: UseProductionDataOptions) {

  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramProfessorId = searchParams.get('professorId');
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>(paramProfessorId || 'own');
  const [isPending, startTransition] = useTransition();

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: qualisData } = useQuery({
    queryKey: ['qualis'],
    queryFn: () => qualisService.getAllQualis(),
  });
  const qualisList = useMemo(() => qualisData || [], [qualisData]);

  const { data: professorsData } = useQuery({
    queryKey: ['professors', 'full'],
    queryFn: () => professorService.fetchProfessors({ paginate: 'false' }),
    enabled: !!auth?.isAdmin,
  });
  const professorsList = useMemo(() => professorsData?.data || [], [professorsData]);

  const { data: rawData, isLoading } = useQuery<Production[], Error>({
    queryKey: ['productions', selectedProfessorId],
    queryFn: () => {
      if (auth?.isAdmin && selectedProfessorId && selectedProfessorId !== 'own') {
        return productionService.getUserProductions(Number(selectedProfessorId));
      }
      return productionService.getProductions();
    },
    enabled: !!auth?.isAuthenticated,
  });

  // ── Derived data ──────────────────────────────────────────────────────────

  const qualisMap = useMemo(() => {
    const map = new Map<number, StratumQualis>();
    qualisList.forEach((q) => map.set(q.id, q));
    return map;
  }, [qualisList]);

  const baseProductions = useMemo(() => {
    if (!rawData) return [];
    return Object.entries(rawData)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => value as unknown as Production)
      .sort((a, b) => b.year - a.year);
  }, [rawData]);

  const uniqueYears = useMemo(() => {
    const years = new Set(baseProductions.map((p) => p.year));
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 10; y <= currentYear; y++) years.add(y);
    return Array.from(years).sort((a, b) => b - a);
  }, [baseProductions]);

  const filteredAndSortedProductions = useMemo(() => {
    let result = [...baseProductions];

    if (filters.titulo.trim()) result = result.filter((p) => p.title.toLowerCase().includes(filters.titulo.toLowerCase()));
    if (filters.local.trim()) result = result.filter((p) => (p.publisher?.name || '').toLowerCase().includes(filters.local.toLowerCase()));
    if (filters.anoInicio !== 'all') result = result.filter((p) => p.year >= parseInt(filters.anoInicio));
    if (filters.anoFim !== 'all') result = result.filter((p) => p.year <= parseInt(filters.anoFim));
    if (filters.tipo !== 'all') result = result.filter((p) => p.publisher_type === filters.tipo);
    if (filters.origem !== 'all') result = result.filter((p) => p.source === filters.origem);
    if (filters.qualis !== 'all') result = result.filter((p) => {
      const q = qualisList.find((q) => q.id === p.publisher?.stratum_qualis?.id);
      return q?.code === filters.qualis;
    });

    result.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;
      switch (sortConfig.key) {
        case 'titulo': aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); break;
        case 'local': aVal = (a.publisher?.name || '').toLowerCase(); bVal = (b.publisher?.name || '').toLowerCase(); break;
        case 'year': aVal = a.year; bVal = b.year; break;
        case 'tipo': aVal = a.publisher_type || ''; bVal = b.publisher_type || ''; break;
        case 'origem': aVal = a.source || ''; bVal = b.source || ''; break;
        case 'pontuacao':
          aVal = qualisList.find((q) => q.id === a.publisher?.stratum_qualis?.id)?.score || 0;
          bVal = qualisList.find((q) => q.id === b.publisher?.stratum_qualis?.id)?.score || 0;
          break;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [baseProductions, qualisList, filters, sortConfig]);



  const filteredScore = useMemo(() =>
    filteredAndSortedProductions.reduce(
      (acc, p) => acc + (qualisMap.get(p.publisher?.stratum_qualis?.id ?? -1)?.score ?? 0), 0,
    ),
    [filteredAndSortedProductions, qualisMap],
  );

  const handleProfessorChange = (value: string) => {
    startTransition(() => {
      setSelectedProfessorId(value);
      if (value === 'own') {
        searchParams.delete('professorId');
        setSearchParams(searchParams);
      } else {
        setSearchParams({ professorId: value });
      }
    });
  };

  return {
    auth,
    isLoading,
    isPending,
    qualisList,
    professorsList,
    uniqueYears,
    baseProductions,
    filteredAndSortedProductions,
    filteredScore,
    selectedProfessorId,
    handleProfessorChange,
  };
}
