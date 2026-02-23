import { ChartContainer } from '@/components/ui/chart';
import ExpandChartButton from '@/components/ui/ExpandChartButton';
import { useExpandableChart } from '@/features/dashboard/hooks/useExpandableChart';
import useAuth from '@/hooks/auth';
import { dashboardService } from '@/services/modules/dashboard.service';
import { colorFromName } from '@/utils/color';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  Bar,
  BarChart, CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts';
import ChartScrollWrapper from './ChartScrollWrapper';

const MAX_VISIBLE_BARS = 15;

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
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

export default function AllProductionsPerYear() {
  const auth = useAuth();
  const [ publisherType, setPublisherType ] = useState<'journal' | 'conference' | undefined>(undefined);

  const { data: productions, error, isLoading } = useQuery({
    queryKey: [ 'totalProductionsPerYear', publisherType ],
    queryFn: () => dashboardService.totalProductionsPerYear(publisherType),
    enabled: !!auth?.isAdmin,
  });

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  const chartData = Object.entries(productions ?? {}).map(([ year, amount ]) => ({
    year,
    amount: amount as number, // Garante que amount é um número
  }));

  return (
    <div>
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="publisherType">Tipo de produção:</label>
        <select
          id="publisherType"
          value={publisherType ?? ''}
          onChange={e => setPublisherType(e.target.value === '' ? undefined : (e.target.value as 'journal' | 'conference'))}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos</option>
          <option value="journal">Periódico</option>
          <option value="conference">Conferência</option>
        </select>
      </div>
      <InternalProductionChartWithScroll chartData={chartData} />
    </div>
  );
}

function InternalProductionChartWithScroll({ chartData }: { chartData: { year: string, amount: number }[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [ , setChartHeight ] = useState<number>(0);

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

  const totalProductions = chartData.reduce((sum, entry) => sum + entry.amount, 0);
  const mediaProducoes = chartData.length ? totalProductions / chartData.length : 0;

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
              year: { label: 'Ano', color: 'hsl(var(--chart-2))' },
              amount: { label: 'Número', color: 'hsl(var(--chart-3))' },
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
                <Bar
                  dataKey="amount"
                  fill="#8884d8"
                  label={{ position: 'top', style: { fontSize: labelFontSize } }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colorFromName((parseInt(entry.year, 10) + 1).toString())}
                    />
                  ))}
                </Bar>
                <ReferenceLine
                  y={mediaProducoes}
                  stroke="#212121"
                  strokeDasharray="3 3"
                  label={{
                    value: `Média: ${mediaProducoes.toFixed(1)}`,
                    position: 'top',
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: 'bold',
                    fill: '#212121',
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </ChartScrollWrapper>
    </>
  );
}
