import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { CartesianGrid, XAxis, YAxis, BarChart, Tooltip, Bar, Cell, TooltipProps } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import '@/services/api';
import { colorFromName } from '@/utils/color';
import './chart.css';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// 👇 Adições para scroll e expansão
import { useExpandableChart } from '@/hooks/useExpandableChart';
import ExpandChartButton from '@/components/ui/ExpandChartButton';

const MAX_VISIBLE_BARS = 8;

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>)  => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-2 rounded">
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

export default function StudentsPerAdvisorChart({ filter }: { filter?: 'mestrando' | 'doutorando' | 'completed' }) {

  const query = useQuery({
    queryKey: ['totalStudentsPerAdvisor', filter],
    queryFn: async () => {
      return api.totalStudentsPerAdvisor(filter);
    },
  });

  const chartData = Object.entries(query.data ?? {}).map(([_, advisor_info]) => ({
    id: advisor_info.id,
    name: advisor_info.name,
    quantity: advisor_info.advisedes_count,
  })).filter((entry) => entry.quantity > 0);
  
  // Hook SEMPRE é chamado
  const { expanded, toggleExpand, isScrollable, chartWidth } = useExpandableChart(chartData.length, MAX_VISIBLE_BARS);
  
  if (query.error) {
    return <>Falha ao carregar gráfico!</>;
  }
  
  if (query.isLoading) {
    return <>Carregando...</>;
  }
  
  return (
    <>
      {/* 👇 Botão de expansão, se necessário */}
      {chartData.length > MAX_VISIBLE_BARS && (
        <ExpandChartButton expanded={expanded} toggleExpand={toggleExpand} />
      )}
  
      {/* 👇 Scroll horizontal com largura mínima dinâmica */}
      <div className={`block w-full overflow-x-auto pb-4 ${isScrollable ? 'mb-20' : 'mb-6'}`} style={{ minHeight: '400px' }}>
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
              <BarChart margin={{ top: 20, right: 5, left: 5, bottom: 80 }} data={chartData}>
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
                <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} />
                <Bar dataKey="quantity" fill="#8884d8" label={{ position: 'top', style: { fontSize: 18 } }}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorFromName(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </>
  );  
}

 