import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Professor } from "@/types/user";
import { Eye, FileText, SquarePenIcon } from "lucide-react";

interface ProfessorTableProps {
  professors: Professor[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onViewDetails: (professor: Professor) => void;
  onViewProductions: (id: number) => void;
}

export function ProfessorTable({
  professors,
  searchTerm,
  setSearchTerm,
  onViewDetails,
  onViewProductions,
}: ProfessorTableProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar docente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Nome</TableHead>
              <TableHead className="text-center">Categoria</TableHead>
              <TableHead className="text-center">Administrador</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professors.map((professor) => (
              <TableRow key={professor.id}>
                <TableCell className="text-center">{professor.name}</TableCell>
                <TableCell className="text-center">
                  {professor.category?.replace(/^./, (match) =>
                    match.toUpperCase()
                  ) || "Não Encontrado"}
                </TableCell>
                <TableCell className="text-center">
                  {professor.is_admin ? "Sim" : "Não"}
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(professor)}
                    title="Editar"
                  >
                    <SquarePenIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewProductions(professor.id)}
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

      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="flex flex-col gap-3">
          {professors.map((professor) => (
            <div key={professor.id} className="rounded-lg border p-4 bg-white">
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-base">{professor.name}</h3>
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onViewDetails(professor)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onViewProductions(professor.id)}
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
    </div>
  );
}
