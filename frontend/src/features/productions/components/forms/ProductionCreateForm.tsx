import { queryClient } from '@/lib/query-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormErrorToast } from '@/hooks/useFormErrorToast';
import { productionService } from '@/services/modules/production.service';
import { normalizeDoi } from '@/utils/doi';
import { usePublisherSearch } from '../../hooks/usePublisherSearch';
import { CreateRequestBodyType, createProductionFormSchema } from '../../types';

interface ProductionCreateFormProps {
  professorId?: string;
  onSuccess?: () => void;
}

export function ProductionCreateForm({ professorId, onSuccess }: ProductionCreateFormProps) {
  const {
    publisher,
    publisherType,
    publisherSearch,
    isSearching,
    searchResults,
    showResults,
    handleInput,
    handleTypeChange,
    handleSelect,
    setShowResults,
    isCreatingNew,
    setIsCreatingNew,
    isSubmittingNew,
    qualisOptions,
    newPublisherData,
    setNewPublisherData,
    handleCreateNew,
  } = usePublisherSearch();

  const filteredQualis = useMemo(() => {
    return qualisOptions.filter((q: any) => q.type === publisherType);
  }, [qualisOptions, publisherType]);

  // Sync newPublisherData.name with search input when starting to create
  useEffect(() => {
    if (isCreatingNew && !newPublisherData.name) {
      setNewPublisherData((prev: any) => ({ ...prev, name: publisherSearch }));
    }
  }, [isCreatingNew, publisherSearch]);

  const form = useForm<z.infer<typeof createProductionFormSchema>>({
    resolver: zodResolver(createProductionFormSchema),
    defaultValues: {
      title: '',
      year: 0,
      nature: '',
    },
  });

  useFormErrorToast(form.formState.errors);

  async function onSubmit(values: z.infer<typeof createProductionFormSchema>) {
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) return;

    const payload: CreateRequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: publisher?.publisher_type || null,
      publisher_id: publisher?.id || null,
      doi: normalizeDoi(values.doi),
      nature: values.nature || null,
    };

    try {
      if (professorId && professorId !== 'own') {
        await productionService.createUserProduction(Number(professorId), payload);
      } else {
        await productionService.createProduction(payload);
      }
      toast.success('Produção Criada com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['productions', professorId || 'own'] });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Erro ao criar Produção');
      console.error('Erro ao criar produção:', err);
    }
  }

  async function handleCreateNewPublisher() {
    try {
      await handleCreateNew();
      toast.success('Veículo criado com sucesso (pendente de aprovação)');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar veículo');
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col gap-4 w-full max-lg:max-w-lg">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">Adicionar manualmente</h2>
          <p className="text-sm text-muted-foreground mt-1">Preencha os dados da produção</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Tipo de publicação</Label>
          <RadioGroup
            className="flex gap-4"
            defaultValue="conference"
            onValueChange={handleTypeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="conference" id="manual-conference" />
              <Label htmlFor="manual-conference" className="font-normal cursor-pointer">
                Conferência
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="journal" id="manual-journal" />
              <Label htmlFor="manual-journal" className="font-normal cursor-pointer">
                Periódico
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da produção</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Digite o título" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2024" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DOI (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ex: 10.1590/xyz or http://dx.doi.org/..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Natureza</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ex: Completo, Resumo, etc."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-3 p-4 bg-muted/30 rounded-lg relative">
              <Label className="text-sm">
                Buscar {publisherType === 'journal' ? 'Periódico' : 'Conferência'}
              </Label>
              <div className="relative">
                <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </div>
                <Input
                  placeholder={
                    publisherType === 'journal'
                      ? 'Buscar pelo nome ou ISSN...'
                      : 'Buscar pelo nome ou sigla (ex: SBBD)...'
                  }
                  type="text"
                  value={publisherSearch}
                  onChange={handleInput}
                  className="pl-9 h-10"
                />
                {showResults && !isSearching && searchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b last:border-0 transition-colors"
                        onClick={() => handleSelect(p)}
                      >
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>
                            {p.publisher_type === 'journal'
                              ? `ISSN: ${p.issns?.join(', ') || 'N/A'}`
                              : `Sigla: ${p.initials || 'N/A'}`}
                          </span>
                          <span className="font-semibold text-primary">
                            Qualis: {p.stratum_qualis?.code || 'N/A'}
                          </span>
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-primary font-medium flex items-center transition-colors border-t"
                      onClick={() => {
                        setIsCreatingNew(true);
                        setShowResults(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Não encontrou? Criar novo
                    </button>
                  </div>
                )}

                {showResults && !isSearching && searchResults.length === 0 && publisherSearch.length >= 2 && !isCreatingNew && (
                  <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Nenhum veículo encontrado</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingNew(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar novo {publisherType === 'journal' ? 'Periódico' : 'Conferência'}
                    </Button>
                  </div>
                )}
              </div>

              {isCreatingNew && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-primary">Novo {publisherType === 'journal' ? 'Periódico' : 'Conferência'}</h4>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCreatingNew(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Nome</Label>
                    <Input
                      placeholder="Nome completo"
                      className="h-8 text-sm"
                      value={newPublisherData.name}
                      onChange={(e) => setNewPublisherData({ ...newPublisherData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{publisherType === 'journal' ? 'ISSN' : 'Sigla (Opcional)'}</Label>
                    <Input
                      placeholder={publisherType === 'journal' ? "0000-0000" : "Ex: SBBD"}
                      className="h-8 text-sm"
                      value={newPublisherData.code}
                      onChange={(e) => setNewPublisherData({ ...newPublisherData, code: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Qualis (Opcional)</Label>
                    <Select
                      value={newPublisherData.stratum_qualis_id?.toString() || ""}
                      onValueChange={(value) => setNewPublisherData({ ...newPublisherData, stratum_qualis_id: parseInt(value) })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Selecione o Qualis" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredQualis.map((q) => (
                          <SelectItem key={q.id} value={q.id.toString()}>
                            {q.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    className="w-full h-8 text-xs"
                    disabled={isSubmittingNew}
                    onClick={handleCreateNewPublisher}
                  >
                    {isSubmittingNew ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                    Confirmar e Selecionar
                  </Button>
                </div>
              )}

              {publisher && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-green-800">{publisher.name}</p>
                      <p className="text-xs text-green-700">
                        {publisher.publisher_type === 'journal'
                          ? `ISSN: ${publisher.issns?.join(', ') || 'N/A'}`
                          : `Sigla: ${publisher.initials || 'N/A'}`}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                      Qualis: {publisher.stratum_qualis?.code || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Produção"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
