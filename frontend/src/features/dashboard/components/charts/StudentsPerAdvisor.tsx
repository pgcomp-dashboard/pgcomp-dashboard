import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import { colorFromName } from '@/utils/color';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import './chart.css';

// 👇 Adições para scroll e expansão
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ExpandChartButton from '@/components/ui/ExpandChartButton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExpandableChart } from '@/features/dashboard/hooks/useExpandableChart';
import useAuth from '@/hooks/auth';

import { dashboardService } from '@/services/modules/dashboard.service';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChartScrollWrapper from './ChartScrollWrapper';

const MAX_VISIBLE_BARS = 8;

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border rounded">
        <b>{label}</b>
        <br />
        {payload.map((ele, index) => (
          <div key={index}>
            <span className="tooltip-text">
              Alunos de {label.split(' ')[0]} : {ele.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

type StudentsPerAdvisorFilter = 'mestrando' | 'doutorando' | 'completed' | undefined;

export default function StudentsPerAdvisorChart() {
  const auth = useAuth();
  const [ filter, setFilter ] = useState<StudentsPerAdvisorFilter>(undefined);
  const [ visibleProfessors, setVisibleProfessors ] = useState(new Map<number, boolean>());

  const { data: queryData, error: queryError, isLoading: queryIsLoading, isFetching, refetch } = useQuery({
    queryKey: [ 'totalStudentsPerAdvisor', filter ],
    queryFn: async () => {
      return dashboardService.totalStudentsPerAdvisor(filter);
    },
    enabled: !!auth?.isAdmin,
  });

  const { data: professors, error: professorsError } = useQuery({
    queryKey: ['professors', 'dashboard'],
    queryFn: () => dashboardService.professors(),
    enabled: !!auth?.isAdmin,
  });

  const chartData = Object.entries(queryData ?? {})
    .map(([, advisor_info ]) => ({
      id: advisor_info.id,
      name: advisor_info.name,
      quantity: advisor_info.advisedes_count,
    }))
    .filter((entry) => entry.quantity > 0)
    .filter(e => isProfessorVisible(e.id));

  // Hook SEMPRE é chamado
  const { expanded, toggleExpand, isScrollable, chartWidth, isMobile } =
    useExpandableChart(chartData.length, MAX_VISIBLE_BARS);

  // Tamanhos de fonte responsivos
  const xAxisFontSize = isMobile ? 10 : 14;
  const yAxisFontSize = isMobile ? 12 : 18;
  const labelFontSize = isMobile ? 12 : 18;

  useEffect(() => {
    if (professors) {
      const map = new Map(professors.map(p => [ p.id, true ]));
      setVisibleProfessors(map);
    }
  }, [ professors ]);

  if (professorsError) {
    return <>Falha ao carregar professores!</>;
  }

  if (!professors) {
    return <>Carregando professores...</>;
  }

  if (queryError) {
    return <>Falha ao carregar gráfico!</>;
  }

  if (queryIsLoading) {
    return <>Carregando...</>;
  }

  function isProfessorVisible(id: number) {
    return !!visibleProfessors.get(id);
  }

  function toggleProfessorVisibility(id: number) {
    const clone = new Map(visibleProfessors);
    clone.set(id, !isProfessorVisible(id));
    setVisibleProfessors(clone);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <CardTitle>Quantidade de Alunos por Orientador</CardTitle>
          
          <div className="flex flex-wrap items-center gap-2">
            {chartData.length > MAX_VISIBLE_BARS && (
              <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
            )}
            
            <Tabs defaultValue="all" onValueChange={e => {
              if (e == 'all') {
                setFilter(undefined);
              } else {
                setFilter(e as StudentsPerAdvisorFilter);
              }
            }}>
              <TabsList>
                <TabsTrigger value="all">Atuais</TabsTrigger>
                <TabsTrigger value="mestrando">Mestrando</TabsTrigger>
                <TabsTrigger value="doutorando">Doutorando</TabsTrigger>
                <TabsTrigger value="completed">Concluídos</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button 
              variant='outline' 
              size="icon" 
              onClick={() => refetch()} 
              disabled={isFetching} 
              title="Atualizar"
            >
              <RotateCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline'><User /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selecionar Professores</DialogTitle>
                  <DialogDescription>Escolha os professores que deseja exibir no gráfico</DialogDescription>
                </DialogHeader>
                <div className="border-t-1 w-full"></div>
                <div className="max-h-120 overflow-y-scroll flex flex-col space-y-5">
                  {
                    professors.map(p => (
                      <div className="flex items-center gap-3" key={p.id}>
                        <Checkbox onCheckedChange={() => toggleProfessorVisibility(p.id)} checked={isProfessorVisible(p.id)} />
                        <span>{p.name}</span>
                      </div>
                    ))
                  }
                </div>
                <div className="flex justify-end w-full">
                  <DialogClose asChild>
                    <Button>
                      Voltar
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* 👇 Scroll horizontal com largura mínima dinâmica */}
          <ChartScrollWrapper
            minWidth={chartWidth}
            isScrollable={isScrollable}
            className={isScrollable ? 'mb-20' : 'mb-6'}
          >
            <div className="flex items-center justify-center">
              <ChartContainer
                config={{
                  journals: {
                    label: 'Periódicos',
                    color: 'hsl(var(--chart-2))',
                  },
                  conferences: {
                    label: 'Conferências',
                    color: 'hsl(var(--chart-3))',
                  },
                }}
                className="w-full h-[400px]"
              >
                <BarChart
                  margin={{ top: 20, right: 5, left: 5, bottom: 80 }}
                  data={chartData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    tickFormatter={(name) =>
                      name.length > 15 ? name.slice(0, 15) + '...' : name
                    }
                    style={{ fontSize: xAxisFontSize }}
                  />
                  <YAxis style={{ fontSize: yAxisFontSize }} />
                  <Tooltip
                    content={
                      <CustomTooltip active={false} payload={[]} label={''} />
                    }
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#8884d8"
                    label={{ position: 'top', style: { fontSize: labelFontSize } }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colorFromName(entry.name)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </ChartScrollWrapper>
        </CardContent>
      </Card>
    </>
  );
}