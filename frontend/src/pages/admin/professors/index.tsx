'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Eye, FileText } from 'lucide-react';
import { professorMock, Professor } from './professorMock';

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setProfessors(professorMock);
  }, []);

  const filteredProfessors = professors.filter((prof) =>
    prof.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const verProducoes = (id: number) => {
    console.log(`Ver produções de ${id}`);
  };

  const verDetalhes = (id: number) => {
    console.log(`Ver detalhes de ${id}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Docentes</h1>
      <p className="text-muted-foreground">Visualize e gerencie os docentes cadastrados no sistema.</p>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Buscar docente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfessors.map((professor) => (
            <TableRow key={professor.id}>
              <TableCell className="font-medium">{professor.nome}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => verProducoes(professor.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Produções
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => verDetalhes(professor.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Detalhes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

