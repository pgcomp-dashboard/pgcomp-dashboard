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

type UploadStatus = "idle" | "uploading" | "success" | "error";

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
        setIsDeleteOpen(false)
      }
      console.log(response.message)
    } catch (err) {
      console.error('Erro ao deletar a publicação:', err)
    }
  }

  function fullDelete(productions: Production[]) {
    productions.forEach(async element => {
      try {
        const response = await api.deleteProduction(element.productions_id);
        if (response.status == '200') { console.log(response.message) }
      } catch (err) {
        console.log(err)
      }
    });
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
    <div className="flex flex-col gap-4">
      {chosenForm != "none" ?
        <div>
          <Button onClick={() => { setChosenForm("none") }}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
        </div>
        :
        <div className='flex justify-around'>
          <div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Minhas Produções</h1>
              <Button onClick={() => fullDelete(productionList)}>Deletar Todas</Button>
            </div>
            <p className="text-muted-foreground">
              Visualize e edite suas produções.
            </p>
          </div>
          <div className='flex flex-col gap-2 justify-center items-center'>
            <Label>Adicionar Produção</Label>
            <div className='flex gap-2'>
              <Button data-cy="add-area-button" className='w-auto' onClick={() => { setChosenForm("xml") }}>
                <Plus className="mr-2 h-4 w-4" />
                XML
              </Button>
              <Button data-cy="add-area-button" onClick={() => { setChosenForm("doi") }}>
                <Plus className="mr-2 h-4 w-4" />
                DOI
              </Button>
              <Button data-cy="add-area-button" onClick={() => {
                setChosenForm("other")
              }}>
                <Plus className="mr-2 h-4 w-4" />
                FORM
              </Button>
            </div>
          </div>
        </div>
      }

      {/* Tabela */}
      {chosenForm === "none" ?
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Título</TableHead>
                <TableHead className='text-center'>Ano</TableHead>
                <TableHead className='text-center'>Tipo</TableHead>
                <TableHead className='text-center'>Qualis</TableHead>
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
                      {production.publisher?.stratum_qualis?.code} -
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
                              setIsDeleteOpen(true)
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
                                    setIsDeleteOpen(false)
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
        : chosenForm === "xml" ?
          <ProductionXMLForm />
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
              <Button type="button" onClick={() => setIsEditOpen(false)}>Fechar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
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
    <div className='flex flex-col items-center align-middle'>
      <div className='flex flex-col w-1/2 gap-4 items-center align-middle'>
        <h1 className="text-3xl font-bold">Adicionar com D.O.I</h1>
        <h1 className="text-muted-foreground">Adicione suas produções a partir do D.O.I.</h1>
        {
          <RadioGroup className='flex' defaultValue='conference' onValueChange={handleValueChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value='conference' id='conference' />
              <Label>Conferencia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value='journal' id='journal' />
              <Label>Revista</Label>
            </div>
          </RadioGroup>
        }
        <div className="flex flex-col rounded-md gap-4">
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
    <div className="flex flex-col w-full items-center align-middle">
      <div className="flex flex-col rounded-md gap-4">
        <div className="flex flex-col items-center align-middle">
          <h1 className="text-3xl font-bold">Adicionar manualmente</h1>
          <h1>Adicione uma produção no sistema</h1>
        </div>
        <div className="flex flex-col items-center align-middle">
          <RadioGroup className='flex' defaultValue='conference' onValueChange={handleValueChange}>
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
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="flex flex-row gap-2">
                        <Label>Buscar Revista/Conferência: </Label>
                        <Input placeholder="ISSN/Sigla" type="text" onChange={handleInput} />
                        <Button type='button' onClick={() => {
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
                            <div>
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
              <Button type="submit">Criar Produção</Button>
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

function ProductionXMLForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  async function onSubmit() {
    console.log("Submiting")
    if (!file) return;
    console.log("Tem File")
    setStatus("uploading")
    console.log(file)

    const formData = new FormData()
    formData.append('file', file)

    try {
      //console.log(api.getAuthToken())
      const response = await fetch(api.getBaseUrl+'/api/portal/user/lattes-update', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + api.getAuthToken(),
        },
        body: formData
      });
      console.log(response)
      if (response.status === 201) toast.success("Produções cadastradas com sucesso")
    } catch (err) {
      toast.error("Erro no cadastro das produções")
      console.error('Erro ao criar produções:', err);
    }
  }

  return (
    <div className='flex flex-col items-center align-middle'>
      <div className='flex flex-col w-1/3 gap-4 items-center align-middle'>
        <h1 className="text-3xl font-bold">Adicionar com XML</h1>
        <p className="text-muted-foreground text-center">Adicione suas produções a partir do XML do lattes, coloque o arquivo zip disponibilizado ao baixar.</p>
        <div className="flex flex-col rounded-md gap-4">
          <Input type="file" onChange={handleFileChange} />
          {file && status !== "uploading" &&
            <Button type="submit" disabled={!file} onClick={onSubmit}>Enviar</Button>
          }
          <div>
            {file &&
              <div>
                <div>{file.name}</div>
                <div>{(file.size / 1024).toFixed(2)} Kb</div>
                <div>{file.type}</div>
              </div>}
            {status === 'success' && (
              <p>
                File Uploaded sucessfuly
              </p>
            )
            }
            {status === 'error' && (
              <p>
                Uploaded failed
              </p>
            )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
