'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
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
import { Eye, FileText } from 'lucide-react';
import api from '@/services/api';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

type Professor = {
  id: number;
  name: string;
  siape: number;
  email: string;
  lattes_url: string;
};

type StratumQualis = {
  id: number;
  code: string;
  score: number;
  created_at: string;
  updated_at: string;
};

type Production = {
  id: number;
  name: string;
  title: string;
  year: number;
  publisher_type: string | null;
  stratum_qualis_id: number;
  publisher_id: number;
  doi: string | null;
  publisher?: Publisher | null;
};

type Publisher = {
  id: number;
  initials: string | null;
  name: string;
  publisher_type: string;
  issn: string | null;
  percentile: string | null;
  update_date: string | null;
  tentative_date: string | null;
  logs: string | null;
  stratum_qualis_id: number | null;
  created_at: string;
  updated_at: string;
  stratum_qualis: StratumQualis | null;
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  current_page: number;
  per_page: number;
};

export default function ProfessorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailProfOpen, setIsDetailProfOpen] = useState(false);
  const [isProductionsOpen, setIsProductionsOpen] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(null);
  const [selectedProductions, setSelectedProductions] = useState<Production[]>([]);
  const [, setQualisList] = useState<StratumQualis[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const {
    data,
    isLoading,
    error,
  } = useQuery<PaginatedResponse<Professor>, Error>({
    queryKey: ['professors', currentPage, itemsPerPage, debouncedSearchTerm],
    queryFn: () =>
      api.fetchProfessors(currentPage, itemsPerPage, {
        name: debouncedSearchTerm || undefined,
      }),
    placeholderData: (prevData) => prevData,
  });

  const professors = data?.data ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / itemsPerPage);

  useEffect(() => {
    async function fetchQualis() {
      try {
        const qualis = await api.getAllQualis();
        setQualisList(qualis);
      } catch (err) {
        console.error('Erro ao carregar Qualis:', err);
      }
    }
    fetchQualis();
  }, []);

  const verProducoes = async (professorId: number) => {
    try {
      const rawProducoes = await api.getProductionsByProfessor(professorId);
      const entries = Object.entries(rawProducoes)
        .filter(([key]) => !isNaN(Number(key)))
        .map(([, value]) => value as unknown as Production);
      setSelectedProductions(entries);
      setIsProductionsOpen(true);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar produções do professor.');
    }
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

      {/* Filtros e paginação */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar docente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // volta pra página 1 ao buscar
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="itemsPerPage">Itens por página:</Label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professors.map((professor) => (
              <TableRow key={professor.id}>
                <TableCell className="font-medium">{professor.name}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCurrentProfessor(professor);
                      setIsDetailProfOpen(true);
                    }}
                    title="Detalhes"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => verProducoes(professor.id)}
                    title="Produções"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              {'<<'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹ Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              {'>>'}
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog - Detalhes do Professor */}
      <Dialog open={isDetailProfOpen} onOpenChange={setIsDetailProfOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes - Docente</DialogTitle>
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
            <Button onClick={() => setIsDetailProfOpen(false)}>Fechar</Button>
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
                <p><strong>Título da Produção:</strong> {prod.title}</p>
                <p><strong>D.O.I.:</strong> {prod.doi || 'erro'}</p>
                <p><strong>Ano:</strong> {prod.year}</p>
                {prod.publisher && (
                  <>
                    <p><strong>Local:</strong> {prod.publisher.name}</p>
                    {prod.publisher.initials && (
                      <p><strong>Sigla:</strong> {prod.publisher.initials}</p>
                    )}
                    <p><strong>Tipo:</strong> {prod.publisher.publisher_type}</p>
                    {prod.publisher.issn && (
                      <p><strong>ISSN:</strong> {prod.publisher.issn}</p>
                    )}
                  </>
                )}
                {prod.publisher?.stratum_qualis && (
                  <p>
                    <strong>Qualis:</strong> {prod.publisher.stratum_qualis.code}
                  </p>
                )}
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
