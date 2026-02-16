import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Area, Course } from '@/types/academic';
import { PaginatedResponse } from '@/types/common';
import { Student } from '@/types/user';
import { Pencil, Search, Trash } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  areas: Area[];
  courses: Course[];
  pagination: PaginatedResponse<Student> | null;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  search: string;
  setSearch: (search: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentTable({
  students,
  areas,
  courses,
  pagination,
  page,
  setPage,
  perPage,
  setPerPage,
  search,
  setSearch,
  onEdit,
  onDelete,
}: StudentTableProps) {
  const getAreaName = (id: number) => areas.find((a) => a.id === id)?.name || '—';
  const getCourseName = (id: number) => courses.find((c) => c.id === id)?.name || '—';

  return (
    <div className="rounded-md border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-4 border-b">
        <div className="relative flex-1 w-full">
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="perPageSelect" className="text-sm text-muted-foreground whitespace-nowrap">
            Por página:
          </label>
          <select
            id="perPageSelect"
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 15, 25, 50, 100].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
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
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.registration}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{getCourseName(student.course_id)}</TableCell>
                <TableCell>{getAreaName(student.area_id ?? 0)}</TableCell>
                <TableCell>
                  {student.lattes_url ? (
                    <a href={student.lattes_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      Lattes
                    </a>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  {student.defended_at ? new Date(student.defended_at).toLocaleDateString('pt-BR') : '—'}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(student)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(student)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col gap-3 p-4">
        {students.map((student) => (
          <div key={student.id} className="rounded-lg border p-4 bg-white">
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <span className="text-xs font-medium text-muted-foreground mr-2">#{student.registration}</span>
                <h3 className="font-semibold text-base">{student.name}</h3>
                {student.email && <p className="text-sm text-muted-foreground mt-1">{student.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Curso</span>
                  <p className="font-medium">{getCourseName(student.course_id)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Área</span>
                  <p className="font-medium">{getAreaName(student.area_id ?? 0)}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" className="flex-1" onClick={() => onEdit(student)}>
                  <Pencil className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button variant="outline" className="flex-1 text-red-500 hover:text-red-600" onClick={() => onDelete(student)}>
                  <Trash className="h-4 w-4 mr-2" /> Deletar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Página {pagination.meta.current_page} de {pagination.meta.last_page}
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(1)}>
              {'<<'}
            </Button>
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page === pagination.meta.last_page} onClick={() => setPage(page + 1)}>
              Próxima
            </Button>
            <Button variant="outline" size="sm" disabled={page === pagination.meta.last_page} onClick={() => setPage(pagination.meta.last_page)}>
              {'>>'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
