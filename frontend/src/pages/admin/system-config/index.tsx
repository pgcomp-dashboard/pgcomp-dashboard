import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api, { parseApiError } from '@/services/api';
import { formatDateTime } from '@/utils/dates';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const systemConfigFormSchema = z.object({
  scrapingIntervalDays: z.coerce.number({ message: 'Número inválido' }).min(1, 'Número precisa ser maior que 0'),
});

const lattesIdFormSchema = z.object({
  lattes_id: z.coerce.number({ message: 'Id inválido' }),
});

const MAX_FILE_SIZE = 5000000; // 5MB

const fileFormSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max size is 5MB.")
    .refine((file) => file?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Apenas arquivos .xlsx são suportados.")
})

export default function SystemConfigPage() {
  const [spreadSheetType, setSpreadSheetType] = useState<"journal" | "conference">("journal")
  const queryClient = useQueryClient();

  const { data: scrapingInterval } = useQuery({
    queryKey: [ 'scraping_interval' ],
    queryFn: () => api.getScrapingInterval(),
  });

  const { data: scrapingHistory, error: scrapingHistoryError } = useQuery({
    queryKey: [ 'scraping_execution' ],
    queryFn: () => api.getScrapingExecutions(),
  });

  async function executeScrapping() {
    console.log("Scrap execute form")
    try {
      await api.executeScraping();
      queryClient.invalidateQueries({ queryKey: [ 'scraping_execution' ] });
    } catch (error) {
      alert('Erro ao executar o scraping: ' + parseApiError(error));
    }
  }

  const form = useForm<z.infer<typeof systemConfigFormSchema>>({
    resolver: zodResolver(systemConfigFormSchema),
    defaultValues: {
      scrapingIntervalDays: 7,
    },
  });

  function onSubmit(values: z.infer<typeof systemConfigFormSchema>) {
    console.log("Scrap submit form")

    api.setScrapingInterval(values.scrapingIntervalDays);
  }

  const lattesIdForm = useForm<z.infer<typeof lattesIdFormSchema>>({
    resolver: zodResolver(lattesIdFormSchema),
    defaultValues: {
      lattes_id: 99999,
    }
  })

  async function onSubmitLattesId(values: z.infer<typeof lattesIdFormSchema>) {
    console.log("Lattes_id submit form")

    const request = {
      "lattes_id": values.lattes_id
    }

    try {
      await api.executeScrapingForAProfessor(request);
      queryClient.invalidateQueries({ queryKey: [ 'scraping_execution' ] });
    } catch (error) {
      alert('Erro ao executar o scraping: ' + parseApiError(error));
    }
  }


  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema)
  })

  async function onSubmitFile(values: z.infer<typeof fileFormSchema>) {
    try {
      const formData = new FormData()
      formData.append("file", values.file);

      const response = await api.createQualisBySpreadSheet(formData, spreadSheetType)

      if (response?.status === 200) {
        const result = await response.json();
        console.log("Sucesso:", result);
      } else {
        console.error("Erro no upload");
      }
    } catch (err) {
      console.error("Erro ao conectar com o servidor:", err);
    }
  }

  useEffect(() => {
    if (scrapingInterval) {
      form.setValue('scrapingIntervalDays', scrapingInterval.intervalDays);
    }
  }, [ form, scrapingInterval ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do sistema</h1>
          <p className="text-muted-foreground">Aqui você pode configurar o sistema do PGCOMP Dashboard.</p>
        </div>
      </div>
      <div className="rounded-md border p-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              disabled={!scrapingInterval}
              name="scrapingIntervalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intervalo de scraping (dias)</FormLabel>
                  <FormControl>
                    <Input disabled={!scrapingInterval} type='number' {...field} />
                  </FormControl>
                  <FormDescription>
                    Intervalo em que será executado a tarefa de scraping para
                    atualizar as informações na dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!scrapingInterval} type="submit">Atualizar</Button>
            <Button variant="outline" className="ml-6" onClick={executeScrapping}>Executar scrapping agora</Button>
          </form>
        </Form>
      </div>
      <div className="rounded-md border p-12">
        <Form {...lattesIdForm}>
          <form onSubmit={lattesIdForm.handleSubmit(onSubmitLattesId)} className="space-y-8">
            <FormField
              control={lattesIdForm.control}
              name="lattes_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lattes ID Scraping</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormDescription>
                    Executa o scrapping para 1 professor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="outline" type="submit" className="ml-6">Executar</Button>
          </form>
        </Form>
      </div>
      <div className="rounded-md border p-12">
        <Form {...fileForm}>
          <form onSubmit={fileForm.handleSubmit(onSubmitFile)} className="space-y-8">
            <div className='flex flex-col gap-4'>
              <FormLabel>Planilha Qualis</FormLabel>
              <RadioGroup className='flex' defaultValue='journal' onValueChange={(value) => {
                setSpreadSheetType(value as "journal" | "conference")
              }}>
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='journal' id='journal' />
                  <Label>Revista</Label>
                </div>
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='conference' id='conference' />
                  <Label>Conferencia</Label>
                </div>
              </RadioGroup>
            </div>
            <FormField
              control={fileForm.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type='file' onChange={(e) => {
                      if (!e.target.files) return
                      field.onChange(e.target.files[0])
                    }} />
                  </FormControl>
                  <FormDescription>
                    Arquivo que será utilizado para popular/atualizar os qualis das revistas ou conferencias
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="outline" type="submit" className="ml-6" disabled={fileForm.formState.isSubmitting}>{fileForm.formState.isSubmitting ? "Enviando..." : "Upload"}</Button>
          </form>
        </Form>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico do scraping</h1>
          <p className="text-muted-foreground">Aqui você pode visualizar as últimas vezes em que o serviço de scraping foi executado.</p>
        </div>
      </div>
      { scrapingHistoryError ? (
        <>Erro ao carregar histórico!</>
      ) : (
        scrapingHistory ? (
          <div className="rounded-md border">
            <Table>
              <TableCaption>Lista das últimas execuções do scraping</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">ID</TableHead>
                  <TableHead className="font-medium">Comando</TableHead>
                  <TableHead className="font-medium">Horário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scrapingHistory.map((scraping) => (
                  <TableRow key={scraping.id}>
                    <TableCell>{scraping.id}</TableCell>
                    <TableCell>{scraping.command}</TableCell>
                    <TableCell>{formatDateTime(new Date(scraping.executed_at))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
          <>Carregando...</>
        )
      ) }
    </div>
  );
}
