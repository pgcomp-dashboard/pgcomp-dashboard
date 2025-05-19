'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Student, studentMock } from './studentsMock';
import { areaMock } from './areasMock';
import { courseMock } from './coursesMock';

export default function StudentsPage() {
  const [students, setStudents] = useState(studentMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    area_id: 0,
    course_id: 0,
    lattes_url: '',
    defended_at: '',
  });

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAdd = () => {
    const id = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    setStudents([...students, { id, ...newStudent }]);
    setNewStudent({
      name: '',
      email: '',
      area_id: 0,
      course_id: 0,
      lattes_url: '',
      defended_at: '',
    });
    setIsAddOpen(false);
  };

  const getAreaName = (id: number | null) => {
    if (id === null) return 'Não Informado';
    const area = areaMock.find(a => a.id === id);
    return area ? `${area.area} - ${area.subarea}` : 'Não Informado';
  };

  const getCourseName = (id: number | null) => {
    if (id === null) return 'Não Informado';
    const course = courseMock.find(c => c.id === id);
    return course ? course.name : 'Não Informado';
  };
  const handleEdit = () => {
    if (!currentStudent) return;
    setStudents(students.map(s => (s.id === currentStudent.id ? currentStudent : s)));
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    if (!currentStudent) return;
    setStudents(students.filter(s => s.id !== currentStudent.id));
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discentes</h1>
          <p className="text-muted-foreground">Gerencie os estudantes cadastrados no sistema.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Adicionar estudante</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo estudante</DialogTitle>
              <DialogDescription>Preencha os dados do estudante</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course_id">Curso</Label>
                <Select value={String(newStudent.course_id)} onValueChange={(value) => setNewStudent({ ...newStudent, course_id: parseInt(value) })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseMock.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label htmlFor="area_id">Área</Label>
                <Select value={String(newStudent.area_id)} onValueChange={(value) => setNewStudent({ ...newStudent, area_id: parseInt(value) })}>
                  <SelectTrigger className="w-full truncate">
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaMock.map((area) => (
                      <SelectItem key={area.id} value={String(area.id)}>
                        {area.area} - {area.subarea}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lattes_url">URL do Lattes</Label>
                <Input id="lattes_url" value={newStudent.lattes_url} onChange={(e) => setNewStudent({ ...newStudent, lattes_url: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="defended_at">Data de Defesa</Label>
                <Input id="defended_at" type="date" value={newStudent.defended_at} onChange={(e) => setNewStudent({ ...newStudent, defended_at: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
              <Button onClick={handleAdd}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar estudantes..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{getAreaName(s.area_id)}</TableCell>
                <TableCell>{getCourseName(s.course_id)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setCurrentStudent(s); setIsEditOpen(true);
                      }}>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => {
                        setCurrentStudent(s); setIsDeleteOpen(true);
                      }}>Apagar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar estudante</DialogTitle>
            <DialogDescription>Modifique os dados do estudante.</DialogDescription>
          </DialogHeader>
          {currentStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={currentStudent.name} onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={currentStudent.email || ''} onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course_id">Curso</Label>
                <Select value={String(currentStudent.course_id)} onValueChange={(value) => setCurrentStudent({ ...currentStudent, course_id: parseInt(value) })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseMock.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label htmlFor="area_id">Área</Label>
                <Select value={String(currentStudent.area_id)} onValueChange={(value) => setCurrentStudent({ ...currentStudent, area_id: parseInt(value) })}>
                  <SelectTrigger className="w-full truncate">
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaMock.map((area) => (
                      <SelectItem key={area.id} value={String(area.id)}>
                        {area.area} - {area.subarea}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lattes_url">URL do Lattes</Label>
                <Input id="lattes_url" value={currentStudent.lattes_url || ''} onChange={(e) => setCurrentStudent({ ...currentStudent, lattes_url: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="defended_at">Data de Defesa</Label>
                <Input id="defended_at" type="date" value={currentStudent.defended_at || ''} onChange={(e) => setCurrentStudent({ ...currentStudent, defended_at: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir estudante</DialogTitle>
            <DialogDescription>Essa ação é irreversível.</DialogDescription>
          </DialogHeader>
          {currentStudent && (
            <div className="py-4">
              <p>Você deseja excluir <strong>{currentStudent.name}</strong>?</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
