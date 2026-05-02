import useAuth from '@/hooks/auth';
import { projectService } from '@/services/modules/project.service';
import { professorService } from '@/services/modules/professor.service';
import { Project } from '@/types/academic';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useTransition } from 'react';

export function useProjectData() {
  const auth = useAuth();
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>('own');
  const [isPending, startTransition] = useTransition();

  const { data: professorsData } = useQuery({
    queryKey: ['professors', 'full'],
    queryFn: () => professorService.fetchProfessors({ paginate: 'false' }),
    enabled: !!auth && auth.isAdmin === true,
  });
  const professorsList = useMemo(() => professorsData?.data || [], [professorsData]);

  const { data: rawData, isLoading } = useQuery<Project[], Error>({
    queryKey: ['projects', selectedProfessorId, auth?.isAdmin],
    queryFn: () => {
      if (auth?.isAdmin && selectedProfessorId !== 'own') {
        return projectService.getUserProjects(Number(selectedProfessorId));
      }
      return projectService.getMyProjects();
    },
    enabled: !!auth?.isAuthenticated && (auth?.isAdmin ? selectedProfessorId !== 'own' : true),
  });

  const projects = useMemo(() => {
    if (!rawData) return [];
    return Object.entries(rawData)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => value as unknown as Project)
      .sort((a, b) => b.start_year - a.start_year);
  }, [rawData]);

  const handleProfessorChange = (value: string) => {
    startTransition(() => {
      setSelectedProfessorId(value);
    });
  };

  return {
    auth,
    isLoading,
    isPending,
    projects,
    professorsList,
    selectedProfessorId,
    handleProfessorChange,
  };
}