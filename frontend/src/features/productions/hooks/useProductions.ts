import useAuth from '@/hooks/auth';
import { queryClient } from '@/lib/query-client';
import { productionService } from '@/services/modules/production.service';
import { professorService } from '@/services/modules/professor.service';
import { publisherService } from '@/services/modules/publisher.service';
import { qualisService } from '@/services/modules/qualis.service';
import { Production, Publisher, StratumQualis } from '@/types/academic';
import { normalizeDoi } from '@/utils/doi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { FormType, RequestBodyType, updateProductionFormSchema } from '../types';


export function useProductions() {
  const date = new Date();
  const auth = useAuth();
  const [ searchParams, setSearchParams ] = useSearchParams();
  const paramProfessorId = searchParams.get('professorId');

  const [ isEditOpen, setIsEditOpen ] = useState(false);
  const [ selectedProduction, setSelectedProduction ] = useState<Production>();
  const [ chosenForm, setChosenForm ] = useState<FormType>('none');
  const [ showFilters, setShowFilters ] = useState(false);
  const [ isPending, startTransition ] = useTransition();

  // Edit Publisher States
  const [ editPublisher, setEditPublisher ] = useState<Publisher | null>(null);
  const [ editPublisherType, setEditPublisherType ] = useState('conference');
  const [ editPublisherSearch, setEditPublisherSearch ] = useState('');
  const [ isEditSearching, setIsEditSearching ] = useState(false);
  const [ editSearchResults, setEditSearchResults ] = useState<Publisher[]>([]);
  const [ showEditResults, setShowEditResults ] = useState(false);
  const isEditSelectedRef = useRef(false);

  // Filtros
  const [ filters, setFilters ] = useState({
    titulo: '',
    local: '',
    anoInicio: 'all',
    anoFim: 'all',
    tipo: 'all',
    origem: 'all',
    qualis: 'all',
  });

  // Ordenação
  const [ sortConfig, setSortConfig ] = useState<{
    key: 'titulo' | 'local' | 'year' | 'tipo' | 'origem' | 'pontuacao';
    direction: 'asc' | 'desc';
  }>({ key: 'year', direction: 'desc' });

  // Admin states
  const [ selectedProfessorId, setSelectedProfessorId ] = useState<string>(
    paramProfessorId || 'own',
  );

  // Debounced search logic for Edit
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (editPublisherSearch.length >= 2 && !isEditSelectedRef.current) {
        setIsEditSearching(true);
        try {
          const response = await publisherService.searchPublishers({
            page: 1,
            per_page: 20,
            filter: {
              name: editPublisherSearch,
              publisher_type: editPublisherType,
            }
          });
          setEditSearchResults(response.data);
          setShowEditResults(true);
        } catch (err) {
          console.error('Erro ao buscar veículos:', err);
        } finally {
          setIsEditSearching(false);
        }
      } else {
        setEditSearchResults([]);
        setShowEditResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [ editPublisherSearch, editPublisherType ]);

  const { data: qualisData } = useQuery({
    queryKey: [ 'qualis' ],
    queryFn: () => qualisService.getAllQualis(),
  });

  const qualisList = useMemo(() => qualisData || [], [ qualisData ]);

  const { data: professorsData } = useQuery({
    queryKey: [ 'professors' ],
    queryFn: () => professorService.fetchProfessors({ paginate: 'false' }),
    enabled: !!auth?.isAdmin,
  });

  const professorsList = useMemo(() => professorsData?.data || [], [professorsData]);

  const { data, isLoading, error } = useQuery<Production[], Error>({
    queryKey: [ 'productions', selectedProfessorId ],
    queryFn: () => {
      if (auth?.isAdmin && selectedProfessorId && selectedProfessorId !== 'own') {
        return productionService.getUserProductions(Number(selectedProfessorId));
      }
      return productionService.getProductions();
    },
  });

  const qualisMap = useMemo(() => {
    const map = new Map<number, StratumQualis>();
    qualisList.forEach((q) => map.set(q.id, q));
    return map;
  }, [ qualisList ]);

  const baseProductions = useMemo(() => {
    if (!data) return [];
    const entries = Object.entries(data)
      .filter(([ key ]) => !isNaN(Number(key)))
      .map(([ , value ]) => value as unknown as Production);

    return [ ...entries ].sort((a, b) => b.year - a.year);
  }, [ data ]);

  const totalScore = useMemo(() => {
    if (qualisList.length === 0) return 0;
    const currentYear = date.getFullYear();
    const validList = baseProductions.filter((item) => {
      return item.year >= currentYear - 4 && item.year <= currentYear - 1;
    });

    return validList.reduce((accumulator, production) => {
      const qId = production.publisher?.stratum_qualis?.id;
      if (qId) {
        const qualis = qualisMap.get(qId);
        return accumulator + (qualis ? qualis.score : 0);
      }
      return accumulator;
    }, 0);
  }, [ baseProductions, qualisMap, date ]);

  const filteredAndSortedProductions = useMemo(() => {
    let result = [ ...baseProductions ];

    if (filters.titulo && filters.titulo.trim() !== '') {
      const searchTerm = filters.titulo.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(searchTerm));
    }
    if (filters.local && filters.local.trim() !== '') {
      const searchTerm = filters.local.toLowerCase();
      result = result.filter((p) => {
        const publisherName = p.publisher?.name || '';
        return publisherName.toLowerCase().includes(searchTerm);
      });
    }
    if (filters.anoInicio && filters.anoInicio !== 'all') {
      result = result.filter((p) => p.year >= parseInt(filters.anoInicio));
    }
    if (filters.anoFim && filters.anoFim !== 'all') {
      result = result.filter((p) => p.year <= parseInt(filters.anoFim));
    }
    if (filters.tipo && filters.tipo !== 'all') {
      result = result.filter((p) => p.publisher_type === filters.tipo);
    }
    if (filters.origem && filters.origem !== 'all') {
      result = result.filter((p) => p.source === filters.origem);
    }
    if (filters.qualis && filters.qualis !== 'all') {
      result = result.filter((p) => {
        const qualis = qualisList.find((q) => q.id === p.publisher?.stratum_qualis?.id);
        return qualis?.code === filters.qualis;
      });
    }

    result.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortConfig.key) {
        case 'titulo':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'local':
          aValue = (a.publisher?.name || '').toLowerCase();
          bValue = (b.publisher?.name || '').toLowerCase();
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'tipo':
          aValue = a.publisher_type || '';
          bValue = b.publisher_type || '';
          break;
        case 'origem':
          aValue = a.source || '';
          bValue = b.source || '';
          break;
        case 'pontuacao':
          aValue = qualisList.find((q) => q.id === a.publisher?.stratum_qualis?.id)?.score || 0;
          bValue = qualisList.find((q) => q.id === b.publisher?.stratum_qualis?.id)?.score || 0;
          break;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [ baseProductions, qualisList, filters, sortConfig ]);

  const hasActiveFilters = Object.entries(filters).some(([ key, value ]) => {
    if (key === 'titulo' || key === 'local') {
      return value.trim() !== '';
    }
    return value !== 'all';
  });

  const clearFilters = () => {
    setFilters({
      titulo: '',
      local: '',
      anoInicio: 'all',
      anoFim: 'all',
      tipo: 'all',
      origem: 'all',
      qualis: 'all',
    });
  };

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const uniqueYears = useMemo(() => {
    const years = new Set(baseProductions.map((p) => p.year));
    const currentYear = date.getFullYear();
    for (let y = currentYear - 10; y <= currentYear; y++) {
      years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [ baseProductions, date ]);

  const filteredScore = useMemo(() => {
    return filteredAndSortedProductions.reduce((accumulator, production) => {
      const qId = production.publisher?.stratum_qualis?.id;
      if (qId) {
        const qualis = qualisMap.get(qId);
        return accumulator + (qualis ? qualis.score : 0);
      }
      return accumulator;
    }, 0);
  }, [ filteredAndSortedProductions, qualisMap ]);

  async function onEditSubmit(values: z.infer<typeof updateProductionFormSchema>) {
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) return;

    const payload: RequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: editPublisher?.publisher_type || null,
      publisher_id: editPublisher?.id || null,
      stratum_qualis_id: editPublisher?.stratum_qualis_id || null,
      doi: values.doi ?? null,
    };

    try {
      if (selectedProduction) {
        payload.doi = normalizeDoi(values.doi);

        if (selectedProfessorId && selectedProfessorId !== 'own') {
          await productionService.updateUserProduction(Number(selectedProfessorId), selectedProduction.id, payload);
        } else {
          await productionService.updateProduction(selectedProduction.id, payload);
        }

        toast.success('Atualizado com sucesso');
        setIsEditOpen(false);
        queryClient.invalidateQueries({ queryKey: [ 'productions', selectedProfessorId ] });
      }
    } catch (err) {
      console.error('Erro ao editar publicação:', err);
    }
  }

  async function deleteProduction(id: number) {
    try {
      const response = selectedProfessorId && selectedProfessorId !== 'own'
        ? await productionService.deleteUserProduction(Number(selectedProfessorId), id)
        : await productionService.deleteProduction(id);

      const status = Number(response.status);
      if (status === 200) {
        toast.success("Produção deletada com sucesso.");
        queryClient.invalidateQueries({ queryKey: ["productions", selectedProfessorId] });
      }
    } catch (err) {
      console.error("Erro ao deletar a produção:", err);
      toast.error("Erro ao deletar a produção.");
    }
  }

  async function fullDelete() {
    try {
      const response = selectedProfessorId && selectedProfessorId !== 'own'
        ? await productionService.clearUserProductions(Number(selectedProfessorId))
        : await productionService.clearProductions();

      const status = Number(response.status);
      if (status === 200) {
        toast.success("Produções deletadas com sucesso.");
        queryClient.invalidateQueries({ queryKey: ["productions", selectedProfessorId] });
      }
    } catch {
      toast.error("Erro ao deletar produções.");
    }
  }

  const editForm = useForm<z.infer<typeof updateProductionFormSchema>>({
    resolver: zodResolver(updateProductionFormSchema),
    defaultValues: {
      title: selectedProduction?.title,
      year: selectedProduction?.year,
      doi: selectedProduction?.doi || undefined,
    },
  });

  useEffect(() => {
    if (selectedProduction && isEditOpen) {
      editForm.reset({
        title: selectedProduction.title,
        year: selectedProduction.year,
        doi: selectedProduction.doi || '',
      });
      setEditPublisher(selectedProduction.publisher || null);
      setEditPublisherType(selectedProduction.publisher_type || 'conference');
      setEditPublisherSearch(selectedProduction.publisher?.name || '');
      isEditSelectedRef.current = !!selectedProduction.publisher;
    }
  }, [ selectedProduction, isEditOpen, editForm ]);

  const handleEditPublisherInput = (e: ChangeEvent<HTMLInputElement>) => {
    isEditSelectedRef.current = false;
    setEditPublisherSearch(e.target.value);
    setEditPublisher(null);
  };

  const handleEditPublisherTypeChange = (value: string) => {
    setEditPublisherType(value);
    setEditPublisher(null);
    setEditSearchResults([]);
    setEditPublisherSearch('');
  };

  const handleSelectEditPublisher = (p: Publisher) => {
    setEditPublisher(p);
    isEditSelectedRef.current = true;
    setEditPublisherSearch(p.name);
    setShowEditResults(false);
  };

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
    error,
    totalScore,
    filteredScore,
    hasActiveFilters,
    filteredAndSortedProductions,
    filters,
    setFilters,
    sortConfig,
    handleSort,
    clearFilters,
    uniqueYears,
    showFilters,
    setShowFilters,
    chosenForm,
    setChosenForm,
    selectedProduction,
    setSelectedProduction,
    isEditOpen,
    setIsEditOpen,
    onEditSubmit,
    deleteProduction,
    fullDelete,
    selectedProfessorId,
    handleProfessorChange,
    professorsList,
    qualisList,
    editForm,
    editState: {
      publisher: editPublisher,
      type: editPublisherType,
      search: editPublisherSearch,
      isSearching: isEditSearching,
      results: editSearchResults,
      showResults: showEditResults,
      setShowResults: setShowEditResults,
      handleInput: handleEditPublisherInput,
      handleTypeChange: handleEditPublisherTypeChange,
      handleSelect: handleSelectEditPublisher,
    },
  };
}
