import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { CartesianGrid, XAxis, YAxis, Legend, BarChart, Tooltip, Bar  } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import '@/services/api';

export default function StudentsPerAdvisorChart({ filter }: {  filter?: 'journal' | 'conference'}) {

  const query = useQuery({
    queryKey: ['totalStudentsPerAdvisor', filter],
    queryFn: async () => {
      return api.totalStudentsPerAdvisor(filter);
    },
  });

  if (query.error) {
    return (<>Falha ao carregar gráfico!</>);
  }

  if (query.isLoading) {
    return <>Carregando...</>; //TODO: spinner...
  }

  console.log(query);

  const chartData = Object.entries(query.data ?? {}).map(([ name, advisedes_count ]) => ({
    name,
    advisedes_count,
  }));

  
  return (
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
        className="h-[400px]"
      >
        <BarChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }} data={chartData}>
          <CartesianGrid strokeDasharray="3" />
          <XAxis dataKey="advisedes_count" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="name" fill="#8884d8" />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
