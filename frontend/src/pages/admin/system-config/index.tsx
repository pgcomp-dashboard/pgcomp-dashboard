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

const systemConfigFormSchema = z.object({
  scrapingIntervalDays: z.coerce.number({ message: 'Número inválido' }).min(1, 'Número precisa ser maior que 0'),
});

export default function SystemConfigPage() {
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
          </form>
        </Form>
      </div>
    </div>
  );
}
