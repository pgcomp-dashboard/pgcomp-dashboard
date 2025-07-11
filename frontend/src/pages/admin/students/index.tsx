
'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Trash } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Student {
  id: number;
  name: string;
  email: string | null;
  registration: number | null;
  type: 'student';
  is_admin: boolean;
  area_id: number | null;
  course_id: number;
  lattes_url: string | null;
  defended_at: string | null;
  is_protected: boolean;
}

interface Area {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<any>(null); // temporariamente, para evitar erro de tipo
  const [areas, setAreas] = useState<Area[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    registration: 0,
    type: 'student',
    is_admin: false,
    area_id: 0,
    course_id: 0,
    lattes_url: '',
    defended_at: '',
    is_protected: false,
  });

  // Carregar dados iniciais

  async function fetchData() {
    const filters: Record<string, any> = {};
    if (search.trim()) {
      filters['filters[0][field]'] = 'name';
      filters['filters[0][value]'] = search.trim();
      filters['filters[0][operator]'] = 'like';
    }
    const [studentsRes, areasData, coursesData] = await Promise.all([
      api.fetchStudents(page, perPage, filters),
      api.fetchAreas(),
      api.fetchCourses(),
    ]);

    setStudents(studentsRes.data);
    setPagination({
      current_page: studentsRes.current_page,
      last_page: studentsRes.last_page,
      per_page: studentsRes.per_page,
      total: studentsRes.total,
      from: studentsRes.from,
      to: studentsRes.to,
    });
    setAreas(areasData);
    setCourses(coursesData);
  }

  useEffect(() => {
    fetchData();
  }, [page, perPage, search]);

  const filteredStudents = students.filter(
    (student) =>
      student &&
      student.name &&
      student.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getAreaName = (id: number) => areas.find((a) => a.id === id)?.name || '—';
  const getCourseName = (id: number) => courses.find((c) => c.id === id)?.name || '—';

  // ==== Validação de campos obrigatórios ====
  function validateStudent(student: Omit<Student, 'id'> | Student) {
    if (!student.name.trim()) return false;
    if (!student.registration) return false;
    if (!student.course_id) return false;
    if (!student.area_id) return false;
    return true;
  }

  // Adicionar estudante
  async function addStudent() {
    if (!validateStudent(newStudent)) {
      alert('Preencha todos os campos obrigatórios: Nome, Matrícula, Curso e Área.');
      return;
    }
    try {
      const created = await api.createStudent(newStudent);
      setStudents((old) => [...old, created]);
      setNewStudent({
        name: '',
        email: '',
        registration: 0,
        type: 'student',
        is_admin: false,
        area_id: 0,
        course_id: 0,
        lattes_url: '',
        defended_at: '',
        is_protected: false,
      });
      setOpenAdd(false);
      fetchData()
    } catch (error) {
      console.error('Erro ao adicionar estudante:', error);
    }
  }

  // Editar estudante
  async function editStudent() {
    if (!selectedStudent) return false;
    if (!validateStudent(selectedStudent)) {
      alert('Preencha todos os campos obrigatórios: Nome, Matrícula, Curso e Área.');
      return false;
    }
    try {
      const updated = await api.updateStudent(selectedStudent.id, selectedStudent);
      setStudents((old) => old.map((s) => (s.id === updated.id ? updated : s)));
      setOpenEdit(false);
    } catch (error) {
      console.error('Erro ao editar estudante:', error);
    }
  }

  // Excluir estudante
  async function deleteStudent() {
    if (!selectedStudent) return;
    try {
      await api.deleteStudent(selectedStudent.id);
      setStudents((old) => old.filter((s) => s.id !== selectedStudent.id));
      setOpenDelete(false);
    } catch (error) {
      console.error('Erro ao excluir estudante:', error);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discentes</h1>
          <p className="text-muted-foreground">Gerencie os estudantes cadastrados no sistema.</p>
        </div>

        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button data-cy="add-student-button"><Plus className="mr-2 h-4 w-4" /> Adicionar estudante</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo estudante</DialogTitle>
              <DialogDescription>Preencha os dados do estudante</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4" data-cy="add-student-form">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Nome</Label>
                <Input
                  id="add-name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  value={newStudent.email ?? ''}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="add-course">Curso</Label>
                  <Select
                    value={String(newStudent.course_id)}
                    onValueChange={(v) => setNewStudent({ ...newStudent, course_id: Number(v) })}
                  >
                    <SelectTrigger data-cy="add-course" className="w-full">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {(courses ?? []).map((course) => (
                        <SelectItem data-cy={`add-course-item-${course.id}`} key={course.id} value={String(course.id)}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="add-area">Área</Label>
                  <Select
                    value={String(newStudent.area_id)}
                    onValueChange={(v) => setNewStudent({ ...newStudent, area_id: Number(v) })}
                  >
                    <SelectTrigger data-cy="add-area" className="w-full">
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      {(areas ?? []).map((area) => (
                        <SelectItem data-cy={`add-area-item-${area.id}`} key={area.id} value={String(area.id)}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-lattes">URL do Lattes</Label>
                <Input
                  id="add-lattes"
                  value={newStudent.lattes_url ?? ''}
                  onChange={(e) => setNewStudent({ ...newStudent, lattes_url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Matrícula</Label>
                  <Input
                    id="add-registration"
                    type="number"
                    value={newStudent.registration ?? 0}
                    onChange={(e) => setNewStudent({ ...newStudent, registration: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-defended_at">Data de Defesa</Label>
                  <Input
                    id="add-defended_at"
                    type="date"
                    value={newStudent.defended_at ?? ''}
                    onChange={(e) => setNewStudent({ ...newStudent, defended_at: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setNewStudent({
                  name: '',
                  email: '',
                  registration: 0,
                  type: 'student',
                  is_admin: false,
                  area_id: 0,
                  course_id: 0,
                  lattes_url: '',
                  defended_at: '',
                  is_protected: false,
                });
                setOpenAdd(false);
              }}>
                Cancelar
              </Button>
              <Button data-cy="add-student-form-submit" onClick={addStudent}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>


      <div className="rounded-md border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar estudantes..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label htmlFor="perPageSelect" className="mr-2 text-sm text-muted-foreground">
              Estudantes por página:
            </label>
            <select
              id="perPageSelect"
              className="border rounded px-2 py-1 text-sm"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Lattes</TableHead>
              <TableHead>Data de defesa</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.registration}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{getCourseName(student.course_id)}</TableCell>
                <TableCell>{getAreaName(student.area_id ?? 0)}</TableCell>
                <TableCell>
                  {student.lattes_url ? (
                    <a
                      href={student.lattes_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Lattes
                    </a>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {student.defended_at ? new Date(student.defended_at).toLocaleDateString('pt-BR') : '—'}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    data-cy={`student-edit-button-${student.registration}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    aria-label="Editar"
                    onClick={() => {
                      setSelectedStudent(student);
                      setOpenEdit(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    data-cy={`student-delete-button-${student.registration}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive cursor-pointer"
                    aria-label="Excluir"
                    onClick={() => {
                      setSelectedStudent(student);
                      setOpenDelete(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Página {pagination.current_page} de {pagination.last_page}
            </span>

            <div className="flex gap-2">
              {/* Botão Primeira Página */}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => {
                  setPage(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {'<<'}
              </Button>

              {/* Botão Anterior */}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => {
                  setPage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Anterior
              </Button>

              {/* Botão Próxima */}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => {
                  setPage((prev) => Math.min(prev + 1, pagination.last_page));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Próxima
              </Button>

              {/* Botão Última Página */}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => {
                  setPage(pagination.last_page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {'>>'}
              </Button>
            </div>
          </div>
        )}


      </div>

      {/* Editar Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar estudante</DialogTitle>
            <DialogDescription>Altere os dados do estudante</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={selectedStudent?.name ?? ''}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={selectedStudent.email ?? ''}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, email: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-course">Curso</Label>
                  <Select
                    value={String(selectedStudent.course_id)}
                    onValueChange={(v) =>
                      setSelectedStudent({ ...selectedStudent, course_id: Number(v) })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {(courses ?? []).map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-area">Área</Label>
                  <Select
                    value={String(selectedStudent.area_id)}
                    onValueChange={(v) =>
                      setSelectedStudent({ ...selectedStudent, area_id: Number(v) })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      {(areas ?? []).map((area) => (
                        <SelectItem key={area.id} value={String(area.id)}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lattes">URL do Lattes</Label>
                <Input
                  id="edit-lattes"
                  value={selectedStudent.lattes_url ?? ''}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, lattes_url: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Matrícula</Label>
                  <Input
                    id="edit-registration"
                    type="number"
                    value={selectedStudent?.registration ?? ''}
                    onChange={(e) =>
                      setSelectedStudent({ ...selectedStudent, registration: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-defended_at">Data de Defesa</Label>
                  <Input
                    id="edit-defended_at"
                    type="date"
                    value={selectedStudent.defended_at || ''}
                    onChange={(e) =>
                      setSelectedStudent({ ...selectedStudent, defended_at: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                const success = await editStudent();    // tenta salvar no backend
                if (success) {
                  setOpenEdit(false);                   // fecha o modal somente em sucesso
                  setSelectedStudent(null);             // limpa a seleção
                }
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o estudante{' '}
              <strong>{selectedStudent?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedStudent(null);;
              setOpenDelete(false);
            }}>
              Cancelar
            </Button>
            <Button data-cy="student-list-dropdown-delete-modal-confirm-button" variant="destructive" onClick={deleteStudent}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
