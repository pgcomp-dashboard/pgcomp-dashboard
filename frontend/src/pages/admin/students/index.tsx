'use client';

import { StudentDialogs } from '@/features/students/components/StudentDialogs';
import { StudentHeader } from '@/features/students/components/StudentHeader';
import { StudentTable } from '@/features/students/components/StudentTable';
import { useStudents } from '@/features/students/hooks/useStudents';
import { Student } from '@/types/user';
import { useState } from 'react';

export default function StudentsPage() {
  const {
    students, areas, courses, pagination,
    page, setPage, perPage, setPerPage, search, setSearch,
    createMutation, updateMutation, deleteMutation
  } = useStudents();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setOpenEdit(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setOpenDelete(true);
  };

  return (
    <div className="space-y-6">
      <StudentHeader onAddClick={() => setOpenAdd(true)} />

      <StudentTable
        students={students}
        areas={areas}
        courses={courses}
        pagination={pagination}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <StudentDialogs
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
        openDelete={openDelete}
        setOpenDelete={setOpenDelete}
        selectedStudent={selectedStudent}
        areas={areas}
        courses={courses}
        onCreate={(s) => createMutation.mutate(s)}
        onUpdate={(id, s) => updateMutation.mutate({ id, student: s })}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
