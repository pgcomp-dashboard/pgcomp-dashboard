'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import UploadXMLForm from '@/components/UploadXMLForm';
import api from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, Loader2, Plus, Trash } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';

type StratumQualis = {
  id: number;
  type: string;
  code: string;
  score: number;
  created_at: string;
  updated_at: string;
};

type Production = {
  productions_id: number;
  title: string;
  year: number;
  created_at: string;
  updated_at: string;
  publisher_type: string | null;
  publisher_id: number | null;
  last_qualis: string | null;
  stratum_qualis_id: number | null;
  sequence_number: number | null;
  doi: string | null;
  publisher: Publisher | null;
  source: string
};

type Publisher = {
  id: number;
  initials: string | null;
  name: string;
  publisher_type: string;
  issn: string | null;
  percentile: string | null;
  update_date: string | null;
  tentative_date: string | null;
  logs: string | null;
  stratum_qualis_id: number | null;
  created_at: string;
  updated_at: string;
  stratum_qualis: StratumQualis | null;
};

interface RequestBodyType {
  title: string;
  year: number;
  stratum_qualis_id: number | null;
  doi: string | null;
}

interface CreateRequestBodyType {
  title: string;
  year: number;
  publisher_type: string | null;
  publisher_id: number | null;
}

type FormType = "none" | "xml" | "doi" | "other";

const updateProductionFormSchema = z.object({
  title: z.string().min(1, "Campo obrigatório"),
  year: z.coerce.number().min(1900, "Ano inválido"),
  qualis: z.string().min(1, "Campo obrigatório"),
  doi: z.string().min(1, "Campo obrigatório")
});

const createProductionFormSchema = z.object({
  title: z.string(),
  year: z.coerce.number(),
});

