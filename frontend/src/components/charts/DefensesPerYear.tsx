import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  TooltipProps,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
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
  const { data, isLoading, error } = useQuery({
    queryKey: [ 'defenses_per_year' ],
    queryFn: async () => {
      const res = await api.defensesPerYear();
      return Array.isArray(res) ? res : [ res ];
    },
  });

  const { expanded, toggleExpand, isScrollable, chartWidth } = useExpandableChart((data ?? []).length, MAX_VISIBLE_BARS);

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  return (
    <>
      {data && data.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}

      <div className={`block w-full overflow-x-auto pb-4 ${isScrollable ? 'mb-20' : 'mb-6'}`} style={{ minHeight: '400px' }}>
        <div style={{ minWidth: chartWidth }}>
          <ChartContainer
            config={{
              year: { label: 'Ano', color: 'hsl(var(--chart-2))' },
              mestrado: { label: 'Mestrado', color: '#8884d8' },
              doutorado: { label: 'Doutorado', color: '#82ca9d' },
            }}
            className="w-full h-[400px]"
          >
            <BarChart margin={{ top: 20, right: 5, left: 5, bottom: 80 }} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" interval={0} angle={-45} textAnchor="end" style={{ fontSize: 18 }} />
              <YAxis style={{ fontSize: 18 }} />
              <Tooltip content={<CustomTooltip />} />
              {(filter === 'todos' || filter === 'mestrado') && (
                <Bar dataKey="mestrado" stackId="a" fill="#8884d8" label={{ position: 'top', style: { fontSize: 18 } }}/>
              )}
              {(filter === 'todos' || filter === 'doutorado') && (
                <Bar dataKey="doutorado" stackId="a" fill="#82ca9d" label={{ position: 'top', style: { fontSize: 18 } }}/>
              )}
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </>
  );
}