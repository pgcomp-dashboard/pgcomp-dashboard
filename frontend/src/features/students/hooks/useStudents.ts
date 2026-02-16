import { areaService } from '@/services/modules/area.service';
import { courseService } from '@/services/modules/course.service';
import { studentService } from '@/services/modules/student.service';
import { Area, Course } from '@/types/academic';
import { Student } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function useStudents() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Queries
  const studentsQuery = useQuery({
    queryKey: ['students', page, perPage, search],
    queryFn: async () => {
      const filters: Record<string, any> = {};
      if (search.trim()) {
        filters['filters[0][field]'] = 'name';
        filters['filters[0][value]'] = search.trim();
        filters['filters[0][operator]'] = 'like';
      }
      const response = await studentService.fetchStudents(page, perPage, filters);
      return {
        ...response,
        meta: {
          ...response.meta,
          last_page: Math.max(1, response.meta.last_page),
        },
      };
    },
    placeholderData: (prevData) => prevData,
  });

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
    students: studentsQuery.data?.data ?? [],
    pagination: studentsQuery.data ?? null,
    areas: areasQuery.data ?? [],
    courses: coursesQuery.data ?? [],

    // Status
    isLoading: studentsQuery.isLoading || areasQuery.isLoading || coursesQuery.isLoading,
    isError: studentsQuery.isError || areasQuery.isError || coursesQuery.isError,

    // Actions
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
