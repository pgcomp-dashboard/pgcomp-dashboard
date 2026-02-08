'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import UploadXMLForm from '@/components/UploadXMLForm';
import { productionService } from '@/services/modules/production.service';
import { qualisService } from '@/services/modules/qualis.service';
import { userService } from '@/services/modules/user.service';
import { Production, Publisher, StratumQualis } from '@/types/academic';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpDown, ChevronDown, ChevronUp, FileText, Filter, Loader2, Plus, Trash, X } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface RequestBodyType {
  title: string;
  year: number;
  publisher_type: string;
  stratum_qualis_id: number | null;
  doi: string | null;
}

interface CreateRequestBodyType {
  title: string;
  year: number;
  publisher_type: string | null;
  publisher_id: number | null;
}

type FormType = 'none' | 'xml' | 'doi' | 'other';

const updateProductionFormSchema = z.object({
  title: z.string().min(1, 'Campo obrigatório'),
  year: z.coerce.number().min(1900, 'Ano inválido'),
  type: z.string().min(1, 'Campo obrigatório'),
  qualis_code: z.string().min(1, 'Campo obrigatório'),
  doi: z.string().min(1, 'Campo obrigatório'),
});

const createProductionFormSchema = z.object({
  title: z.string(),
  year: z.coerce.number(),
});

