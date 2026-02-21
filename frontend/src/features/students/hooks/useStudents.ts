import { areaService } from '@/services/modules/area.service';
import { courseService } from '@/services/modules/course.service';
import { studentService } from '@/services/modules/student.service';
import { Area, Course } from '@/types/academic';
import { Student } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

export function useStudents() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.fetchStudents({ per_page: 1000 }),
    placeholderData: (prevData) => prevData,
  });

  const students = useMemo(() => {
    if (!data?.data) return [];

    const term = search.toLowerCase().trim();
    if (!term) return data.data;

    return data.data.filter((student: Student) =>
      student.name.toLowerCase().includes(term)
    );
  }, [data, search]);

  const areasQuery = useQuery<Area[]>({
    queryKey: ['areas'],
    queryFn: () => areaService.fetchAreas(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const coursesQuery = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => courseService.fetchCourses(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newStudent: Omit<Student, 'id'>) => studentService.createStudent(newStudent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, student }: { id: number; student: Omit<Student, 'id'> }) =>
      studentService.updateStudent(id, student),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  return {
    // State
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,

    // Data
    students,
    pagination: data ?? null,
    areas: areasQuery.data ?? [],
    courses: coursesQuery.data ?? [],

    // Status
    isLoading: isLoading || areasQuery.isLoading || coursesQuery.isLoading,
    isError: !!error || areasQuery.isError || coursesQuery.isError,

    // Actions
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
