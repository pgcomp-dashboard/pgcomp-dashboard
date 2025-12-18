import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import api from '@/services/api';
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useEffect, useState } from "react";
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

const createProductionFormSchema = z.object({
  title: z.string(),
  year: z.coerce.number(),
});

export function ProductionCreateForm() {
  const [production, setProduction] = useState<Production>();
  const [qualisList, setQualisList] = useState<StratumQualis[]>([]);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [publisherType, setPublisherType] = useState('');
  const [publisherNotFound, setPublisherNotFound] = useState(false);
  const [publisherSearch, setPublisherSearch] = useState<string>('')

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
      console.log(response.status);
    } catch (err) {
      console.error('Erro ao criar publicação:', err);
    }
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value)
      setPublisherSearch(e.target.value)
  }

  function handleValueChange(value: string) {
    setPublisherType(value)
    console.log(value)
  }

  async function getPublisherByIssn(issn: string) {
    if (!issn) return
    setPublisherNotFound(false)
    try {
      const response = await api.getJournalByIssn(issn)
      setPublisher(response)
      if (!response) setPublisherNotFound(true);
      if (response.stratum_qualis_id) console.log(qualisList[response.stratum_qualis_id].code)
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
    <>
      <div className="flex flex-col rounded-md gap-3">
        <h1>Adicione uma publicação no sistema</h1>
        <div>
          {
            <RadioGroup defaultValue='journal' onValueChange={handleValueChange}>
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
        </div>
      </div>
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
                  <TableCell>
                    <Label>Issn/Sigla:</Label>
                  </TableCell>
                  <TableCell>
                    <Input type="text" onChange={handleInput} />
                  </TableCell>
                  <TableCell>
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
                    {publisher &&
                      <div>
                        <div>
                          <b>NOME:</b> {publisher.name}
                        </div>
                        <div>
                          <b>CÓDIGO QUALIS:</b> {publisher.stratum_qualis_id &&
                            qualisList[publisher.stratum_qualis_id].code}
                        </div>
                      </div>
                    }
                  </TableRow>
                  :
                  <div>{publisherType == 'journal' ? 'Revista' : 'Conferencia'} não encontrada</div>
                }
              </TableBody>
            </Table>
          </div>
          <Button type="submit">Criar Produção</Button>
        </form>
      </Form >
    </>
  )
}
