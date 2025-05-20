import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import '@/services/api';

// Adições para scroll horizontal
import { useExpandableChart } from '@/hooks/useExpandableChart';
import ExpandChartButton from '@/components/ui/ExpandChartButton';

const MAX_VISIBLE_BARS = 10;

// Sample data for publications over years
// const data = [
//   { year: '2014', journals: 45, conferences: 30 },
//   { year: '2015', journals: 50, conferences: 35 },
//   { year: '2016', journals: 55, conferences: 40 },
//   { year: '2017', journals: 60, conferences: 45 },
//   { year: '2018', journals: 65, conferences: 50 },
//   { year: '2019', journals: 70, conferences: 55 },
//   { year: '2020', journals: 75, conferences: 60 },
//   { year: '2021', journals: 80, conferences: 65 },
//   { year: '2022', journals: 85, conferences: 70 },
//   { year: '2023', journals: 90, conferences: 75 },
//   { year: '2024', journals: 95, conferences: 80 },
//   { year: '2025', journals: 100, conferences: 85 },
// ];

export default function PublicationsChart({ filter }: { filter?: 'journal' | 'conference' }) {
  const query = useQuery({
    queryKey: ['totalProductionsPerYear', filter],
    queryFn: async () => {
      return api.totalProductionsPerYear(filter);
    },
  });

  const chartData = Object.entries(query.data ?? {}).map(([year, data]) => ({
    year,
    data,
  }));

  // 👇 Hook de scroll
  const { expanded, toggleExpand, isScrollable, chartWidth } = useExpandableChart(chartData.length, MAX_VISIBLE_BARS);
  const marginBottom = isScrollable ? 'mb-24' : 'mb-16';

  if (query.error) {
    return <>Falha ao carregar gráfico!</>;
  }

  if (query.isLoading) {
    return <>Carregando...</>; //TODO: spinner...
  }

  return (
    <>
      {/* Botão de expansão */}
      {chartData.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}

      {/* Scroll horizontal com altura garantida e espaçamento adequado */}
      <div
        className={`block w-full overflow-x-auto pb-4 ${marginBottom}`}
        style={{ minHeight: '400px' }}
      >
        <div style={{ minWidth: chartWidth }}>
          <div className="flex items-center justify-center h-[400px]">
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
              className="w-full h-full"
            >
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="journals"
                  stroke="#5B9279"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="conferences"
                  stroke="#8FCB9B"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </>
  );
}
