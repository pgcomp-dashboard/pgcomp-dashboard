import { Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, TooltipProps, ReferenceLine } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ChartContainer } from '@/components/ui/chart.tsx';
import { colorFromName } from '@/utils/color.ts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import './chart.css';
import { useExpandableChart } from '@/hooks/useExpandableChart';
import ExpandChartButton from '@/components/ui/ExpandChartButton';

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
    queryFn: async () => api.studentsPerField(filter),
  });

  const chartData = Object.entries(query.data ?? {}).map(([ name, value ]) => ({ name, value }));
  //const chartData = Array.from({ length: 30 }, (_, i) => ({
  //  name: `Campo ${i + 1}`,
  //  value: Math.floor(Math.random() * 100),
  //}));

  // 👇 Hook sempre será chamado, mesmo com chartData vazio
  const { expanded, toggleExpand, isScrollable, chartWidth } = useExpandableChart(chartData.length, MAX_VISIBLE_BARS);

  const totalEstudantes = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const mediaPorArea = chartData.length ? totalEstudantes / chartData.length : 0;


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
      <div className={`block w-full overflow-x-auto pb-4 ${isScrollable ? 'mb-20' : 'mb-6'}`} style={{ minHeight: '400px' }}>
        <div style={{ minWidth: chartWidth }}>
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
                  tick={{ fontSize: 18 }} // maior
                />
                <YAxis
                  type="number"
                  tick={{ fontSize: 18 }} // maior
                />
                <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  label={{ position: 'top', style: { fontSize: 18 } }} // label maior
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorFromName(entry.name)} />
                  ))}
                </Bar>
                <ReferenceLine
                  y={mediaPorArea}
                  stroke="#212121"
                  strokeDasharray="3 3"
                  label={{
                    value: `Média: ${mediaPorArea.toFixed(1)}`,
                    position: 'top',
                    fontSize: 16,
                    fontWeight: 'bold',
                    fill: '#212121',
                  }}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </>
  );
  
} 