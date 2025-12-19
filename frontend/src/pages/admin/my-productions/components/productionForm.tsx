import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import api from '@/services/api';
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface RequestBodyType {
  title: string;
  year: number;
  publisher_type: string | null;
  publisher_id: number | null;
}

type StratumQualis = {
  id: number;
  code: string;
  score: number;
  created_at: string;
  updated_at: string;
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

type ProductionFormProps = {
  qualisList: StratumQualis[]
}

const createProductionFormSchema = z.object({
  title: z.string(),
  year: z.coerce.number(),
});

export function ProductionCreateForm() {

  const [production, setProduction] = useState<Production>();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [publisherType, setPublisherType] = useState('');
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

    const payload: RequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: publisher?.publisher_type || null,
      publisher_id: publisher?.id || null,
    }

    try {
      const response = await api.createUserProduction(JSON.stringify(payload));
      setProduction(response.data);
      setIsConfirmationOpen(true)
    } catch (err) {
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
      setPublisher(response)
      if (!response) setPublisherNotFound(true);
      if (response.stratum_qualis_id) console.log(response.stratum_qualis?.code)
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
          <RadioGroup className='flex' defaultValue='journal' onValueChange={handleValueChange}>
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
                      publisherType == "journal" ?
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
                          <b>CÓDIGO QUALIS:</b> {publisher.stratum_qualis_id &&
                            publisher.stratum_qualis?.code}
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
