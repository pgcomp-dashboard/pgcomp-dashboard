import { studentRankingService } from "@/services/modules/student-ranking.service";
import { studentService } from "@/services/modules/student.service";
import { configurationService } from "@/services/modules/configuration.service";
import { courseService } from "@/services/modules/course.service";
import { parseApiError } from "@/services/http-client";
import { Course } from "@/types/academic";
import { StudentRanking } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { SortingState } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const MINIMUM_RANKING_YEAR = 2000;

export function useStudentRanking() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [courseId, setCourseId] = useState<number | null | undefined>(undefined);
  const [onlyPositiveScore, setOnlyPositiveScore] = useState(true);
  const [includeIneligible, setIncludeIneligible] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "position", desc: true },
  ]);

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["student-ranking-courses"],
    queryFn: () => courseService.fetchCourses({ per_page: 100 }),
  });

  const selectedCourseId =
    courseId === undefined
      ? (courses.find(
          (course) => course.name.trim().toLowerCase() === "mestrado",
        )?.id ?? null)
      : courseId;

  const {
    data: configurations,
    isLoading: isLoadingConfigurations,
    error: configurationsError,
  } = useQuery({
    queryKey: [ 'configurations' ],
    queryFn: () => configurationService.getAll(),
  });

  const rules = configurations?.find(
    (item) => item.group === 'student_ranking' && item.key === 'rules',
  )?.casted_value;
  const configuredStartYear =
    startYear ?? rules?.initial_year ?? currentYear - 4;
  const configuredEndYear = endYear ?? rules?.final_year ?? currentYear;

  const selectedStartYear = configuredStartYear;
  const selectedEndYear = configuredEndYear;

  const query = useQuery<PaginatedResponse<StudentRanking>, Error>({
    queryKey: [
      "student-ranking",
      selectedStartYear,
      selectedEndYear,
      rules ?? null,
      selectedCourseId,
      onlyPositiveScore,
      includeIneligible,
      page,
      perPage,
      sorting,
    ],
    queryFn: () =>
      studentRankingService.getRanking(
        selectedStartYear,
        selectedEndYear,
        selectedCourseId,
        page,
        perPage,
        sorting[0]?.id ?? "position",
        sorting[0]?.desc !== false ? "desc" : "asc",
        onlyPositiveScore,
        includeIneligible,
      ),
    placeholderData: (previousData) => previousData,
    enabled:
      !isLoadingCourses &&
      !isLoadingConfigurations &&
      !configurationsError,
  });

  const deleteMutation = useMutation({
    mutationFn: (studentId: number) => studentService.deleteStudent(studentId),
    onSuccess: () => {
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["student-ranking"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Discente excluído com sucesso.");
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });

  const years = useMemo(
    () => {
      const firstYear = Math.min(
        MINIMUM_RANKING_YEAR,
        configuredStartYear,
        configuredEndYear,
      );
      const lastYear = Math.max(
        currentYear,
        configuredStartYear,
        configuredEndYear,
      );

      return Array.from(
        { length: lastYear - firstYear + 1 },
        (_, index) => lastYear - index,
      );
    },
    [ currentYear, configuredStartYear, configuredEndYear ],
  );

  return {
    ranking: query.data?.data ?? [],
    pagination: query.data ?? null,
    isLoading:
      query.isLoading || isLoadingCourses || isLoadingConfigurations,
    isFetching: query.isFetching,
    error: query.error ?? configurationsError,
    refetch: query.refetch,
    startYear: selectedStartYear,
    setStartYear,
    endYear: selectedEndYear,
    setEndYear,
    years,
    page,
    setPage,
    perPage,
    setPerPage,
    courseId: selectedCourseId,
    setCourseId,
    onlyPositiveScore,
    setOnlyPositiveScore,
    includeIneligible,
    setIncludeIneligible,
    courses,
    sorting,
    setSorting,
    deleteMutation,
  };
}
