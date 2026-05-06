import { projectDashboardService } from '@/services/modules/project-dashboard.service';
import { configurationService } from '@/services/modules/configuration.service';
import { ProjectDashboardFilters } from '@/features/projects/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

export function useProjectDashboard() {
  const date = new Date();

  const [ filters, setFilters ] = useState<ProjectDashboardFilters>({
    professorId: null,
    startYear: null,
    endYear: null,
    status: null,
  });

  const { data: rulesData } = useQuery({
    queryKey: [ 'rulesYears' ],
    queryFn: () => configurationService.getRulesEndAndStartYears(),
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (rulesData?.startYear) setFilters((prev) => ({ ...prev, startYear: rulesData.startYear }));
    if (rulesData?.endYear) setFilters((prev) => ({ ...prev, endYear: rulesData.endYear }));
  }, [ rulesData ]);

  const years = useMemo(() => {
    return Array.from(
      { length: date.getFullYear() - 2000 + 1 },
      (_, i) => 2000 + i,
    ).reverse();
  }, [ date ]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (filters.professorId) params.professor_id = filters.professorId;
    if (filters.startYear) params.start_year = filters.startYear;
    if (filters.endYear) params.end_year = filters.endYear;
    if (filters.status) params.status = filters.status;
    return params;
  }, [ filters ]);

  const {
    data: summary,
    isLoading: isLoadingSummary,
    isFetching: isFetchingSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: [ 'projectDashboardSummary', queryParams ],
    queryFn: () => projectDashboardService.getSummary(queryParams),
    placeholderData: (prevData) => prevData,
  });

  const {
    data: tableData = [],
    isLoading: isLoadingTable,
    isFetching: isFetchingTable,
    refetch: refetchTable,
  } = useQuery({
    queryKey: [ 'projectDashboardTable', queryParams ],
    queryFn: () => projectDashboardService.getTable(queryParams),
    placeholderData: (prevData) => prevData,
  });

  const {
    data: professors = [],
    isLoading: isLoadingProfessors,
  } = useQuery({
    queryKey: [ 'projectDashboardProfessors' ],
    queryFn: () => projectDashboardService.getProfessors(),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingSummary || isLoadingTable;
  const isFetching = isFetchingSummary || isFetchingTable;

  const refetch = () => {
    refetchSummary();
    refetchTable();
  };

  return {
    summary,
    tableData,
    professors,
    isLoading,
    isFetching,
    isLoadingProfessors,
    filters,
    setFilters,
    years,
    refetch,
  };
}