import { RotateCw, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { configurationService } from '@/services/modules/configuration.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colorFromName } from '@/utils/color';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { z } from 'zod';
import './chart.css';

import ExpandChartButton from '@/components/ui/ExpandChartButton';
import { useExpandableChart } from '@/features/dashboard/hooks/useExpandableChart';
import useAuth from '@/hooks/auth';
import { dashboardService } from '@/services/modules/dashboard.service';
import ChartScrollWrapper from './ChartScrollWrapper';

const MAX_VISIBLE_BARS = 15;

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
          <div key={index}>
            Produções em {label} : {ele.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProfessorProductionPerYear() {
  const auth = useAuth();
  const [currentProfessorId, setCurrentProfessorId] = useState<number | null>(null);
  const [period, setPeriod] = useState<{
    from?: number,
    to?: number,
  }>({
    from: undefined,
    to: undefined,
  });
  const [ publisherType, setPublisherType ] = useState<'journal' | 'conference' | undefined>(undefined);

  const { data: professors, error: professorsError } = useQuery({
    queryKey: ['professors', 'dashboard'],
    queryFn: () => dashboardService.professors(),
    enabled: !!auth?.isAdmin,
  });

  const { data: rulesData } = useQuery({
    queryKey: ['configuration', 'rules'],
    queryFn: () => configurationService.getRulesEndAndStartYears(),
    enabled: !!auth?.isAdmin,
  });

  const { data: productions, error, isFetching, refetch } = useQuery({
    queryKey: [ 'professorProductionPerYear', currentProfessorId, period.from, period.to, publisherType ],
    queryFn: () => dashboardService.professorProductionPerYear(
      currentProfessorId as number,
      period.from,
      period.to,
      publisherType
    ),
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
    if (rulesData) {
      setPeriod({
        from: rulesData.startYear,
        to: rulesData.endYear,
      });
      periodForm.reset({
        from: rulesData.startYear,
        to: rulesData.endYear,
      });
    }
  }, [rulesData, periodForm]);

  useEffect(() => {
    if (professors && professors.length > 0) {
      setCurrentProfessorId(professors[0].id);
    }
  }, [professors]);

  if (professorsError) return <>Falha ao carregar professores!</>;
  if (!professors) return <>Carregando professores...</>;
  if (professors.length === 0) return <>Não existem professores cadastrados!</>;

  if (!productions) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  const chartData = Object.entries(productions ?? {}).map(([year, amount]) => ({
    year,
    amount: amount as number,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <CardTitle>Produções de um professor por ano</CardTitle>
        <div className='flex flex-wrap items-center gap-2'>
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
                    <div className="w-full flex justify-start space-x-2">
                      <DialogClose asChild><Button variant='outline'>Voltar</Button></DialogClose>
                      <DialogClose asChild><Button type='submit'>Salvar</Button></DialogClose>
                    </div>
                  </DialogHeader>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button variant='outline' size="icon" onClick={() => refetch()} disabled={isFetching} title="Atualizar">
            <RotateCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>

          <select
            value={publisherType ?? ''}
            onChange={e => setPublisherType(e.target.value === '' ? undefined : e.target.value as 'journal' | 'conference')}
            className="border rounded px-2 py-1 text-sm h-10 bg-background"
          >
            <option value="">Todos</option>
            <option value="journal">Periódicos</option>
            <option value="conference">Conferências</option>
          </select>

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
        <InternalProductionChartWithScroll chartData={chartData} />
      </CardContent>
    </Card>
  );
}

// Componente interno para o gráfico com rolagem, expansão e a linha de média
function InternalProductionChartWithScroll({ chartData }: { chartData: { year: string, amount: number }[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [, setChartHeight] = useState<number>(0);

  useEffect(() => {
    if (chartRef.current) {
      setChartHeight(chartRef.current.clientHeight);
    }
  }, []);

  const { expanded, toggleExpand, isScrollable, chartWidth, isMobile } = useExpandableChart(
    chartData.length,
    MAX_VISIBLE_BARS,
  );

  const marginBottom = isScrollable ? 'mb-24' : 'mb-16';

  // Tamanhos de fonte responsivos
  const fontSize = isMobile ? 11 : 18;
  const labelFontSize = isMobile ? 12 : 18;

  return (
    <>
      {chartData.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}

      <ChartScrollWrapper
        minWidth={chartWidth}
        isScrollable={isScrollable}
        className={marginBottom}
      >
        <div ref={chartRef}>
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
            <ResponsiveContainer width="100%" height={400}>
              <BarChart margin={{ top: 20, right: 5, left: 5, bottom: 80 }} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  interval={0}
                  tickFormatter={(name) =>
                    String(name).length > 15 ? String(name).slice(0, 15) + '...' : String(name)
                  }
                  style={{ fontSize }}
                />
                <YAxis style={{ fontSize }} />
                <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
                <Bar dataKey="amount" fill="#8884d8" label={{ position: 'top', style: { fontSize: labelFontSize } }}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorFromName((parseInt(entry.year, 10) + 1).toString())} />
                  ))}
                </Bar>
                
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </ChartScrollWrapper>
    </>
  );
}