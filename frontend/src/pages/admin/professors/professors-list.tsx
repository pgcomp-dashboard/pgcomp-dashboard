import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { professorService } from "@/services/modules/professor.service";
import { Professor } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function ProfessorsPage() {
  const [isDetailProfOpen, setIsDetailProfOpen] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<Professor[], Error>({
    queryKey: ["professors"],
    queryFn: () => professorService.fetchProfessors(),
    placeholderData: (prevData) => prevData,
  });

  const handleNavigateToProductions = (professorId: number) => {
    navigate(`/admin/professors/${professorId}/productions`);
  };

  const countPermanente =
    data?.filter((p) => p.category?.toLowerCase() === "permanente").length || 0;
  const countColaboradores =
    data?.filter((p) => p.category?.toLowerCase() === "colaborador").length ||
    0;
  const countVisitantes =
    data?.filter((p) => p.category?.toLowerCase() === "visitante").length || 0;

  console.log();

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar professores!</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            Docentes
          </h1>
          <p className="ml-4 text-muted-foreground text-sm">
            ({countPermanente} Permanentes, {countColaboradores} Colaboradores,{" "}
            {countVisitantes} Visitantes)
          </p>
        </div>
        <p className="text-muted-foreground">
          Visualize e gerencie os docentes cadastrados no sistema.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar docente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Nome</TableHead>
              <TableHead className="text-center">Categoria</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data &&
              data.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell className="text-center">
                    {professor.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {professor.category?.replace(/^./, (match) =>
                      match.toUpperCase(),
                    ) || "Não Encontrado"}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2">
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
                      onClick={() => handleNavigateToProductions(professor.id)}
                      title="Produções"
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden">
        <div className="flex flex-col gap-3">
          {data &&
            data.map((professor) => (
              <div
                key={professor.id}
                className="rounded-lg border p-4 bg-white"
              >
                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-base">{professor.name}</h3>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setCurrentProfessor(professor);
                        setIsDetailProfOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleNavigateToProductions(professor.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Produções
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
                <Label>Lattes</Label>
                <a
                  href={currentProfessor.lattes_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm wrap-break-word"
                >
                  {currentProfessor.lattes_url}
                </a>
              </div>
              <div className="grid gap-1">
                <Label>ORCID</Label>
                <span className="text-sm">0000-0000-0000-0000</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailProfOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
