import { projectService } from '@/services/modules/project.service';
import { useQuery } from '@tanstack/react-query';

export function useMyProjects() {
  const {
    data: projects = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [ 'myProjects' ],
    queryFn: () => projectService.getMyProjects(),
  });

  return { projects, isLoading, isFetching, refetch };
}