export default function MyProductionsPage() {

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [qualisList, setQualisList] = useState<StratumQualis[]>([]);
  const [productionList, setProductionList] = useState<Production[]>([])
  const [selectedProduction, setSelectedProduction] = useState<Production>();
  const [chosenForm, setChosenForm] = useState<FormType>("none");

  useEffect(() => {
    async function fetchQualis() {
      try {
        const qualis = await api.getAllQualis();
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
    queryKey: ['productions'],
    queryFn: () =>
      api.getProductionsOfUser(),
    placeholderData: (prevData) => prevData,
  });

  var entries: Production[] = []

  useEffect(() => {
    if (data) {
    entries = Object.entries(data)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => value as unknown as Production);

    entries.sort((a, b) => b.year - a.year);
    if(productionList.length == 0) setProductionList(entries)

    }
  }, [data])

  async function onSubmit(values: z.infer<typeof updateProductionFormSchema>) {
    console.log("Submiting")
    console.log(JSON.stringify(values))
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) {
      console.error('Ano Inválido');
      return;
    }

    const qualis = qualisList.filter((item) => item.type === selectedProduction?.publisher_type).find((item) => item.code === values.qualis)

    const payload: RequestBodyType = {
      title: values.title,
      year: parsedYear,
      stratum_qualis_id: qualis ? qualis.id : null,
      doi: values.doi
    }
    try {
      if (selectedProduction) {
        const response = await api.updateProduction(selectedProduction.productions_id, JSON.stringify(payload));
        console.log(response.status);
        if (response) {
          toast.success("Atualizado com sucesso")
          setIsEditOpen(false);
        }
      }
    } catch (err) {
      console.error('Erro ao editar publicação:', err);
    }
  }

  async function deleteProduction(id: number) {
    console.log('Deletar :', selectedProduction?.title)
    try {
      if (!selectedProduction) return;
      const response = await api.deleteProduction(id);
      if (response.status == '200') {
        const list = productionList.filter((entry) => { return entry.productions_id !== selectedProduction.productions_id })
        setProductionList(list)
        toast.success("Produção deletada com sucesso.");
      }
      console.log(response.message)
    } catch (err) {
      console.error('Erro ao deletar a produção:', err)
    }
  }

  async function fullDelete() {
    try {
      const response = await api.clearProduction()
      console.log(response)
      if (response.status == '200') {
        setProductionList([]);
        toast.success("Produções deletadas com sucesso.");
      }

    } catch (err) {
      toast.error("Erro ao deletar produções.")
    }
    // productions.forEach(async element => {
    //   try {
    //     const response = await api.deleteProduction(element.productions_id);
    //     if (response.status == '200') { console.log(response.message) }
    //   } catch (err) {
    //     console.log(err)
    //   }
    // });
  }

  const form = useForm<z.infer<typeof updateProductionFormSchema>>({
    resolver: zodResolver(updateProductionFormSchema),
    defaultValues: {
      title: selectedProduction?.title,
      year: selectedProduction?.year,
      doi: selectedProduction?.doi || undefined
    },
  });

  useEffect(() => {
    if (selectedProduction && isEditOpen) {
      form.reset({
        title: selectedProduction.title,
        year: selectedProduction.year,
        qualis: selectedProduction.last_qualis || "",
        doi: selectedProduction.doi || ""
      });
    }
  }, [selectedProduction, isEditOpen, form]);

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar suas produções!</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className='flex flex-col items-center gap-2 w-full' >
        <div className='flex flex-col items-center gap-2'>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Minhas Produções</h1>
          <p className="text-muted-foreground">
            Visualize, crie e edite suas produções.
          </p>
        </div>
        <div className='flex w-full justify-start'>
          <div className='flex flex-col gap-4 md:justify-around'> <Label>Adicionar Produção</Label>
            <div className='flex flex-row flex-wrap gap-2'>
              {chosenForm != "none" &&
            <div>
              <Button onClick={() => { setChosenForm("none") }}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
            </div>
              }
              {chosenForm != "xml" &&
                <Button data-cy="add-area-button" className='w-[calc(50%-0.25rem)] sm:w-auto' onClick={() => { setChosenForm("xml") }}>
                  <Plus className="mr-2 h-4 w-4" />
                  XML
                </Button>
              }
              {chosenForm != "doi" &&
                <Button data-cy="add-area-button" className='w-[calc(50%-0.25rem)] sm:w-auto' onClick={() => { setChosenForm("doi") }}>
                  <Plus className="mr-2 h-4 w-4" />
                  DOI
                </Button>
              }
              {chosenForm != "other" &&
                <Button data-cy="add-area-button" className='w-[calc(50%-0.25rem)] sm:w-auto' onClick={() => { setChosenForm("other") }}>
                  <Plus className="mr-2 h-4 w-4" />
                  FORM
                </Button>
              }
              {chosenForm == "none" &&
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      data-cy="add-area-button"
                      className='w-[calc(50%-0.25rem)] sm:w-auto bg-red-400 hover:bg-red-500'>
                      Deletar Todas
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogPortal>
                    <AlertDialogOverlay />
                    <AlertDialogContent>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso vai permanentemente deletar todas as produções.
                      </AlertDialogDescription>
                      <div className="flex justify-end gap-4">
                        <AlertDialogCancel asChild>
                          <Button className="bg-white text-black">Cancelar</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button className="bg-red-400 hover:bg-red-500" onClick={() => fullDelete()}>Sim, deletar produção</Button>
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialogPortal>
                </AlertDialog>
              }
              </div>
          </div>
        </div>
      </div>
      {/* Tabela */}
      {chosenForm === "none" ?
        <>
          {/* Desktop: Tabela */}
          <div className="hidden w-full md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-center'>Título</TableHead>
                  <TableHead className='text-center'>Ano</TableHead>
                  <TableHead className='text-center'>Tipo</TableHead>
                  <TableHead className='text-center'>Origem</TableHead>
                  <TableHead className='text-center'>Qualis</TableHead>
                  <TableHead className='text-center'>Pontuação</TableHead>
                  <TableHead className='text-center'>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.length == 0 ?
                  <TableRow>
                    <TableCell className='flex items-center justify-center'>
                      Não foram encontradas produções cadastradas para o usuário
                    </TableCell>
                  </TableRow>
                  :
                  productionList.map((production) => (
                    <TableRow key={production.productions_id}>
                      <TableCell className="font-medium">{production.title}</TableCell>
                      <TableCell className="font-medium text-center">
                        {production.year}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {production.publisher_type ? production.publisher_type : "NI"}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {production.publisher_type ? production.source : "NI"}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {production.publisher?.stratum_qualis?.code}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {production.publisher?.stratum_qualis?.score}
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduction(production)
                            setIsEditOpen(true)
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
                                setSelectedProduction(production)
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
                                      setSelectedProduction(undefined)
                                    }}>Cancelar
                                  </Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button className="bg-red-400 hover:bg-red-500" onClick={() => {
                                    if (selectedProduction) deleteProduction(selectedProduction.productions_id)
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
          <div className="md:hidden flex flex-col gap-3">
            {data?.length == 0 ?
              <div className='p-4 text-center text-muted-foreground'>
                Não foram encontradas produções cadastradas para o usuário
              </div>
              :
              productionList.map((production) => (
                <div key={production.productions_id} className="rounded-lg border p-4 bg-white">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-2 flex-1">{production.title}</h3>
                      <span className="text-sm font-medium text-primary whitespace-nowrap">{production.year}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Tipo</span>
                        <span className="font-medium">{production.publisher_type ? production.publisher_type : "NI"}</span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-xs text-muted-foreground">Qualis</span>
                        <span className="font-medium">
                          {production.publisher?.stratum_qualis?.code} - {production.publisher?.stratum_qualis?.score}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedProduction(production)
                          setIsEditOpen(true)
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 text-red-500 hover:text-red-600"
                            onClick={() => {
                              setSelectedProduction(production)
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogPortal>
                          <AlertDialogOverlay />
                          <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso vai permanentemente deletar a produção {selectedProduction?.title}.
                            </AlertDialogDescription>
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                              <AlertDialogCancel asChild>
                                <Button className="bg-white text-black"
                                  onClick={() => {
                                    setSelectedProduction(undefined)
                                  }}>Cancelar
                                </Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button className="bg-red-400 hover:bg-red-500" onClick={() => {
                                  if (selectedProduction) deleteProduction(selectedProduction.productions_id)
                                }}>Sim, deletar produção</Button>
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialogPortal>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
        : chosenForm === "xml" ?
          <UploadXMLForm />
          : chosenForm === "doi" ?
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
                        {selectedProduction?.year || "N/A"}
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
                  name="qualis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualis:</FormLabel>
                      <FormDescription>
                        {selectedProduction?.last_qualis || "N/A"}
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
                        {selectedProduction?.doi || "N/A"}
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
                  {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
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
  const [doi, setDoi] = useState<String>('');
  const [publisherType, setPublisherType] = useState('conference');

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      setDoi(e.target.value)
    }
  }

  function handleValueChange(value: string) {
    setPublisherType(value)
  }

  async function createProduction() {
    if (!doi) return;

    const request = {
      'type': publisherType,
      'doi': doi
    }
    console.log("Enviando")
    try {
      const response = await api.createProductionDoi(request)
      console.log(response)
      if (response.status == 201) {
        toast.success('Criado com sucesso')
      }
    } catch (err) {
      toast.error('Erro ao criar produção')
      console.error('Erro ao criar produção:', err);
    }
  }

  return (
    <div className='flex flex-col w-full items-center align-middle px-4'>
      <div className='flex flex-col w-full md:w-1/2 gap-4 items-center align-middle'>
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Adicionar com D.O.I</h1>
        <h1 className="text-muted-foreground text-center">Adicione suas produções a partir do D.O.I.</h1>
        {
          <RadioGroup className='flex flex-row gap-6 md:gap-4' defaultValue='conference' onValueChange={handleValueChange}>
            <div className="flex w-1/2 items-center space-x-2">
              <RadioGroupItem value='conference' id='conference' />
              <Label>Conferencia</Label>
            </div>
            <div className="flex w-1/2 items-center space-x-2">
              <RadioGroupItem value='journal' id='journal' />
              <Label>Revista</Label>
            </div>
          </RadioGroup>
        }
        <div className="flex flex-col rounded-md gap-4 w-full">
          <Input placeholder='D.O.I' type="text" onChange={handleInput} />
          <Button onClick={createProduction}>Importar produções</Button>
        </div>
      </div>
    </div>
  )
}

function ProductionCreateForm({ qualis }: { qualis: StratumQualis[] }) {

  const [production, setProduction] = useState<Production>();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [publisherType, setPublisherType] = useState('conference');
  const [publisherNotFound, setPublisherNotFound] = useState(false);
  const [publisherSearch, setPublisherSearch] = useState<string>('')

  const form = useForm<z.infer<typeof createProductionFormSchema>>({
    resolver: zodResolver(createProductionFormSchema),
    defaultValues: {
      title: '',
      year: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof createProductionFormSchema>) {

    console.log('Chamou o submit')
    console.log(JSON.stringify(values))

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
    }

    try {
      const response = await api.createUserProduction(JSON.stringify(payload));
      setProduction(response.data);
      toast.success("Produção Criada com sucesso")
    } catch (err) {
      toast.error("Erro ao criar Produção")
      console.error('Erro ao criar produção:', err);
    }
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value)
      setPublisherSearch(e.target.value)
  }

  function handleValueChange(value: string) {
    setPublisherType(value)
  }

  async function getPublisherByIssn(issn: string) {
    if (!issn) return
    setPublisherNotFound(false)
    try {
      const response = await api.getJournalByIssn(issn)
      if (response) {
        setPublisher(response);
      } else {
        setPublisherNotFound(true);
      }
    } catch (err) {
      console.log('Erro ao buscar revista', err)
    }

  }

  async function getPublisherByInitials(initials: string) {
    if (!initials) return
    setPublisherNotFound(false)
    try {
      const response = await api.getConferenceByInitial(initials)
      setPublisher(response)
      if (!response) setPublisherNotFound(true);
    } catch (err) {
      console.log('Erro ao buscar conferencia', err)
    }
  }

  return (
    <div className="flex flex-col w-full items-center align-middle px-4">
      <div className="flex flex-col rounded-md gap-4 w-full sm:w-11/12 md:w-4/5 lg:w-3/4">
        <div className="flex flex-col items-center align-middle">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Adicionar manualmente</h1>
          <h1 className="text-center">Adicione uma produção no sistema</h1>
        </div>
        <div className="flex flex-col items-center align-middle">
          <RadioGroup className='flex flex-col sm:flex-row gap-3' defaultValue='conference' onValueChange={handleValueChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value='conference' id='conference' />
              <Label>Conferencia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value='journal' id='journal' />
              <Label>Revista</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Produção:</FormLabel>
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
                      <FormLabel>Ano:</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="flex flex-col sm:flex-row gap-2 p-4">
                          <Label className="min-w-fit self-center">Buscar Revista/Conferência: </Label>
                          <Input placeholder="ISSN/Sigla" type="text" onChange={handleInput} />
                          <Button type='button' className="w-full sm:w-auto" onClick={() => {
                            publisherType === "journal" ?
                              getPublisherByIssn(publisherSearch)
                              :
                              getPublisherByInitials(publisherSearch)
                          }}>Buscar</Button>
                        </TableCell>
                      </TableRow>
                      {!publisherNotFound ?
                        <TableRow>
                          <TableCell>
                            {publisher &&
                              <div className="flex flex-col gap-1 text-sm">
                                <div>
                                  <b>NOME:</b> {publisher.name}
                                </div>
                                <div>
                                  <b>CÓDIGO QUALIS:</b> {qualis.find((item) => item.id === publisher.stratum_qualis_id)?.code}
                                </div>
                              </div>
                            }
                          </TableCell>
                        </TableRow>
                        :
                        <TableRow>
                          <TableCell>
                            <div>{publisherType === 'journal' ? 'Revista' : 'Conferencia'} não encontrada</div>
                          </TableCell>
                        </TableRow>
                      }
                    </TableBody>
                  </Table>
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-auto">Criar Produção</Button>
            </form>
          </Form >
        </div>
      </div>

      {/* Dialog - Confirmar exclusão de produção */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="[&>button:last-child]:hidden">
          <DialogHeader>
            <DialogTitle className='text-center'> Sua Produção foi cadastrada com Sucesso:</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <div><Label>Titulo: </Label>
              {production?.title} </div>
            <div><Label>Ano: </Label>
              {production?.year} </div>
          </div>
          <DialogFooter className='w-full items-center'>
            <Button type="button" className='items-center bg-green-400 hover:bg-green-500' onClick={() => {
              setIsConfirmationOpen(false)
              form.resetField('title')
              form.resetField('year')
            }}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// function ProductionXMLForm() {
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState<UploadStatus>("idle");

//   function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
//     if (e.target.files) {
//       setFile(e.target.files[0])
//     }
//   }

//   async function onSubmit() {
//     if (!file) return;
//     setStatus("uploading")
//     const apiUrl = api.getBaseUrl() + '/api/portal/user/lattes-update';


//     const formData = new FormData()
//     formData.append('file', file)

//     try {
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer ' + api.getAuthToken(),
//         },
//         body: formData
//       });
//       console.log(response)
//       if (response.status === 201) {
//         toast.success("Produções cadastradas com sucesso")
//         setStatus("success")
//       } else {
//         setStatus("error")
//         toast.error("Erro no cadastro das produções")
//       }
//     } catch (err) {
//       setStatus("error")
//       toast.error("Erro no cadastro das produções")
//       console.error('Erro ao criar produções:', err);
//     }
//   }

//   return (
//     <div className='flex flex-col w-full items-center align-middle px-4'>
//       <div className='flex flex-col w-2/3 md:w-1/2 lg:w-1/3 gap-4 items-center align-middle'>
//         <h1 className="text-2xl sm:text-3xl font-bold text-center">Adicionar com XML</h1>
//         <p className="text-muted-foreground text-center">Adicione suas produções a partir do XML do lattes, coloque o arquivo zip disponibilizado ao baixar.</p>
//         <div className="flex flex-col rounded-md gap-4 w-full">
//           <Input type="file" onChange={handleFileChange} />

//           <Button type="submit" disabled={!file || status === 'uploading'} onClick={onSubmit}>
//             {status === 'uploading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             {status === 'uploading' ? "Enviando..." : "Enviar"}
//           </Button>

//           <div>
//             {file &&
//               <div className='text-sm text-muted-foreground mb-2'>
//                 <div>Arquivo: {file.name}</div>
//                 <div>Tamanho: {(file.size / 1024).toFixed(2)} Kb</div>
//               </div>}
//             {status === 'success' && (
//               <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-200">
//                 Arquivo enviado com sucesso! As produções estão sendo processadas.
//               </div>
//             )
//             }
//             {status === 'error' && (
//               <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
//                 Falha no envio do arquivo. Tente novamente.
//               </div>
//             )
//             }
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
