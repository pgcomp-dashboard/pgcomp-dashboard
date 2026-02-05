import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productionService } from '@/services/modules/production.service';
import { qualisService } from '@/services/modules/qualis.service';
import { Production, StratumQualis } from '@/types/academic';
import { RequestBodyType } from '@/types/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp, Edit, Filter, Plus, Trash, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

const updateProductionFormSchema = z.object({
  title: z.string().min(1, 'Campo obrigatório'),
  year: z.coerce.number().min(1900, 'Ano inválido'),
  type: z.string().min(1, 'Campo obrigatório'),
  qualis_code: z.string().min(1, 'Campo obrigatório'),
  doi: z.string().min(1, 'Campo obrigatório'),
});

export default function ProfessorProductionsPage() {
  const { professorId } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production | undefined>(undefined);
  const [qualisList, setQualisList] = useState<StratumQualis[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Creation State
  const [isXmlOpen, setIsXmlOpen] = useState(false);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [isCreationMode, setIsCreationMode] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    ano: 'all',
    tipo: 'all',
    origem: 'all',
    qualis: 'all',
  });

  // Sort
  const [sortConfig, setSortConfig] = useState<{
    key: 'year' | 'tipo' | 'origem' | 'pontuacao' | 'titulo';
    direction: 'asc' | 'desc';
  }>({ key: 'year', direction: 'desc' });

  // Fetch Qualis List
  useEffect(() => {
    async function fetchQualis() {
      try {
        const qualis = await qualisService.getAllQualis();
        setQualisList(qualis);
      } catch (err) {
        console.error('Erro ao carregar Qualis:', err);
      }
    }
    fetchQualis();
  }, []);

  const {
    data: productions,
    isLoading,
    error,
    refetch,
  } = useQuery<Production[], Error>({
    queryKey: ['professor-productions', professorId],
    queryFn: async () => {
      if (!professorId) throw new Error('Professor ID is required');
      const rawData = await productionService.getUserProductions(Number(professorId));
      const entries = Object.entries(rawData)
        .filter(([key]) => !isNaN(Number(key)))
        .map(([, value]) => value as unknown as Production);
      return entries;
    },
    enabled: !!professorId,
  });

  const form = useForm<z.infer<typeof updateProductionFormSchema>>({
    resolver: zodResolver(updateProductionFormSchema),
    defaultValues: {
      title: '',
      year: new Date().getFullYear(),
      type: '',
      qualis_code: '',
      doi: '',
    },
  });

  useEffect(() => {
    if (isEditOpen) {
        if (selectedProduction && !isCreationMode) {
          form.reset({
            title: selectedProduction.title,
            year: selectedProduction.year,
            type: selectedProduction.publisher_type ?? undefined,
            qualis_code: selectedProduction.last_qualis || '',
            doi: selectedProduction.doi || '',
          });
        } else if (isCreationMode) {
            form.reset({
                title: '',
                year: new Date().getFullYear(),
                type: '',
                qualis_code: '',
                doi: '',
            });
        }
    }
  }, [selectedProduction, isEditOpen, isCreationMode, form]);

  const filteredAndSortedProductions = useMemo(() => {
    if (!productions) return [];
    let result = [...productions];

    // Filter
    if (filters.ano && filters.ano !== 'all') {
      result = result.filter((p) => p.year.toString() === filters.ano);
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

    // Sort
    result.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortConfig.key) {
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
        case 'titulo':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [productions, qualisList, filters, sortConfig]);

  const uniqueYears = useMemo(() => {
    if (!productions) return [];
    const years = [...new Set(productions.map((p) => p.year))];
    return years.sort((a, b) => b - a);
  }, [productions]);

  const hasActiveFilters = Object.values(filters).some((f) => f !== 'all');

  const clearFilters = () => {
    setFilters({ ano: 'all', tipo: 'all', origem: 'all', qualis: 'all' });
  };

  async function onSubmit(values: z.infer<typeof updateProductionFormSchema>) {
    if (!isCreationMode && !selectedProduction) return;
    if (!professorId) return;

    try {
      const qualis = qualisList
        .filter((item) => item.type === values.type)
        .find((item) => item.code === values.qualis_code);

      const payload: RequestBodyType = {
        title: values.title,
        year: values.year,
        publisher_type: values.type,
        stratum_qualis_id: qualis ? qualis.id : null,
        doi: values.doi,
      };

      let response;
      if (isCreationMode) {
        response = await productionService.createUserProduction(Number(professorId), payload);
      } else if (selectedProduction) {
        response = await productionService.updateUserProduction(selectedProduction.id, payload);
      }
      console.log(response)
      toast.success(isCreationMode ? 'Produção criada com sucesso' : 'Produção atualizada com sucesso');
      setIsEditOpen(false);
      setIsCreationMode(false);

    } catch (err) {
      console.error('Erro ao salvar produção:', err);
      toast.error('Erro ao salvar produção');
    }
  }

  async function handleXmlUpload() {
      if (!xmlFile || !professorId) return;

      const formData = new FormData();
      formData.append('file', xmlFile);

      try {
        const response = await productionService.uploadUserLattes(Number(professorId), formData);
        console.log(response.data)
        toast.success('Lattes importado com sucesso');
        setIsXmlOpen(false);
        setXmlFile(null);
        refetch();
      } catch (e) {
        console.error(e);
        toast.error('Erro ao importar Lattes');
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await productionService.deleteProduction(id);
      // Check status strictly if possible, assuming '200' per previous service usage
      if (response.status === '200') {
        toast.success('Produção deletada com sucesso');
        refetch();
      } else {
         // Fallback if status isn't 200 but promise resolved (depending on api client)
         // Assuming api client throws on non-2xx usually, but service method types suggest explicit status check
        toast.error('Erro ao deletar produção');
      }
    } catch (err) {
      console.error('Erro ao deletar produção:', err);
      toast.error('Erro ao deletar produção');
    }
  }

  if (isLoading) return <div>Carregando produções...</div>;
  if (error) return <div>Erro ao carregar produções: {error.message}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Produções do Professor</h1>
            <p className="text-muted-foreground">
              Lista de produções vinculadas a este docente.
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => { setIsCreationMode(true); setSelectedProduction(undefined); setIsEditOpen(true); }} className="gap-2 flex-1 sm:flex-none">
                <Plus className="h-4 w-4" />
                Nova Produção
            </Button>
             <Button variant="outline" onClick={() => setIsXmlOpen(true)} className="gap-2 flex-1 sm:flex-none">
                <Upload className="h-4 w-4" />
                Importar XML
            </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
         {/* Filters Toggle */}
          <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {Object.values(filters).filter((f) => f !== 'all').length}
                  </span>
                )}
              </Button>

              {/* Sort Controls (Simple Dropdown for Mobile/Desktop unification) */}
               <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">Ordenar por:</span>
                  <Select
                    value={sortConfig.key}
                    onValueChange={(val) => setSortConfig(prev => ({ ...prev, key: val as any }))}
                  >
                    <SelectTrigger className="w-32.5 h-9">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">Ano</SelectItem>
                      <SelectItem value="titulo">Título</SelectItem>
                      <SelectItem value="pontuacao">Pontuação</SelectItem>
                      <SelectItem value="tipo">Tipo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                     className="h-9 w-9"
                    onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                  >
                     {sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
               </div>
          </div>

        {/* Filters Panel */}
        {showFilters && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-4 border">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Ano</Label>
                  <Select
                    value={filters.ano}
                    onValueChange={(value) => setFilters({ ...filters, ano: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      {['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C'].map((q) => (
                         <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
               {hasActiveFilters && (
                <div className="flex justify-end pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-muted-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
        )}

        <div className="rounded-md border p-6 bg-white min-h-75">
          {filteredAndSortedProductions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
               <p>{hasActiveFilters ? 'Nenhuma produção encontrada com os filtros selecionados.' : 'Nenhuma produção encontrada.'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredAndSortedProductions.map((prod, idx) => (
                <div
                  key={prod.id || idx}
                  className="rounded-lg border p-4 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="font-semibold text-lg">{prod.title}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Ano:</span> {prod.year}</p>
                      <p><span className="font-medium">DOI:</span> {prod.doi || 'N/A'}</p>
                       <p><span className="font-medium">Origem:</span> <span className="capitalize">{prod.source || 'N/A'}</span></p>
                      {prod.publisher && (
                        <p>
                          <span className="font-medium">Local:</span> {prod.publisher.name} ({prod.publisher.initials}) - {prod.publisher.publisher_type}
                        </p>
                      )}
                      {prod.publisher?.stratum_qualis && (
                        <p>
                          <span className="font-medium">Qualis:</span> {prod.publisher.stratum_qualis.code} (Score: {prod.publisher.stratum_qualis.score})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProduction(prod);
                        setIsCreationMode(false);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogPortal>
                        <AlertDialogOverlay />
                        <AlertDialogContent>
                          <AlertDialogTitle>Excluir Produção?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta produção? Esta ação não pode ser desfeita.
                             <br/><br/>
                             <strong>{prod.title}</strong>
                          </AlertDialogDescription>
                           <div className="flex justify-end gap-2 mt-4">
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDelete(prod.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                           </div>
                        </AlertDialogContent>
                      </AlertDialogPortal>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreationMode ? 'Nova Produção' : 'Editar Produção'}</DialogTitle>
            <DialogDescription>
              {isCreationMode ? 'Preencha os dados da nova produção.' : 'Faça alterações na produção selecionada.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da produção" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                      <FormLabel>DOI</FormLabel>
                      <FormControl>
                        <Input placeholder="10.1234/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="journal">Revista</SelectItem>
                          <SelectItem value="conference">Conferência</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualis_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualis</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Nota" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C'].map((q) => (
                            <SelectItem key={q} value={q}>
                              {q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* XML Upload Dialog */}
      <Dialog open={isXmlOpen} onOpenChange={setIsXmlOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Importar Lattes (XML/ZIP)</DialogTitle>
                <DialogDescription>
                    Selecione o arquivo XML ou ZIP do currículo Lattes para importar as produções.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
                <Input
                    type="file"
                    accept=".xml,.zip"
                    onChange={(e) => setXmlFile(e.target.files?.[0] || null)}
                />
            </div>
            <DialogFooter>
                 <Button variant="outline" onClick={() => setIsXmlOpen(false)}>Cancelar</Button>
                 <Button onClick={handleXmlUpload} disabled={!xmlFile}>Importar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
