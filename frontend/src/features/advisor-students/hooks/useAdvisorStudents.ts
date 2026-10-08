import useAuth from '@/hooks/auth';
import { dashboardService } from '@/services/modules/dashboard.service';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

export type AdvisorStudentsStatusFilter =
  | 'mestrando'
  | 'doutorando'
  | 'completed'
  | undefined;

function parseStatus(value: string | null): AdvisorStudentsStatusFilter {
  return value === 'mestrando' || value === 'doutorando' || value === 'completed'
    ? value
    : undefined;
}

export function useAdvisorStudents() {
  const auth = useAuth();
  const [ searchParams, setSearchParams ] = useSearchParams();

  const [ professorId, setProfessorIdState ] = useState<number | null>(() => {
    const raw = searchParams.get('professor');
    return raw ? Number(raw) : null;
  });
  const [ status, setStatusState ] = useState<AdvisorStudentsStatusFilter>(() =>
    parseStatus(searchParams.get('status')),
  );

  useEffect(() => {
    const raw = searchParams.get('professor');
    setProfessorIdState(raw ? Number(raw) : null);
    setStatusState(parseStatus(searchParams.get('status')));
  }, [ searchParams ]);

  const setProfessorId = (id: number | null) => {
    setProfessorIdState(id);
    const next = new URLSearchParams(searchParams);
    if (id) {
      next.set('professor', String(id));
    } else {
      next.delete('professor');
    }
    setSearchParams(next);
  };

  const setStatus = (value: AdvisorStudentsStatusFilter) => {
    setStatusState(value);
    const next = new URLSearchParams(searchParams);
    next.set('status', value ?? 'all');
    setSearchParams(next);
  };

  const {
    data: professors,
    error: professorsError,
  } = useQuery({
    queryKey: [ 'professors', 'dashboard' ],
    queryFn: () => dashboardService.professors(),
    enabled: !!auth?.isAdmin,
  });

  const {
    data: students,
    error: studentsError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [ 'advisorStudents', professorId, status ],
    queryFn: () => dashboardService.studentsByAdvisor(professorId as number, status),
    enabled: !!auth?.isAdmin && professorId !== null,
  });

  return {
    professors: professors ?? [],
    professorsError,
    professorId,
    setProfessorId,
    status,
    setStatus,
    students: students ?? [],
    studentsError,
    isFetching,
    refetch,
  };
}
