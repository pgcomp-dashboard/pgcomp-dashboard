import { studentRankingService } from "@/services/modules/student-ranking.service";
import { configurationService } from "@/services/modules/configuration.service";
import { courseService } from "@/services/modules/course.service";
import { Course } from "@/types/academic";
import { StudentRanking } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { SortingState } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export function useStudentRanking() {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear - 4);
  const [endYear, setEndYear] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [courseId, setCourseId] = useState<number | null>(null);
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

    setStartYear(config.casted_value.initial_year ?? currentYear - 4);
    setEndYear(config.casted_value.final_year ?? currentYear);
    setPage(1);
  }, [configurations, currentYear]);

  const query = useQuery<PaginatedResponse<StudentRanking>, Error>({
    queryKey: [
      "student-ranking",
      startYear,
      endYear,
      courseId,
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
      ),
    placeholderData: (previousData) => previousData,
  });

  const years = useMemo(
    () =>
      Array.from(
        { length: currentYear - 2000 + 1 },
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
    courses,
    sorting,
    setSorting,
  };
}