export default function MyProductionsPage() {
  const date = new Date();

  const [ isEditOpen, setIsEditOpen ] = useState(false);
  const [ qualisList, setQualisList ] = useState<StratumQualis[]>([]);
  const [ productionList, setProductionList ] = useState<Production[]>([]);
  const [ selectedProduction, setSelectedProduction ] = useState<Production>();
  const [ chosenForm, setChosenForm ] = useState<FormType>('none');
  const [ totalScore, setTotalScore ] = useState(0);
  const [ showFilters, setShowFilters ] = useState(false);

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

  useEffect(() => {
    async function fetchQualis() {
      try {
        const qualis = await qualisService.getAllQualis();
        setQualisList(qualis);
        console.log(qualis);
      } catch (err) {
        console.error('Erro ao carregar Qualis:', err);
      }
    }
    fetchQualis();
  }, []);

  const {
    data,
    isLoading,
    error,
  } = useQuery<Production[], Error>({
    queryKey: [ 'productions' ],
    queryFn: () =>
      userService.getProductionsOfUser(),
    placeholderData: (prevData) => prevData,
  });

  let entries: Production[] = [];

  useEffect(() => {
    if (data) {
      entries = Object.entries(data)
        .filter(([ key ]) => !isNaN(Number(key)))
        .map(([ , value ]) => value as unknown as Production);

      entries.sort((a, b) => b.year - a.year);
      if (productionList.length == 0) setProductionList(entries);
    }
  }, [ data ]);

  useEffect(() => {
    if (qualisList.length > 0) {
      const validList = productionList.filter((item) => {
        return item.year >= date.getFullYear() - 4 && item.year <= date.getFullYear() - 1;
      });
      const score = validList.reduce((accumulator, production) => {
        if (production.stratum_qualis_id) {
          const qualis = qualisList.find((q) => q.id === production.stratum_qualis_id);
          return accumulator + (qualis ? qualis.score : 0);
        } else return accumulator;
      }, 0);
      setTotalScore(score);
    }
  }, [ productionList, qualisList ]);

  // Lógica de filtro e ordenação
  const filteredAndSortedProductions = useMemo(() => {
    let result = [ ...productionList ];

    // Aplicar filtros
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
        const qualis = qualisList.find((q) => q.id === p.stratum_qualis_id);
        return qualis?.code === filters.qualis;
      });
    }

    // Aplicar ordenação
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
          aValue = qualisList.find((q) => q.id === a.stratum_qualis_id)?.score || 0;
          bValue = qualisList.find((q) => q.id === b.stratum_qualis_id)?.score || 0;
          break;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [ productionList, qualisList, filters, sortConfig ]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'titulo' || key === 'local') {
      return value.trim() !== '';
    }
    return value !== 'all';
  });

  const clearFilters = () => {
    setFilters({ titulo: '', local: '', anoInicio: 'all', anoFim: 'all', tipo: 'all', origem: 'all', qualis: 'all' });
  };

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortIcon = ({ column }: { column: typeof sortConfig.key }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Anos únicos para o filtro
  const uniqueYears = useMemo(() => {
    const years = [ ...new Set(productionList.map((p) => p.year)) ];
    return years.sort((a, b) => b - a);
  }, [ productionList ]);

  async function onSubmit(values: z.infer<typeof updateProductionFormSchema>) {
    //console.log("Submiting")
    //console.log(JSON.stringify(values))
    console.log(productionList);
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) {
      console.error('Ano Inválido');
      return;
    }

    const qualis = qualisList.filter((item) => item.type === values.type).find((item) => item.code === values.qualis_code);
    //console.log("Qualis :" + qualis);
    const payload: RequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: values.type,
      stratum_qualis_id: qualis ? qualis.id : null,
      doi: values.doi,
    };
    //console.log(payload)
    try {
      if (selectedProduction) {

        const response = await productionService.updateProduction(selectedProduction.id, JSON.stringify(payload));

        if (response.status == '200') {
          const updatedList = productionList.map((entry) => {
            if (entry.id === selectedProduction.id) {
              return { ...entry, ...payload, source: 'manual' };
            }
            return entry;
          });
          setProductionList(updatedList);
          toast.success('Atualizado com sucesso');
          setIsEditOpen(false);
        }
      }
    } catch (err) {
      console.error('Erro ao editar publicação:', err);
    }
  }

  async function deleteProduction(id: number) {
    console.log('Deletar :', selectedProduction?.title);
    try {
      if (!selectedProduction) return;
      const response = await productionService.deleteProduction(id);
      if (response.status == '200') {
        const list = productionList.filter((entry) => {
          return entry.id !== selectedProduction.id;
        });
        setProductionList(list);
        toast.success('Produção deletada com sucesso.');
      }
      console.log(response.message);
    } catch (err) {
      console.error('Erro ao deletar a produção:', err);
    }
  }

  async function fullDelete() {
    try {
      const response = await productionService.clearProduction();
      console.log(response);
      if (response.status == '200') {
        setProductionList([]);
        toast.success('Produções deletadas com sucesso.');
      }

    } catch (err) {
      toast.error('Erro ao deletar produções.');
    }
  }

  const form = useForm<z.infer<typeof updateProductionFormSchema>>({
    resolver: zodResolver(updateProductionFormSchema),
    defaultValues: {
      title: selectedProduction?.title,
      year: selectedProduction?.year,
      qualis_code: selectedProduction?.last_qualis ?? undefined,
      doi: selectedProduction?.doi || undefined,
    },
  });

  useEffect(() => {
    if (selectedProduction && isEditOpen) {
      form.reset({
        title: selectedProduction.title,
        year: selectedProduction.year,
        type: selectedProduction.publisher_type ?? undefined,
        qualis_code: selectedProduction.last_qualis || '',
        doi: selectedProduction.doi || '',
      });
    }
  }, [ selectedProduction, isEditOpen, form ]);

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar suas produções!</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full px-2 sm:px-0">
      {/* Header */}
      <div className='flex flex-col items-center gap-4 w-full'>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Minhas Produções</h1>
          <p className="text-sm text-muted-foreground">
            Visualize, crie e edite suas produções.
          </p>
        </div>

        {/* Score e Ações */}
        <div className='w-full space-y-3'>
          {/* Pontuação */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-medium">Pontuação total:</span>
              <span className="text-lg font-bold text-primary">{totalScore}</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className='flex flex-col gap-2'>
            {chosenForm !== 'none' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChosenForm('none')}
                className="self-start text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar para lista
              </Button>
            )}

            {chosenForm === 'none' && (
              <>
                <Label className="text-sm font-medium">Adicionar Produção</Label>
                <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2'>
                  <Button
                    variant="outline"
                    onClick={() => setChosenForm('xml')}
                    className="h-10"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    XML
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setChosenForm('doi')}
                    className="h-10"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    DOI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setChosenForm('other')}
                    className="h-10"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Manual
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash className="mr-1.5 h-4 w-4" />
                        Limpar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogPortal>
                      <AlertDialogOverlay />
                      <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso vai permanentemente deletar todas as produções.
                        </AlertDialogDescription>
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                          <AlertDialogCancel asChild>
                            <Button variant="outline">Cancelar</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button className="bg-red-500 hover:bg-red-600" onClick={() => fullDelete()}>
                              Sim, deletar todas
                            </Button>
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialogPortal>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      {chosenForm === 'none' && (
        <div className="w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-3 w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {Object.values(filters).filter((f) => f !== 'all').length}
              </span>
            )}
          </Button>

          {showFilters && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* Título */}
                <div>
                  <Label className="text-xs mb-1.5 block">Título</Label>
                  <Input
                    type="text"
                    placeholder="Filtrar título..."
                    value={filters.titulo}
                    onChange={(e) => setFilters({ ...filters, titulo: e.target.value })}
                    className="h-9"
                  />
                </div>

                {/* Local */}
                <div>
                  <Label className="text-xs mb-1.5 block">Local</Label>
                  <Input
                    type="text"
                    placeholder="Filtrar local..."
                    value={filters.local}
                    onChange={(e) => setFilters({ ...filters, local: e.target.value })}
                    className="h-9"
                  />
                </div>

                {/* Ano - Intervalo */}
                <div className="lg:col-span-2">
                  <Label className="text-xs mb-1.5 block">Período (Ano)</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={filters.anoInicio}
                      onValueChange={(value) => setFilters({ ...filters, anoInicio: value })}
                    >
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue placeholder="De" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">até</span>
                    <Select
                      value={filters.anoFim}
                      onValueChange={(value) => setFilters({ ...filters, anoFim: value })}
                    >
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue placeholder="Até" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <Label className="text-xs mb-1.5 block">Tipo</Label>
                  <Select
                    value={filters.tipo}
                    onValueChange={(value) => setFilters({ ...filters, tipo: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="journal">Revista</SelectItem>
                      <SelectItem value="conference">Conferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Origem */}
                <div>
                  <Label className="text-xs mb-1.5 block">Origem</Label>
                  <Select
                    value={filters.origem}
                    onValueChange={(value) => setFilters({ ...filters, origem: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="lattes">Lattes</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="doi">DOI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Qualis */}
                <div>
                  <Label className="text-xs mb-1.5 block">Qualis</Label>
                  <Select
                    value={filters.qualis}
                    onValueChange={(value) => setFilters({ ...filters, qualis: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="B3">B3</SelectItem>
                      <SelectItem value="B4">B4</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    {filteredAndSortedProductions.length} resultado(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Ordenação Mobile */}
          <div className="md:hidden mt-3">
            <Label className="text-xs mb-1.5 block">Ordenar por</Label>
            <div className="flex gap-2">
              <Select
                value={sortConfig.key}
                onValueChange={(value) => setSortConfig((prev) => ({ ...prev, key: value as typeof sortConfig.key }))}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="titulo">Título</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                  <SelectItem value="tipo">Tipo</SelectItem>
                  <SelectItem value="origem">Origem</SelectItem>
                  <SelectItem value="pontuacao">Pontuação</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSortConfig((prev) => ({
                  ...prev,
                  direction: prev.direction === 'asc' ? 'desc' : 'asc',
                }))}
              >
                {sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Filtros de texto mobile */}
          <div className="md:hidden mt-3 space-y-2">
            <div>
              <Label className="text-xs mb-1 block">Título</Label>
              <Input
                type="text"
                placeholder="Filtrar por título..."
                value={filters.titulo}
                onChange={(e) => setFilters({ ...filters, titulo: e.target.value })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Local</Label>
              <Input
                type="text"
                placeholder="Filtrar por local..."
                value={filters.local}
                onChange={(e) => setFilters({ ...filters, local: e.target.value })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Período (Ano)</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={filters.anoInicio}
                  onValueChange={(value) => setFilters({ ...filters, anoInicio: value })}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="De" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">até</span>
                <Select
                  value={filters.anoFim}
                  onValueChange={(value) => setFilters({ ...filters, anoFim: value })}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="Até" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      {chosenForm === 'none' ?
        <>
          {/* Desktop: Tabela */}
          <div className="hidden w-full md:block rounded-md border max-h-[calc(100vh-350px)] overflow-y-auto">
            <Table className="table-fixed w-full">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className='w-[25%] text-left px-2 py-2'>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort('titulo')}
                    >
                      Título
                      <SortIcon column="titulo" />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[20%] text-left px-2 py-2'>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort('local')}
                    >
                      Local
                      <SortIcon column="local" />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[8%] text-center px-1 py-2'>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort('year')}
                    >
                      Ano
                      <SortIcon column="year" />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[10%] text-center px-1 py-2'>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort('tipo')}
                    >
                      Tipo
                      <SortIcon column="tipo" />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[10%] text-center px-1 py-2'>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort('origem')}
                    >
                      Origem
                      <SortIcon column="origem" />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[8%] text-center px-1 py-2'>
                    <span className="text-xs font-semibold">Qualis</span>
                  </TableHead>
                  <TableHead className='w-[8%] text-center px-1 py-2'>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort('pontuacao')}
                    >
                      Pts
                      <SortIcon column="pontuacao" />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[11%] text-center px-1 py-2'>
                    <span className="text-xs font-semibold">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProductions.length === 0 ?
                  <TableRow>
                    <TableCell colSpan={8} className='text-center py-8'>
                      {hasActiveFilters
                        ? 'Nenhuma produção encontrada com os filtros aplicados'
                        : 'Não foram encontradas produções cadastradas para o usuário'}
                    </TableCell>
                  </TableRow>
                  :
                  filteredAndSortedProductions.map((production) => (
                    <TableRow key={production.id}>
                      <TableCell className="text-left px-2 py-2 align-top">
                        <div className="text-sm leading-snug whitespace-normal break-words" title={production.title}>
                          {production.title}
                        </div>
                      </TableCell>
                      <TableCell className='text-left px-2 py-2 align-top'>
                        <div className="text-sm leading-snug whitespace-normal break-words" title={production.publisher?.name || 'N/A'}>
                          {production.publisher?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm">
                        {production.year}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm">
                        {production.publisher_type === 'journal' ? 'Revista' : production.publisher_type === 'conference' ? 'Conferência' : 'NI'}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm capitalize">
                        {production.source === 'xml' || production.source === 'lattes' ? 'Lattes' : production.source === 'manual' ? 'Manual' : production.source === 'doi' ? 'DOI' : 'NI'}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm">
                        {production.stratum_qualis_id && qualisList.find((qualis) => qualis.id == production.stratum_qualis_id)?.code}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm">
                        {production.stratum_qualis_id && qualisList.find((qualis) => qualis.id == production.stratum_qualis_id)?.score}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduction(production);
                            setIsEditOpen(true);
                          }
                          }
                          title="Editar"
                        >
                          <FileText className="h-5 w-5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedProduction(production);
                              }}
                              title="Deletar"
                            >
                              <Trash className="text-red-500 h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogPortal>
                            <AlertDialogOverlay />
                            <AlertDialogContent>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso vai permanentemente deletar a produção {selectedProduction?.title}.
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-4">
                                <AlertDialogCancel asChild>
                                  <Button className="bg-white text-black"
                                    onClick={() => {
                                      setSelectedProduction(undefined);
                                    }}>Cancelar
                                  </Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button className="bg-red-400 hover:bg-red-500" onClick={() => {
                                    if (selectedProduction) deleteProduction(selectedProduction.id);
                                  }}>Sim, deletar produção</Button>
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialogPortal>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden flex flex-col gap-3 w-full">
            {filteredAndSortedProductions.length === 0 ?
              <div className='p-6 text-center text-muted-foreground bg-muted/30 rounded-lg'>
                {hasActiveFilters
                  ? 'Nenhuma produção encontrada com os filtros aplicados'
                  : 'Não foram encontradas produções cadastradas para o usuário'}
              </div>
              :
              filteredAndSortedProductions.map((production) => {
                const qualis = qualisList.find((q) => q.id === production.stratum_qualis_id);
                return (
                  <div key={production.id} className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    {/* Header do Card */}
                    <div className="p-3 bg-muted/30 border-b">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2">{production.title}</h3>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-3">
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground block">Local</span>
                        <span className="font-medium text-sm">{production.publisher?.name || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground block">Ano</span>
                          <span className="font-medium">{production.year}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Tipo</span>
                          <span className="font-medium">
                            {production.publisher_type === 'journal' ? 'Revista' : production.publisher_type === 'conference' ? 'Conferência' : 'NI'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Origem</span>
                          <span className="font-medium capitalize">{production.source || 'NI'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Qualis / Pontos</span>
                          <span className="font-medium">
                            {qualis ? `${qualis.code} / ${qualis.score}` : 'NI'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ações do Card */}
                    <div className="flex border-t">
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-none h-11 text-sm"
                        onClick={() => {
                          setSelectedProduction(production);
                          setIsEditOpen(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <div className="w-px bg-border" />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex-1 rounded-none h-11 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedProduction(production);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogPortal>
                          <AlertDialogOverlay />
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg mx-auto">
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Essa ação não pode ser desfeita. Isso vai permanentemente deletar a produção.
                            </AlertDialogDescription>
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                              <AlertDialogCancel asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedProduction(undefined)}
                                >
                                  Cancelar
                                </Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => {
                                    if (selectedProduction) deleteProduction(selectedProduction.id);
                                  }}
                                >
                                  Deletar
                                </Button>
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialogPortal>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
        : chosenForm === 'xml' ?
          <UploadXMLForm />
          : chosenForm === 'doi' ?
            <ProductionDOIForm />
            :
            <ProductionCreateForm qualis={qualisList} />
      }

      {/* Dialog - Formulario de edição da produção */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edite as informações da sua publicação</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {/* Formulario aqui */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8">
              <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Produção:</FormLabel>
                      <FormDescription>
                        {selectedProduction?.title}
                      </FormDescription>
                      <FormControl>
                        <Input type="text" {...field} />
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
                      <FormDescription>
                        {selectedProduction?.year || 'N/A'}
                      </FormDescription>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormDescription>
                        {/*{selectedProduction?.publisher_type || "N/A"}*/}
                      </FormDescription>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de produção" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="journal">Revista</SelectItem>
                            <SelectItem value="conference">Conferência</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualis_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualis:</FormLabel>
                      <FormDescription>
                        {selectedProduction?.stratum_qualis_id && qualisList.find((qualis) => qualis.id == selectedProduction.stratum_qualis_id)?.code || 'N/A'}
                      </FormDescription>
                      <FormControl>
                        <Input type="text" {...field} />
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
                      <FormLabel>D.O.I:</FormLabel>
                      <FormDescription>
                        {selectedProduction?.doi || 'N/A'}
                      </FormDescription>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" size="lg" onClick={() => setIsEditOpen(false)}>Fechar</Button>
                <Button type="submit" size="lg" className="bg-green-700 hover:bg-green-800" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductionDOIForm() {
  const [ doi, setDoi ] = useState<string>('');
  const [ publisherType, setPublisherType ] = useState('conference');
  const [ isLoading, setIsLoading ] = useState(false);

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    setDoi(e.target.value);
  }

  function handleValueChange(value: string) {
    setPublisherType(value);
  }

  async function createProduction() {
    if (!doi) return;

    setIsLoading(true);
    const request = {
      'type': publisherType,
      'doi': doi,
    };

    try {
      const response = await productionService.createProductionDoi(request);
      console.log(response);
      if (response.status == 201) {
        toast.success('Criado com sucesso');
        setDoi('');
      }
    } catch (err) {
      toast.error('Erro ao criar produção');
      console.error('Erro ao criar produção:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='flex flex-col w-full items-center'>
      <div className='flex flex-col w-full max-w-md gap-4 items-center'>
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">Adicionar com DOI</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Importe a produção pelo identificador DOI
          </p>
        </div>

        <div className="w-full space-y-4">
          {/* Tipo de publicação */}
          <div className="space-y-2">
            <Label className="text-sm">Tipo de publicação</Label>
            <RadioGroup
              className='flex gap-4'
              defaultValue='conference'
              onValueChange={handleValueChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value='conference' id='doi-conference' />
                <Label htmlFor="doi-conference" className="font-normal cursor-pointer">Conferência</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value='journal' id='doi-journal' />
                <Label htmlFor="doi-journal" className="font-normal cursor-pointer">Revista</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Input DOI */}
          <div className="space-y-2">
            <Label className="text-sm">DOI</Label>
            <Input
              placeholder='Ex: 10.1000/xyz123'
              type="text"
              value={doi}
              onChange={handleInput}
            />
          </div>

          {/* Botão */}
          <Button
            onClick={createProduction}
            disabled={!doi || isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Importando...' : 'Importar produção'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductionCreateForm({ qualis }: { qualis: StratumQualis[] }) {

  const [ production, setProduction ] = useState<Production>();
  const [ isConfirmationOpen, setIsConfirmationOpen ] = useState(false);
  const [ publisher, setPublisher ] = useState<Publisher | null>(null);
  const [ publisherType, setPublisherType ] = useState('conference');
  const [ publisherNotFound, setPublisherNotFound ] = useState(false);
  const [ publisherSearch, setPublisherSearch ] = useState<string>('');

  const form = useForm<z.infer<typeof createProductionFormSchema>>({
    resolver: zodResolver(createProductionFormSchema),
    defaultValues: {
      title: '',
      year: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof createProductionFormSchema>) {

    console.log('Chamou o submit');
    console.log(JSON.stringify(values));

    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) {
      console.error('Ano Inválido');
      return;
    }

    const payload: CreateRequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: publisher?.publisher_type || null,
      publisher_id: publisher?.id || null,
    };

    try {
      const response = await productionService.createUserProduction(JSON.stringify(payload));
      setProduction(response.data);
      toast.success('Produção Criada com sucesso');
    } catch (err) {
      toast.error('Erro ao criar Produção');
      console.error('Erro ao criar produção:', err);
    }
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value)
      setPublisherSearch(e.target.value);
  }

  function handleValueChange(value: string) {
    setPublisherType(value);
  }

  async function getPublisherByIssn(issn: string) {
    if (!issn) return;
    setPublisherNotFound(false);
    try {
      const response = await qualisService.getJournalByIssn(issn);
      if (response) {
        setPublisher(response);
      } else {
        setPublisherNotFound(true);
      }
    } catch (err) {
      console.log('Erro ao buscar revista', err);
    }

  }

  async function getPublisherByInitials(initials: string) {
    if (!initials) return;
    setPublisherNotFound(false);
    try {
      const response = await qualisService.getConferenceByInitial(initials);
      setPublisher(response);
      if (!response) setPublisherNotFound(true);
    } catch (err) {
      console.log('Erro ao buscar conferencia', err);
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col gap-4 w-full max-w-lg">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">Adicionar manualmente</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados da produção
          </p>
        </div>

        {/* Tipo de publicação */}
        <div className="space-y-2">
          <Label className="text-sm">Tipo de publicação</Label>
          <RadioGroup
            className='flex gap-4'
            defaultValue='conference'
            onValueChange={handleValueChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value='conference' id='manual-conference' />
              <Label htmlFor="manual-conference" className="font-normal cursor-pointer">Conferência</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value='journal' id='manual-journal' />
              <Label htmlFor="manual-journal" className="font-normal cursor-pointer">Revista</Label>
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
                  <FormLabel>Título da Produção</FormLabel>
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

            {/* Busca de Publisher */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <Label className="text-sm">Buscar {publisherType === 'journal' ? 'Revista (ISSN)' : 'Conferência (Sigla)'}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={publisherType === 'journal' ? 'Ex: 1234-5678' : 'Ex: SBBD'}
                  type="text"
                  onChange={handleInput}
                  className="flex-1"
                />
                <Button
                  type='button'
                  variant="secondary"
                  onClick={() => {
                    publisherType === 'journal'
                      ? getPublisherByIssn(publisherSearch)
                      : getPublisherByInitials(publisherSearch);
                  }}
                >
                  Buscar
                </Button>
              </div>

              {publisher && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                  <p className="font-medium text-green-800">{publisher.name}</p>
                  <p className="text-green-700">
                    Qualis: {qualis.find((item) => item.id === publisher.stratum_qualis_id)?.code || 'N/A'}
                  </p>
                </div>
              )}

              {publisherNotFound && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                  {publisherType === 'journal' ? 'Revista' : 'Conferência'} não encontrada
                </div>
              )}
            </div>

            <Button type="submit" className="w-full">
              Criar Produção
            </Button>
          </form>
        </Form>
      </div>

      {/* Dialog - Confirmação de criação */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className='text-center'>Produção cadastrada!</DialogTitle>
            <DialogDescription className="sr-only">Detalhes da produção criada</DialogDescription>
          </DialogHeader>
          <div className='space-y-2 text-sm'>
            <div>
              <span className="text-muted-foreground">Título:</span>
              <p className="font-medium">{production?.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ano:</span>
              <p className="font-medium">{production?.year}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              className='w-full bg-green-600 hover:bg-green-700'
              onClick={() => {
                setIsConfirmationOpen(false);
                form.reset();
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
