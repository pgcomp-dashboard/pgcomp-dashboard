import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdvisorStudent } from '@/types/user';

interface AdvisorStudentsTableProps {
  students: AdvisorStudent[];
  isLoading: boolean;
  isError: boolean;
}

export function AdvisorStudentsTable({
  students,
  isLoading,
  isError,
}: AdvisorStudentsTableProps) {
  if (isError) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Erro ao carregar os alunos deste orientador.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Carregando...
      </p>
    );
  }

  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum aluno encontrado para este filtro.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matrícula</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Curso</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.registration}</TableCell>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.course ?? '—'}</TableCell>
            <TableCell>{student.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
