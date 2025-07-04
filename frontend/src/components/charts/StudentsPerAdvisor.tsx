import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Tooltip,
  Bar,
  Cell,
  TooltipProps,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import '@/services/api';
import { colorFromName } from '@/utils/color';
import './chart.css';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

// 👇 Adições para scroll e expansão
import { useExpandableChart } from '@/hooks/useExpandableChart';
import ExpandChartButton from '@/components/ui/ExpandChartButton';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
  const [filter, setFilter] = useState<StudentsPerAdvisorFilter>(undefined);
  const [visibleProfessors, setVisibleProfessors] = useState(new Map<number, boolean>());

  const query = useQuery({
    queryKey: ['totalStudentsPerAdvisor', filter],
    queryFn: async () => {
      return api.totalStudentsPerAdvisor(filter);
    },
  });

  const { data: professors, error: professorsError } = useQuery({
    queryKey: ['professors'],
    queryFn: () => api.professors(),
  });

  const chartData = Object.entries(query.data ?? {})
    .map(([_, advisor_info]) => ({
      id: advisor_info.id,
      name: advisor_info.name,
      quantity: advisor_info.advisedes_count,
    }))
    .filter((entry) => entry.quantity > 0)
    .filter(e => isProfessorVisible(e.id));

  // Hook SEMPRE é chamado
  const { expanded, toggleExpand, isScrollable, chartWidth } =
    useExpandableChart(chartData.length, MAX_VISIBLE_BARS);

  useEffect(() => {
    if (professors) {
      const map = new Map(professors.map(p => [p.id, true]));
      setVisibleProfessors(map);
    }
  }, [professors]);

  if (professorsError) {
    return <>Falha ao carregar professores!</>;
  }

  if (!professors) {
    return <>Carregando professores...</>;
  }

  if (query.error) {
    return <>Falha ao carregar gráfico!</>;
  }

  if (query.isLoading) {
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quantidade de Alunos por Orientador</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="flex w-full space-x-4 items-center justify-end">
            {chartData.length > MAX_VISIBLE_BARS && (
              <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
            )}
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
                      <div className="flex items-center gap-3">
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

          {/* 👇 Scroll horizontal com largura mínima dinâmica */}
          <div
            className={`block w-full overflow-x-auto pb-4 ${isScrollable ? 'mb-20' : 'mb-6'}`}
            style={{ minHeight: '400px' }}
          >
            <div style={{ minWidth: chartWidth }}>
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
                      style={{ fontSize: 14 }} // Aumentando o tamanho da fonte do eixo X
                    />
                    <YAxis style={{ fontSize: 18 }} /> {/* também fonte maior */}
                    <Tooltip
                      content={
                        <CustomTooltip active={false} payload={[]} label={''} />
                      }
                    />
                    <Bar
                      dataKey="quantity"
                      fill="#8884d8"
                      label={{ position: 'top', style: { fontSize: 18 } }}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
