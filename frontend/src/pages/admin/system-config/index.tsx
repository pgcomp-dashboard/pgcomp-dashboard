import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api, { parseApiError } from '@/services/api';
import { formatDateTime } from '@/utils/dates';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const systemConfigFormSchema = z.object({
  scrapingIntervalDays: z.coerce.number({ message: 'Número inválido' }).min(1, 'Número precisa ser maior que 0'),
});

export default function SystemConfigPage() {
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
    api.setScrapingInterval(values.scrapingIntervalDays);
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
