import { ChartContainer } from '@/components/ui/chart.tsx';
import ExpandChartButton from '@/components/ui/ExpandChartButton';
import { useExpandableChart } from '@/features/dashboard/hooks/useExpandableChart';
import { dashboardService } from '@/services/modules/dashboard.service';
import { colorFromName } from '@/utils/color.ts';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import './chart.css';
import ChartScrollWrapper from './ChartScrollWrapper';

const MAX_VISIBLE_BARS = 15;

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-2 rounded">
        <b>{label}</b>
        <br />
        {payload.map((ele, index) => (
          <div key={index}>
            <span className="tooltip-text">Quantidade de Alunos : {ele.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function StudentsPerFieldChart({ filter }: { filter?: 'mestrando' | 'doutorando' | 'completed' }) {
  const query = useQuery({
    queryKey: [ 'studentsPerField', filter ],
    queryFn: async () => dashboardService.studentsPerField(filter),
  });

  const chartData = Object.entries(query.data ?? {}).map(([ name, value ]) => ({ name, value }));

  // 👇 Hook sempre será chamado, mesmo com chartData vazio
  const { expanded, toggleExpand, isScrollable, chartWidth, isMobile } = useExpandableChart(chartData.length, MAX_VISIBLE_BARS);

  // Tamanhos de fonte responsivos
  const fontSize = isMobile ? 11 : 18;
  const labelFontSize = isMobile ? 12 : 18;


  if (query.isLoading) {
    return <>Carregando...</>;
  }

  if (query.error) {
    return <>Falha ao carregar gráfico!</>;
  }

  return (
    <>
      {/* 👇 Botão de expansão, se necessário */}
      {chartData.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}

      {/* 👇 Scroll horizontal com largura dinâmica */}
      <ChartScrollWrapper
        minWidth={chartWidth}
        isScrollable={isScrollable}
        className={isScrollable ? 'mb-20' : 'mb-6'}
      >
        <div className="flex items-center justify-center">
          <ChartContainer
            config={{
              students: {
                label: 'Students',
                color: 'hsl(var(--chart-1))',
              },
            }}
            className="w-full h-[400px]"
          >
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize }}
              />
              <YAxis
                type="number"
                tick={{ fontSize }}
              />
              <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
              <Bar
                dataKey="value"
                fill="#8884d8"
                label={{ position: 'top', style: { fontSize: labelFontSize } }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorFromName(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </ChartScrollWrapper>
    </>
  );

}
