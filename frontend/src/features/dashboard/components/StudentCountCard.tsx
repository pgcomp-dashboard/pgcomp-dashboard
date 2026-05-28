import useAuth from '@/hooks/auth';
import { dashboardService } from '@/services/modules/dashboard.service';
import { useQuery } from '@tanstack/react-query';

export default function StudentCountCard({
  studentFilter,
}: {
  studentFilter: string;
}) {
  const auth = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: [ 'number_of_students' ],
    queryFn: () => dashboardService.numberOfStudents(),
    enabled: !!auth?.isAdmin,
  });

  if (isLoading) return <>Carregando...</>;
  if (error) return <>Erro ao carregar o gráfico</>;

  console.log(data);
  const filteredData = data?.filter((d) => d.category == studentFilter);

  return (
    <div className="w-full h-full text-4xl sm:text-5xl font-semibold text-gray-800 dark:text-gray-100 flex-1 flex items-center justify-center mt-1">
      {filteredData?.length ? filteredData[0].amount : 0}
    </div>
  );
}
