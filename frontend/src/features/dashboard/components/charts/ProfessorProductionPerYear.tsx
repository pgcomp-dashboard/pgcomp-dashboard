import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
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
import { ChartContainer } from '@/components/ui/chart';
import ExpandChartButton from '@/components/ui/ExpandChartButton';
import { useExpandableChart } from '@/features/dashboard/hooks/useExpandableChart';
import useAuth from '@/hooks/auth';
import { dashboardService } from '@/services/modules/dashboard.service';
import { colorFromName } from '@/utils/color';
import ChartScrollWrapper from './ChartScrollWrapper';
import './chart.css';

const MAX_VISIBLE_BARS = 15;

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

// Adicionada a interface de props
interface AllProductionsPerYearProps {
  publisherType?: 'journal' | 'conference';
}

// Componente principal agora aceita as props
export default function ProductionsPerYearChart({ publisherType }: AllProductionsPerYearProps) {
  const auth = useAuth();

  const { data: productions, error, isLoading } = useQuery({
    // Atualizado para incluir publisherType na key e na chamada
    queryKey: [ 'totalProductionsPerYear', publisherType ],
    queryFn: () => dashboardService.totalProductionsPerYear(publisherType),
    enabled: !!auth?.isAdmin,
  });

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  const chartData = Object.entries(productions ?? {}).map(([ year, amount ]) => ({
    year,
    amount: amount as number,
  }));

  return <InternalProductionChartWithScroll chartData={chartData} />;
}

// Componente interno para lidar com a rolagem e o gráfico
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
                    name.length > 15 ? name.slice(0, 15) + '...' : name
                  }
                  style={{ fontSize }}
                />
                <YAxis style={{ fontSize }} />
                <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
                <Bar dataKey="amount" fill="#8884d8" label={{ position: 'top', style: { fontSize: labelFontSize } }}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorFromName(entry.year)} />
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