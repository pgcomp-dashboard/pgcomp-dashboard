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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MoreVertical, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router';
import api from '@/services/api';
import { Label } from '@/components/ui/label';

type Professor = {
  id: number;
  name: string;
  siape: number;
  email: string;
  lattes_url: string;
};

export default function ProfessorsPage() {
  const [ professors, setProfessors ] = useState<Professor[]>([]);
  const [ searchTerm, setSearchTerm ] = useState('');
  const history = useNavigate();
  let allProfessors: Professor[] = [];
  let currentPage = 1;
  let lastPage = 1;

  const [ isDetailProfOpen, setIsDetailProfOpen ] = useState(false);
  const [ currentProfessor, setCurrentProfessor ] = useState<Professor | null>(null);

  const fetchAllProfessors = async () => {
    try {
      do {
        const response = await api.get(`/api/portal/admin/professors?page=${currentPage}`);
        const data = response.data;
        allProfessors = allProfessors.concat(data);
        lastPage = response.last_page;
        currentPage++;
      } while (currentPage <= lastPage);

      setProfessors(allProfessors);
    } catch (error: any) {
      if (error.response?.status === 500) {
        history('/erro');
      } else if (error.response?.status === 404) {
        history('/*');
      } else {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchAllProfessors();
  }, []);

  const filteredProfessors = professors.filter((prof) =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const verProducoes = (id: number) => {
    console.log(`Ver produções de ${id}`);
    // history(`/admin/professors/${id}/productions`);
  };

  const verDetalhes = () => {
    if (!currentProfessor) return;
    setProfessors((prev) =>
      prev.map((prof) =>
        prof.id === currentProfessor.id ? currentProfessor : prof
      ));
    setIsDetailProfOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Docentes</h1>
      <p className="text-muted-foreground">
        Visualize e gerencie os docentes cadastrados no sistema.
      </p>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar docente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
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
                <TableCell className="font-medium">{professor.name}</TableCell>
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
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentProfessor(professor);
                          setIsDetailProfOpen(true);
                        }}
                      >
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

      <Dialog open={isDetailProfOpen} onOpenChange={setIsDetailProfOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes - Docentes</DialogTitle>
            <DialogDescription>Visualizar Detalhes</DialogDescription>
          </DialogHeader>

          {currentProfessor && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-1">
                <Label>Nome</Label>
                <span className="text-sm">{currentProfessor.name}</span>
              </div>
              <div className="grid gap-1">
                <Label>SIAPE</Label>
                <span className="text-sm">{currentProfessor.siape}</span>
              </div>
              <div className="grid gap-1">
                <Label>Email</Label>
                <span className="text-sm">{currentProfessor.email}</span>
              </div>
              <div className="grid gap-1">
                <Label>URL do Lattes</Label>
                <a
                  href={currentProfessor.lattes_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm break-words"
                >
                  {currentProfessor.lattes_url}
                </a>
              </div>
            </div>
          )}


          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailProfOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={verDetalhes}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
