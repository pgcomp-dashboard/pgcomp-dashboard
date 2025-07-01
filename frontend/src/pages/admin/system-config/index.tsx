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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import api, { parseApiError } from '@/services/api';

//Sample data for publications over years
const scrapingTimes = [
  { id: '1', time: '2014' },
  { id: '2', time: '2015' },
  { id: '3', time: '2025-02-21' },
  { id: '4', time: '2025-02-22' },
  { id: '5', time: '2025-04-21' },
  { id: '6', time: '2025-05-7' },
];

const systemConfigFormSchema = z.object({
  scrapingIntervalDays: z.coerce.number({ message: 'Número inválido' }).min(1, 'Número precisa ser maior que 0'),
});

export default function SystemConfigPage() {
  const [ scrapingHistory, setScrapingHistory ] = useState(scrapingTimes);

  async function executeScrapping() {
    try {
      const response = await api.executeScraping();
      const newScraping = { id: response.id, time: response.time };

      // Adiciona ao início da lista
      setScrapingHistory(prev => [ newScraping, ...prev ]);
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
    // TODO: remove this mock
    console.log(values);
  }

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
              name="scrapingIntervalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intervalo de scraping (dias)</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormDescription>
                    Intervalo em que será executado a tarefa de scraping para
                    atualizar as informações na dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Atualizar</Button>
            <Button className="ml-6" onClick={executeScrapping}>Executar Scrapping</Button>
          </form>
        </Form>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Últimas Execuções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scrapingHistory.map((scraping) => (
              <TableRow key={scraping.id}>
                <TableCell className="font-medium">{scraping.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
