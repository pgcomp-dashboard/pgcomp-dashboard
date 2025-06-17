import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  TooltipProps,
  Legend,
  LabelList,
  ReferenceLine,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import './chart.css';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useExpandableChart } from '@/hooks/useExpandableChart';
import ExpandChartButton from '../ui/ExpandChartButton';

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
              Matrículas de {ele.name} em {label} : {ele.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EnrollmentsPerYearChart({ filter }: { filter?: 'mestrado' | 'doutorado' | 'todos' }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [ 'enrollments_per_year' ],
    queryFn: async () => {
      const res = await api.enrollmentsPerYear();
      return Array.isArray(res) ? res : [ res ];
    },
  });

  const { expanded, toggleExpand, isScrollable, chartWidth } = useExpandableChart((data ?? []).length, MAX_VISIBLE_BARS);

  const totalDefesas = (data ?? []).reduce((sum, item) => {
    if (filter === 'mestrado') return sum + item.mestrado;
    if (filter === 'doutorado') return sum + item.doutorado;
    return sum + item.mestrado + item.doutorado;
  }, 0);
  
  const mediaPorAno = data?.length ? totalDefesas / data.length : 0;

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
              mestrado: { label: 'Mestrado', color: '#4ab773' },
              doutorado: { label: 'Doutorado', color: '#8884d8' },
            }}
            className="w-full h-[400px]"
          >
            <BarChart margin={{ top: 20, right: 5, left: 5, bottom: 20 }} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" interval={0} style={{ fontSize: 18 }} />
              <YAxis style={{ fontSize: 18 }} />
              <Tooltip content={<CustomTooltip />} />
              {(filter === 'todos' || filter === 'mestrado') && (
                <Bar dataKey="mestrado" stackId="a" fill="#82ca9d">
                  {/* Remove o 'label' do Bar e adiciona LabelList */}
                  <LabelList
                    dataKey="mestrado"
                    position="center"
                    fill="#fff" // Cor do texto para contraste com a barra
                    fontSize={18}
                    fontWeight="bold"
                  />
                </Bar>
              )}
              {(filter === 'todos' || filter === 'doutorado') && (
                <Bar dataKey="doutorado" stackId="a" fill="#8884d8">
                  {/* Remove o 'label' do Bar e adiciona LabelList */}
                  <LabelList
                    dataKey="doutorado"
                    position="center"
                    fill="#fff" // Cor do texto para contraste com a barra
                    fontSize={18}
                    fontWeight="bold"
                  />
                </Bar>
              )}
              <Legend verticalAlign="top" height={48} formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} wrapperStyle={{ fontSize: '18px' }} />
              <ReferenceLine
                y={mediaPorAno}
                stroke="red"
                strokeDasharray="3 3"
                label={{
                  value: `Média: ${mediaPorAno.toFixed(2)}`,
                  position: 'top',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fill: 'red',
                }}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </>
  );
}


