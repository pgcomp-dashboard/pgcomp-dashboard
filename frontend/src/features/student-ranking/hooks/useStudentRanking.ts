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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const MINIMUM_RANKING_YEAR = 2000;

export function useStudentRanking() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(MINIMUM_RANKING_YEAR);
  const [endYear, setEndYear] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [onlyPositiveScore, setOnlyPositiveScore] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "position", desc: true },
  ]);

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["student-ranking-courses"],
    queryFn: () => courseService.fetchCourses({ per_page: 100 }),
  });

  const { data: configurations } = useQuery({
    queryKey: ["student-ranking-rules"],
    queryFn: () => configurationService.getAll(),
  });

  useEffect(() => {
    const config = configurations?.find(
      (item) => item.group === "student_ranking" && item.key === "rules",
    );

    if (!config?.casted_value) return;

    setEndYear(config.casted_value.final_year ?? currentYear);
    setPage(1);
  }, [configurations, currentYear]);

  const query = useQuery<PaginatedResponse<StudentRanking>, Error>({
    queryKey: [
      "student-ranking",
      startYear,
      endYear,
      courseId,
      isEligible,
      onlyPositiveScore,
      page,
      perPage,
      sorting,
    ],
    queryFn: () =>
      studentRankingService.getRanking(
        startYear,
        endYear,
        courseId,
        page,
        perPage,
        sorting[0]?.id ?? "position",
        sorting[0]?.desc !== false ? "desc" : "asc",
        isEligible,
        onlyPositiveScore,
      ),
    placeholderData: (previousData) => previousData,
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
    () =>
      Array.from(
        { length: currentYear - MINIMUM_RANKING_YEAR + 1 },
        (_, index) => currentYear - index,
      ),
    [currentYear],
  );

  return {
    ranking: query.data?.data ?? [],
    pagination: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    years,
    page,
    setPage,
    perPage,
    setPerPage,
    courseId,
    setCourseId,
    isEligible,
    setIsEligible,
    onlyPositiveScore,
    setOnlyPositiveScore,
    courses,
    sorting,
    setSorting,
    deleteMutation,
  };
}
