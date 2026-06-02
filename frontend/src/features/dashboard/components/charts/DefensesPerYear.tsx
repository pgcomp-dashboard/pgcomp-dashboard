import { ChartContainer } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ReferenceLine,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import './chart.css';

// Adicionados para expansão com scroll
import ExpandChartButton from '@/components/ui/ExpandChartButton';
import { useExpandableChart } from '@/features/dashboard/hooks/useExpandableChart';
import useAuth from '@/hooks/auth';
import { dashboardService } from '@/services/modules/dashboard.service';
import ChartScrollWrapper from './ChartScrollWrapper';

const MAX_VISIBLE_BARS = 10;

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-2 rounded">
        <b>{label}</b>
        <br />
        {payload.map((ele, index) => (
          <div key={index}>
            <span className="tooltip-text">
              Defesas de {ele.name} em {label} : {ele.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DefensesPerYearChart({ filter }: { filter?: 'mestrado' | 'doutorado' | 'todos' }) {
  const auth = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['defenses_per_year'],
    queryFn: async () => {
      const response = await dashboardService.defensesPerYear();
      return Array.isArray(response) ? response : [response];
    },
    enabled: !!auth?.isAdmin,
  });

  const { expanded, toggleExpand, isScrollable, chartWidth, isMobile } = useExpandableChart((data ?? []).length, MAX_VISIBLE_BARS);

  const totalDefesas = (data ?? []).reduce((sum, item) => {
    if (filter === 'mestrado') return sum + item.mestrado;
    if (filter === 'doutorado') return sum + item.doutorado;
    return sum + item.mestrado + item.doutorado;
  }, 0);

  const mediaPorAno = data?.length ? totalDefesas / data.length : 0;

  // Tamanhos de fonte responsivos
  const fontSize = isMobile ? 11 : 18;
  const labelFontSize = isMobile ? 12 : 18;
  const legendFontSize = isMobile ? 13 : 18;

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  return (
    <>
      {data && data.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}
      <ChartScrollWrapper
        minWidth={chartWidth}
        isScrollable={isScrollable}
        className={isScrollable ? 'mb-20' : 'mb-6'}
      >
        <ChartContainer
          config={{
            year: { label: 'Ano', color: 'hsl(var(--chart-2))' },
            mestrado: { label: 'Mestrado', color: '#4ab773' },
            doutorado: { label: 'Doutorado', color: '#8884d8' },
          }}
          className="w-full h-[400px]"
        >
          <BarChart margin={{ top: 20, right: 5, left: 5, bottom: 20 }} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" interval={0} style={{ fontSize }} />
            <YAxis style={{ fontSize }} />
            <Tooltip content={<CustomTooltip />} />
            {(filter === 'todos' || filter === 'mestrado') && (
              <Bar dataKey="mestrado" stackId="a" fill="#82ca9d">
                <LabelList
                  dataKey="mestrado"
                  position="center"
                  fill="#fff"
                  fontSize={labelFontSize}
                  fontWeight="bold"
                />
              </Bar>
            )}
            {(filter === 'todos' || filter === 'doutorado') && (
              <Bar dataKey="doutorado" stackId="a" fill="#8884d8">
                <LabelList
                  dataKey="doutorado"
                  position="center"
                  fill="#fff"
                  fontSize={labelFontSize}
                  fontWeight="bold"
                />
              </Bar>
            )}
            <Legend
              verticalAlign="top"
              height={48}
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              wrapperStyle={{ fontSize: `${legendFontSize}px` }}
            />
            <ReferenceLine
              y={mediaPorAno}
              stroke="red"
              strokeDasharray="3 3"
              label={{
                value: `Média: ${mediaPorAno.toFixed(2)}`,
                position: 'top',
                fontSize: isMobile ? 14 : 16,
                fontWeight: 'bold',
                fill: 'red',
              }}
            />
          </BarChart>
        </ChartContainer>
      </ChartScrollWrapper>
    </>
  );
}
