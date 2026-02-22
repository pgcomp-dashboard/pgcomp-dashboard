import { queryClient } from '@/lib/query-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { productionService } from '@/services/modules/production.service';
import { publisherService } from '@/services/modules/publisher.service';
import { Publisher } from '@/types/academic';
import { normalizeDoi } from '@/utils/doi';
import { CreateRequestBodyType, createProductionFormSchema } from '../../types';

interface ProductionCreateFormProps {
  professorId?: string;
  onSuccess?: () => void;
}

export function ProductionCreateForm({ professorId, onSuccess }: ProductionCreateFormProps) {
  const [ publisher, setPublisher ] = useState<Publisher | null>(null);
  const [ publisherType, setPublisherType ] = useState('conference');
  const [ publisherSearch, setPublisherSearch ] = useState<string>('');
  const [ isSearching, setIsSearching ] = useState(false);
  const [ searchResults, setSearchResults ] = useState<Publisher[]>([]);
  const [ showResults, setShowResults ] = useState(false);
  const isSelectedRef = useRef(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (publisherSearch.length >= 2 && !isSelectedRef.current) {
        setIsSearching(true);
        try {
          const response = await publisherService.getAllPublishers({
            filter: {
              search: publisherSearch,
              publisher_type: publisherType,
            }
          });
          setSearchResults(response.data);
          setShowResults(true);
        } catch (err) {
          console.error('Erro ao buscar veículos:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [ publisherSearch, publisherType ]);

  const form = useForm<z.infer<typeof createProductionFormSchema>>({
    resolver: zodResolver(createProductionFormSchema),
    defaultValues: {
      title: '',
      year: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof createProductionFormSchema>) {
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) return;

    const payload: CreateRequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: publisher?.publisher_type || null,
      publisher_id: publisher?.id || null,
      doi: normalizeDoi(values.doi),
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

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    isSelectedRef.current = false;
    setPublisherSearch(e.target.value);
    setPublisher(null);
  };

  const handleTypeChange = (value: string) => {
    setPublisherType(value);
    setPublisher(null);
    setSearchResults([]);
    setPublisherSearch('');
  };

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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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

                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b last:border-0 transition-colors"
                        onClick={() => {
                          setPublisher(p);
                          isSelectedRef.current = true;
                          setPublisherSearch(p.name);
                          setShowResults(false);
                        }}
                      >
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>
                            {p.publisher_type === 'journal'
                              ? `ISSN: ${p.issns?.join(", ") || 'N/A'}`
                              : `Sigla: ${p.initials || 'N/A'}`}
                          </span>
                          <span className="font-semibold text-primary">
                            Qualis: {p.stratum_qualis?.code || 'N/A'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {publisher && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-green-800">{publisher.name}</p>
                      <p className="text-xs text-green-700">
                        {publisher.publisher_type === 'journal'
                          ? `ISSN: ${publisher.issns?.join(", ") || 'N/A'}`
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

            <Button type="submit" className="w-full">
              Criar Produção
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
