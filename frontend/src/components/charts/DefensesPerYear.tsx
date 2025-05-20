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
import { ChartContainer } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { colorFromName } from '@/utils/color';
import './chart.css';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Adicionados para expansão com scroll
import { useExpandableChart } from '@/hooks/useExpandableChart';
import ExpandChartButton from '@/components/ui/ExpandChartButton';

const MAX_VISIBLE_BARS = 10;

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-2 rounded">
        <b>{label}</b>
        <br />
        {payload.map((ele, index) => (
          <div key={index}>
            <span className="tooltip-text">Defesas em {label} : {ele.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DefensesPerYearChart({ filter }: { filter?: 'mestrado' | 'doutorado' }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['defenses_per_year', filter],
    queryFn: () => api.defensesPerYear(filter),
  });

  const chartData = Object.entries(data ?? {}).map(([year, amount]) => ({
    year,
    amount,
  }));

  // Hook sempre executa, mesmo que chartData esteja vazio inicialmente
  const { expanded, toggleExpand, isScrollable, chartWidth } = useExpandableChart(chartData.length, MAX_VISIBLE_BARS);

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  return (
    <>
      {chartData.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}
  
      <div className={`block w-full overflow-x-auto pb-4 ${isScrollable ? 'mb-20' : 'mb-6'}`} style={{ minHeight: '400px' }}>
        <div style={{ minWidth: chartWidth }}>
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
                angle={-45}
                textAnchor="end"
                tickFormatter={(name) =>
                  name.length > 15 ? name.slice(0, 15) + '...' : name
                }
                style={{ fontSize: 18 }} // fonte maior
              />
              <YAxis style={{ fontSize: 18 }} /> {/* também fonte maior */}
              <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
              <Bar dataKey="amount" fill="#8884d8" label={{ position: 'top', style: { fontSize: 18 } }}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorFromName(entry.year)} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </>
  );
}  