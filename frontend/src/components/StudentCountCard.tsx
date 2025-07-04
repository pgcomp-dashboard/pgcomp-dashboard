import api from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export default function StudentCountCard({
  studentFilter,
}: {
  studentFilter: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['number_of_students'],
    queryFn: () => api.numberOfStudents(),
  });

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  console.log(data);
  const filteredData = data?.filter((d) => d.category == studentFilter);

  return (
    <div className="w-full h-full text-7xl flex-1 flex items-center justify-center">
      {filteredData?.length ? filteredData[0].amount : 0}
    </div>
  );
}


