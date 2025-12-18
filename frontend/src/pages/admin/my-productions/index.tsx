'use client';

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
import { ArrowLeft, FileText, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ProductionDOIForm } from './components/doiForm';
import { ProductionCreateForm } from './components/productionForm';
import { ProductionXMLForm } from './components/xmlForm';

type StratumQualis = {
  id: number;
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
  last_qualis: string | null;
  doi: string | null;
}

type FormType = "none" | "xml" | "doi" | "other";

const updateProductionFormSchema = z.object({
  title: z.string(),
  year: z.number(),
  last_qualis: z.string(),
  doi: z.string()
});

export default function MyProductionsPage() {

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production>();
  const [chosenForm, setChosenForm] = useState<FormType>("none");

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

  var entries
  if (data) {
    entries = Object.entries(data)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => value as unknown as Production);

    entries.sort((a, b) => b.year - a.year);
  }

  async function onSubmit(values: z.infer<typeof updateProductionFormSchema>) {
    console.log(JSON.stringify(values))
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) {
      console.error('Ano Inválido');
      return;
    }

    const payload: RequestBodyType = {
      title: values.title,
      year: parsedYear,
      last_qualis: values.last_qualis,
      doi: values.doi
    }
    try {
      if (selectedProduction) {
        await api.updateProduction(selectedProduction.productions_id, JSON.stringify(payload));
      }
      const response = await api.updateUserPassword(JSON.stringify(payload))
      console.log(response.status);
    } catch (err) {
      console.error('Erro ao editar publicação:', err);
    }
  }

  function deleteProduction() {
    console.log('Deletar :', selectedProduction?.title)
    try {

    } catch (err) {
      console.error('Erro ao deletar a publicação:', err)
    }
  }

  const form = useForm<z.infer<typeof updateProductionFormSchema>>({
    resolver: zodResolver(updateProductionFormSchema),
    defaultValues: {
      title: selectedProduction?.title,
      year: selectedProduction?.year,
      last_qualis: selectedProduction?.last_qualis || undefined,
      doi: selectedProduction?.doi || undefined
    },
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar suas produções!</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className='flex justify-around'>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Produções</h1>
          {chosenForm == "none" &&
            <p className="text-muted-foreground">
              Visualize e edite suas produções.
            </p>
          }</div>
        {chosenForm != "none" ?
          <Button onClick={() => { setChosenForm("none") }}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
          :
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
        }
      </div>

      {/* Tabela */}
      {chosenForm === "none" ?
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Nome</TableHead>
                <TableHead className='text-center'>Ano</TableHead>
                <TableHead className='text-center'>Tipo</TableHead>
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
                entries?.map((production) => (
                  <TableRow key={production.productions_id}>

                    <TableCell className="font-medium">{production.title}</TableCell>
                    <TableCell className="font-medium text-center">
                      {production.year}
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {production.publisher_type}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduction(production)
                          setIsDeleteOpen(true)
                        }
                        }
                        title="Deletar"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
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
            <ProductionCreateForm />
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
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_qualis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ultima Qualis:</FormLabel>
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
                {selectedProduction?.publisher && (
                  <>
                    <p><strong>Local:</strong> {selectedProduction?.
                      publisher.name}</p>
                    {selectedProduction?.publisher.initials && (
                      <p><strong>Sigla:</strong>
                        {selectedProduction?.publisher.initials}</p>
                    )}
                    <p><strong>Tipo:</strong> {selectedProduction?.publisher.publisher_type}</p>
                    {selectedProduction?.publisher.issn && (
                      <p><strong>ISSN:</strong> {selectedProduction?.publisher.issn}</p>
                    )}
                  </>
                )}
                {selectedProduction?.publisher?.stratum_qualis && (
                  <p>
                    <strong>Qualis:</strong> {selectedProduction?.publisher.stratum_qualis.code}
                  </p>
                )}
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button onClick={() => setIsEditOpen(false)}>Fechar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog - Confirmar exclusão de produção */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="[&>button:last-child]:hidden">
          <DialogHeader>
            <DialogTitle className='text-center'> Tem certeza que deseja excluir a produção:</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <div><Label>Titulo: </Label>
             {selectedProduction?.title} </div>
            <div><Label>Ano: </Label>
            {selectedProduction?.productions_id} </div>
          </div>
          <DialogFooter className='w-full items-center'>
            <Button onClick={() => {
              setSelectedProduction(undefined)
              setIsDeleteOpen(false)
            }}>Cancelar</Button>
            <Button type="button" className='items-center bg-red-400 text-black hover:bg-red-600' onClick={deleteProduction}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
