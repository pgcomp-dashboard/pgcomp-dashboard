import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  TooltipProps,
} from 'recharts';
import { Settings2 } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { colorFromName } from '@/utils/color';
import './chart.css';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const periodFormSchema = z.object({
  from: z.coerce.number().min(2014, 'Ano não pode ser antes de 2014'),
  to: z.coerce.number().max(new Date().getFullYear(), 'Ano não pode ser maior que o atual'),
});

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border-2 rounded">
        <b>{label}</b>
        <br />
        {payload.map((ele, index) => (
          <>
            <text className="tooltip-text" key={index}>
              Produções em {label} : {ele.value}
            </text>
            <br />
          </>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProfessorProductionPerYear() {
  const [ currentProfessorId, setCurrentProfessorId ] = useState<number | null>(null);
  const [ period, setPeriod ] = useState<{
    from?: number,
    to?: number,
  }>({
    from: new Date().getFullYear() - 5,
    to: new Date().getFullYear(),
  });

  const { data: professors, error: professorsError } = useQuery({
    queryKey: [ 'professors' ],
    queryFn: () => api.professors(),
  });

  const { data: productions, error } = useQuery({
    queryKey: [ 'professorProductionPerYear', currentProfessorId, period.from, period.to ],
    queryFn: () => api.professorProductionPerYear(currentProfessorId as number, period.from, period.to),
    enabled: currentProfessorId !== null,
  });

  const periodForm = useForm<z.infer<typeof periodFormSchema>>({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      from: new Date().getFullYear() - 5,
      to: new Date().getFullYear(),
    },
  });

  function onSubmitPeriodForm(values: z.infer<typeof periodFormSchema>) {
    setPeriod({
      from: values.from ? values.from : period.from,
      to: values.to ? values.to : period.to,
    });
  }

  useEffect(() => {
    if (professors && professors.length > 0) {
      setCurrentProfessorId(professors[0].id);
    }
  }, [ professors ]);

  if (professorsError) return <>Falha ao carregar professores!</>;
  if (!professors) return <>Carregando professores...</>;
  if (professors.length == 0) return <>Não existem professores cadastrados!</>;

  if (!productions) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  const chartData = Object.entries(productions ?? {}).map(([ year, amount ]) => ({
    year,
    amount,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Produções de um professor por ano</CardTitle>
        <div className='flex flex-row space-x-2'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'><Settings2 /></Button>
            </DialogTrigger>
            <DialogContent>
              <Form {...periodForm}>
                <form onSubmit={periodForm.handleSubmit(onSubmitPeriodForm)} className="space-y-8">
                  <DialogHeader>
                    <DialogTitle>Selecionar período</DialogTitle>
                    <DialogDescription>
                      Você está atualizando o período apresentado no gráfico.
                    </DialogDescription>
                    <div className="border-t-1 w-full h-1 my-2" />
                    <FormField
                      control={periodForm.control}
                      name="from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>De</FormLabel>
                          <FormControl>
                            <Input placeholder="Ano" {...field} />
                          </FormControl>
                          <FormDescription>
                            Ano inicial.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={periodForm.control}
                      name="to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Até</FormLabel>
                          <FormControl>
                            <Input placeholder="Ano" {...field} />
                          </FormControl>
                          <FormDescription>
                            Ano final.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="border-t-1 w-full h-1 my-2" />
                    <br className="w-full" />
                    <div className="w-full flex justify-end space-x-2">
                      <DialogClose asChild><Button variant='outline'>Voltar</Button></DialogClose>
                      <DialogClose asChild><Button type='submit'>Salvar</Button></DialogClose>
                    </div>
                  </DialogHeader>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Select value={currentProfessorId?.toString()} onValueChange={v => setCurrentProfessorId(parseInt(v))}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione um professor" />
            </SelectTrigger>
            <SelectContent>
              {professors.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <InternalProductionChart chartData={chartData} />
      </CardContent>
    </Card>
  );
}

function InternalProductionChart({ chartData }: { chartData: { year: string, amount: number }[] }) {
  return (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={{
          year: {
            label: 'Ano',
            color: 'hsl(var(--chart-2))',
          },
          amount: {
            label: 'Número',
            color: 'hsl(var(--chart-3))',
          },
        }}
        className="w-full h-[400px]"
      >
        <BarChart margin={{ top: 20, right: 5, left: 5, bottom: 80 }} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            interval={0}
            tickFormatter={(name) =>
              name.length > 15 ? name.slice(0, 15) + '...' : name
            }
            style={{ fontSize: 18 }}
          />
          <YAxis style={{ fontSize: 18 }} />
          <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
          <Bar dataKey="amount" fill="#8884d8" label={{ position: 'top', style: { fontSize: 18 } }}> {/* Aumentando o tamanho da fonte do label da barra */}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorFromName(entry.year)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
