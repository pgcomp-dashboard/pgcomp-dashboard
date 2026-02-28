import { queryClient } from '@/lib/query-client';
import { productionService } from '@/services/modules/production.service';
import { Production } from '@/types/academic';
import { normalizeDoi } from '@/utils/doi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { RequestBodyType, updateProductionFormSchema } from '../types';
import { usePublisherSearch } from './usePublisherSearch';

export function useProductionCrud(selectedProfessorId: string) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production>();
  const publisherSearch = usePublisherSearch();

  const editForm = useForm<z.infer<typeof updateProductionFormSchema>>({
    resolver: zodResolver(updateProductionFormSchema),
  });

  const openEdit = (production: Production) => {
    setSelectedProduction(production);
    editForm.reset({
      title: production.title,
      year: production.year,
      doi: production.doi || '',
      nature: production.nature || '',
    });
    publisherSearch.reset(
      production.publisher || null,
      production.publisher_type || 'conference',
      production.publisher?.name || '',
    );
    setIsEditOpen(true);
  };

  async function onEditSubmit(values: z.infer<typeof updateProductionFormSchema>) {
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear) || !selectedProduction) return;

    const payload: RequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: publisherSearch.publisher?.publisher_type || null,
      publisher_id: publisherSearch.publisher?.id || null,
      stratum_qualis_id: publisherSearch.publisher?.stratum_qualis_id || null,
      doi: normalizeDoi(values.doi),
      nature: values.nature || null,
    };

    try {
      if (selectedProfessorId && selectedProfessorId !== 'own') {
        await productionService.updateUserProduction(Number(selectedProfessorId), selectedProduction.id, payload);
      } else {
        await productionService.updateProduction(selectedProduction.id, payload);
      }
      toast.success('Atualizado com sucesso');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['productions', selectedProfessorId] });
    } catch {
      toast.error('Erro ao editar publicação.');
    }
  }

  async function deleteProduction(id: number) {
    try {
      const response = selectedProfessorId && selectedProfessorId !== 'own'
        ? await productionService.deleteUserProduction(Number(selectedProfessorId), id)
        : await productionService.deleteProduction(id);
      if (Number(response.status) === 200) {
        toast.success('Produção deletada com sucesso.');
        queryClient.invalidateQueries({ queryKey: ['productions', selectedProfessorId] });
      }
    } catch {
      toast.error('Erro ao deletar a produção.');
    }
  }

  async function fullDelete() {
    try {
      const response = selectedProfessorId && selectedProfessorId !== 'own'
        ? await productionService.clearUserProductions(Number(selectedProfessorId))
        : await productionService.clearProductions();
      if (Number(response.status) === 200) {
        toast.success('Produções deletadas com sucesso.');
        queryClient.invalidateQueries({ queryKey: ['productions', selectedProfessorId] });
      }
    } catch {
      toast.error('Erro ao deletar produções.');
    }
  }

  return {
    isEditOpen,
    setIsEditOpen,
    selectedProduction,
    setSelectedProduction,
    openEdit,
    onEditSubmit,
    deleteProduction,
    fullDelete,
    editForm,
    editState: {
      publisher: publisherSearch.publisher,
      type: publisherSearch.publisherType,
      search: publisherSearch.publisherSearch,
      isSearching: publisherSearch.isSearching,
      results: publisherSearch.searchResults,
      showResults: publisherSearch.showResults,
      setShowResults: publisherSearch.setShowResults,
      handleInput: publisherSearch.handleInput,
      handleTypeChange: publisherSearch.handleTypeChange,
      handleSelect: publisherSearch.handleSelect,
      isCreatingNew: publisherSearch.isCreatingNew,
      setIsCreatingNew: publisherSearch.setIsCreatingNew,
      isSubmittingNew: publisherSearch.isSubmittingNew,
      qualisOptions: publisherSearch.qualisOptions,
      newPublisherData: publisherSearch.newPublisherData,
      setNewPublisherData: publisherSearch.setNewPublisherData,
      handleCreateNew: publisherSearch.handleCreateNew,
    },
  };
}
