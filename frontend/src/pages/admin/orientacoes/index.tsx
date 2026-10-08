'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvisorStudentsTable } from '@/features/advisor-students/components/AdvisorStudentsTable';
import { useAdvisorStudents } from '@/features/advisor-students/hooks/useAdvisorStudents';

export default function OrientacoesPage() {
  const {
    professors,
    professorsError,
    professorId,
    setProfessorId,
    status,
    setStatus,
    students,
    studentsError,
    isFetching,
  } = useAdvisorStudents();

  if (professorsError) {
    return <>Falha ao carregar professores!</>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <CardTitle>Orientações</CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={status ?? 'all'}
            onValueChange={(value) =>
              setStatus(value === 'all' ? undefined : (value as 'mestrando' | 'doutorando' | 'completed'))
            }
          >
            <TabsList>
              <TabsTrigger value="all">Atuais</TabsTrigger>
              <TabsTrigger value="mestrando">Mestrando</TabsTrigger>
              <TabsTrigger value="doutorando">Doutorando</TabsTrigger>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={professorId?.toString() ?? 'none'}
            onValueChange={(value) =>
              setProfessorId(value === 'none' ? null : parseInt(value))
            }
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione um professor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                Selecione um professor...
              </SelectItem>
              {professors.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {professorId === null ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Selecione um professor para visualizar os alunos orientados.
          </p>
        ) : (
          <AdvisorStudentsTable
            students={students}
            isLoading={isFetching}
            isError={!!studentsError}
          />
        )}
      </CardContent>
    </Card>
  );
}
