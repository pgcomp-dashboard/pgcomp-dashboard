import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { publisherService } from "@/services/modules/publisher.service";
import { qualisService } from "@/services/modules/qualis.service";
import { Publisher, StratumQualis } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB

const fileFormSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, 'Tamanho máximo é 5MB.')
    .refine((file) => file?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Apenas arquivos .xlsx são suportados.'),
});

const publisherFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  initials: z.string().max(255).optional().nullable(),
  issn: z.string().max(255).optional().nullable(),
  publisher_type: z.enum(['journal', 'conference']).optional().nullable(),
  stratum_qualis_id: z.coerce.number().optional().nullable(),
});

export default function PublishersPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [qualisFilter, setQualisFilter] = useState("all");
  const [qualisOptions, setQualisOptions] = useState<StratumQualis[]>([]);

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Publisher> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [spreadSheetType, setSpreadSheetType] = useState<'journal' | 'conference'>('journal');
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const [isPublisherDialogOpen, setIsPublisherDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(null);

  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
  });

  const publisherForm = useForm<z.infer<typeof publisherFormSchema>>({
    resolver: zodResolver(publisherFormSchema),
    defaultValues: {
      name: '',
      initials: '',
      issn: '',
      publisher_type: 'journal',
      stratum_qualis_id: null,
    },
  });

  useEffect(() => {
    if (editingPublisher) {
      publisherForm.reset({
        name: editingPublisher.name,
        initials: editingPublisher.initials || '',
        issn: editingPublisher.issn || '',
        publisher_type: editingPublisher.publisher_type as 'journal' | 'conference',
        stratum_qualis_id: editingPublisher.stratum_qualis_id,
      });
    } else {
      publisherForm.reset({
        name: '',
        initials: '',
        issn: '',
        publisher_type: 'journal',
        stratum_qualis_id: null,
      });
    }
  }, [editingPublisher, isPublisherDialogOpen]);

  async function onSubmitFile(values: z.infer<typeof fileFormSchema>) {
    try {
      setImportStatus('uploading');
      const formData = new FormData();
      formData.append('file', values.file);

      await publisherService.createPublishersFromSpreadsheet(formData, spreadSheetType);
      toast.success("Upload da planilha realizado com sucesso");
      setImportStatus('success');

      // Delay closing to show success message
      setTimeout(() => {
        setIsImportOpen(false);
        setImportStatus('idle');
        fileForm.reset();
        fetchData();
      }, 1500);
    } catch (err) {
      console.error('Erro ao conectar com o servidor:', err);
      setImportStatus('error');
      toast.error("Erro ao realizar o upload da planilha");
    }
  }

  async function onSavePublisher(values: z.infer<typeof publisherFormSchema>) {
    try {
      const payload: Partial<Publisher> = {
        ...values,
        publisher_type: values.publisher_type || undefined
      } as Partial<Publisher>;

      if (editingPublisher) {
        await publisherService.updatePublisher(editingPublisher.id, payload);
        toast.success("Veículo atualizado com sucesso");
      } else {
        await publisherService.createPublisher(payload);
        toast.success("Veículo criado com sucesso");
      }
      setIsPublisherDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to save publisher", error);
      toast.error("Erro ao salvar veículo");
    }
  }

  async function confirmDelete() {
    if (!publisherToDelete) return;
    try {
      await publisherService.deletePublisher(publisherToDelete.id);
      toast.success("Veículo excluído com sucesso");
      setIsDeleteDialogOpen(false);
      setPublisherToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete publisher", error);
      toast.error("Erro ao excluir veículo");
    }
  }

  async function fetchData() {
    setIsLoading(true);
    try {
      const filters: Record<string, any> = {};
      let filterIndex = 0;

      if (search.trim()) {
        filters[`filters[${filterIndex}][field]`] = 'name';
        filters[`filters[${filterIndex}][value]`] = search.trim();
        filters[`filters[${filterIndex}][operator]`] = 'like';
        filterIndex++;
      }

      if (typeFilter !== 'all') {
        filters[`filters[${filterIndex}][field]`] = 'publisher_type';
        filters[`filters[${filterIndex}][value]`] = typeFilter;
        filters[`filters[${filterIndex}][operator]`] = '=';
        filterIndex++;
      }

      if (qualisFilter !== 'all') {
        filters[`filters[${filterIndex}][field]`] = 'qualis_code';
        filters[`filters[${filterIndex}][value]`] = qualisFilter;
        filters[`filters[${filterIndex}][operator]`] = '=';
        filterIndex++;
      }

      const response = await publisherService.getAllPublishers(page, perPage, filters);
      setPublishers(response.data);
      setPagination({
        ...response,
        meta: {
          ...response.meta,
          last_page: Math.max(1, response.meta.last_page),
        },
      });
    } catch (error) {
      console.error("Failed to fetch publishers", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchQualis() {
    try {
      const data = await qualisService.getAllQualis();
      setQualisOptions(data);
    } catch (error) {
      console.error("Failed to fetch qualis", error);
    }
  }

  useEffect(() => {
    fetchQualis();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, perPage, search, typeFilter, qualisFilter]);

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.meta.last_page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Periódicos e Conferências</h1>
          <p className="text-muted-foreground">Gerencie os veículos de publicação cadastrados.</p>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex gap-2"
            onClick={() => {
              setEditingPublisher(null);
              setIsPublisherDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Adicionar Veículo
          </Button>

          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2">
                <Upload className="h-4 w-4" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Importar Planilha Qualis</DialogTitle>
                <DialogDescription>
                  Selecione o tipo de veículo e envie o arquivo .xlsx para atualizar a base de dados.
                </DialogDescription>
              </DialogHeader>
              <Form {...fileForm}>
                <form onSubmit={fileForm.handleSubmit(onSubmitFile)} className="space-y-5 pt-4">
                  <div className='flex flex-col gap-3'>
                    <Label className="text-sm font-medium">Tipo de Veículo</Label>
                    <RadioGroup className='flex gap-6' defaultValue='journal' value={spreadSheetType} onValueChange={(value) => {
                      setSpreadSheetType(value as 'journal' | 'conference');
                    }}>
                      <div className='flex gap-2 items-center'>
                        <RadioGroupItem value='journal' id='journal-modal' />
                        <Label htmlFor="journal-modal" className="text-sm cursor-pointer">Periódico</Label>
                      </div>
                      <div className='flex gap-2 items-center'>
                        <RadioGroupItem value='conference' id='conference-modal' />
                        <Label htmlFor="conference-modal" className="text-sm cursor-pointer">Conferência</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <FormField
                    control={fileForm.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium">Arquivo (.xlsx)</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {!fileForm.watch('file') ? (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors border-muted-foreground/20">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-primary">Clique para selecionar</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">Planilha .xlsx</p>
                                </div>
                                <Input
                                  type='file'
                                  accept=".xlsx"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (!e.target.files) return;
                                    field.onChange(e.target.files[0]);
                                    setImportStatus('idle');
                                  }}
                                />
                              </label>
                            ) : (
                              <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-muted-foreground/10'>
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{fileForm.watch('file').name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(fileForm.watch('file').size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  className="h-8 w-8 shrink-0 hover:text-destructive"
                                  onClick={() => {
                                    fileForm.setValue('file', undefined as unknown as File);
                                    setImportStatus('idle');
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {importStatus === 'success' && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 text-center animate-in fade-in zoom-in duration-200">
                      Arquivo enviado com sucesso!
                    </div>
                  )}

                  {importStatus === 'error' && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 text-center animate-in fade-in zoom-in duration-200">
                      Falha no envio. Tente novamente.
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!fileForm.watch('file') || importStatus === 'uploading' || importStatus === 'success'}
                    >
                      {importStatus === 'uploading' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : 'Enviar arquivo'}
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      className="w-full text-muted-foreground"
                      onClick={() => {
                        setIsImportOpen(false);
                        setImportStatus('idle');
                        fileForm.reset();
                      }}
                      disabled={importStatus === 'uploading'}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="rounded-md border">
        <div className="flex flex-col gap-4 p-4 border-b bg-muted/20">
          {/* Tabs for Publisher Type */}
          <Tabs defaultValue="all" value={typeFilter} onValueChange={(val) => {
            setTypeFilter(val);
            setPage(1); // Reset to first page on filter change
          }} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="journal">Periódicos</TabsTrigger>
              <TabsTrigger value="conference">Conferências</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex flex-1 items-center gap-4 w-full">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome..."
                  className="pl-8 bg-background"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="w-[140px]">
                <Select
                  value={qualisFilter}
                  onValueChange={(val) => {
                    setQualisFilter(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Qualis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Qualis</SelectItem>
                    {Array.from(new Set(qualisOptions.map(q => q.code)))
                      .sort()
                      .map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="perPageSelect" className="text-sm text-muted-foreground whitespace-nowrap">
                Por página:
              </label>
              <select
                id="perPageSelect"
                className="border rounded px-2 py-1 text-sm w-full sm:w-auto bg-background"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Qualis</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : publishers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                publishers.map((publisher) => (
                  <TableRow key={publisher.id}>
                    <TableCell>
                      {publisher.publisher_type === 'journal'
                        ? (publisher.issn || '—')
                        : (publisher.initials || '—')}
                    </TableCell>
                    <TableCell className="capitalize">{publisher.name.toLowerCase()}</TableCell>
                    <TableCell>
                      {publisher.publisher_type === 'journal' ? 'Periódico' :
                        publisher.publisher_type === 'conference' ? 'Conferência' :
                          publisher.publisher_type}
                    </TableCell>
                    <TableCell>
                      {publisher.stratum_qualis?.code || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingPublisher(publisher);
                            setIsPublisherDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setPublisherToDelete(publisher);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <span className="text-sm text-muted-foreground">
              Página {pagination.meta.current_page} de {pagination.meta.last_page}
            </span>

            <div className="flex gap-2 w-full sm:w-auto">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                disabled={pagination.meta.current_page === 1}
                onClick={() => handlePageChange(1)}
              >
                {'<<'}
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={pagination.meta.current_page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Anterior
              </Button>

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={pagination.meta.current_page === pagination.meta.last_page}
                onClick={() => handlePageChange(page + 1)}
              >
                Próxima
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                disabled={pagination.meta.current_page === pagination.meta.last_page}
                onClick={() => handlePageChange(pagination.meta.last_page)}
              >
                {'>>'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Publisher Dialog (Create/Edit) */}
      <Dialog open={isPublisherDialogOpen} onOpenChange={setIsPublisherDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPublisher ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
            <DialogDescription>
              {editingPublisher
                ? 'Atualize as informações do veículo de publicação.'
                : 'Preencha as informações para cadastrar um novo veículo.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...publisherForm}>
            <form onSubmit={publisherForm.handleSubmit(onSavePublisher)} className="space-y-4 pt-4">
              <FormField
                control={publisherForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do veículo" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                {publisherForm.watch('publisher_type') === 'conference' && (
                  <FormField
                    control={publisherForm.control}
                    name="initials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sigla</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: SIGMOD" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {publisherForm.watch('publisher_type') === 'journal' && (
                  <FormField
                    control={publisherForm.control}
                    name="issn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISSN</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 0000-0000" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={publisherForm.control}
                  name="publisher_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || 'journal'}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="journal">Periódico</SelectItem>
                          <SelectItem value="conference">Conferência</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={publisherForm.control}
                  name="stratum_qualis_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualis</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val === 'none' ? null : Number(val))}
                        value={field.value?.toString() || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o Qualis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {qualisOptions
                            .filter(q => !publisherForm.watch('publisher_type') || q.type === publisherForm.watch('publisher_type'))
                            .map((q) => (
                              <SelectItem key={q.id} value={q.id.toString()}>
                                {q.code}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setIsPublisherDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={publisherForm.formState.isSubmitting}>
                  {publisherForm.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o veículo <strong>{publisherToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
