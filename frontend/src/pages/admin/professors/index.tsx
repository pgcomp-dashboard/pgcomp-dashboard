'use client';

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
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { productionsByProfessor, Production } from './productionsByProfessor'; 

type Professor = {
  id: number;
  name: string;
  siape: number;
  email: string;
  lattes_url: string;
};

export default function ProfessorsPage() {
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ isDetailProfOpen, setIsDetailProfOpen ] = useState(false);
  const [ isProductionsOpen, setIsProductionsOpen ] = useState(false);
  const [ currentProfessor, setCurrentProfessor ] = useState<Professor | null>(null);
  const [ selectedProductions, setSelectedProductions ] = useState<Production[]>([]);

  const history = useNavigate();

  const { data: professors = [], isLoading, error } = useQuery({
    queryKey: [ 'allProfessors' ],
    queryFn: () => api.getAllProfessors(),
  });

  const filteredProfessors = professors.filter((prof: Professor) =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const verProducoes = (professorId: number) => {
    const producoes = productionsByProfessor.filter(p => p.professorId === professorId);
    setSelectedProductions(producoes);
    setIsProductionsOpen(true);
  };

  const verDetalhes = () => {
    setIsDetailProfOpen(false);
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar professores!</div>;
  }

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
            {filteredProfessors.map((professor: Professor) => (
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

      {/* Dialog - Detalhes do Professor */}
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
            <Button onClick={verDetalhes}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog - Produções */}
      <Dialog open={isProductionsOpen} onOpenChange={setIsProductionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publicações do docente</DialogTitle>
            <DialogDescription>Lista de produções cadastradas</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {selectedProductions.map((prod, idx) => (
              <div
                key={idx}
                className="rounded border bg-gray-100 p-4 text-sm flex flex-col gap-1"
              >
                <p><strong>nome da produção:</strong> {prod.titulo}</p>
                <p><strong>Autores:</strong> {prod.autores}</p>
                <p><strong>Nota qualis:</strong> {prod.notaQualis}</p>
                <p><strong>Doi:</strong> {prod.doi || 'erro'}</p>
                <p><strong>Publicação:</strong> {prod.publicacao}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsProductionsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
