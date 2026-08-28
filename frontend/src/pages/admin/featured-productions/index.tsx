import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productionService } from "@/services/modules/production.service";
import { professorService } from "@/services/modules/professor.service";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState } from "react";

export default function FeaturedProductionsPage() {
  const [page, setPage] = useState(1);
  const [professorId, setProfessorId] = useState("all");
  const perPage = 15;
  const { data: professorsData } = useQuery({
    queryKey: ["professors", "full"],
    queryFn: () => professorService.fetchProfessors({ paginate: "false" }),
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-productions", page, professorId],
    queryFn: () =>
      productionService.getFeaturedGrouped({
        page,
        per_page: perPage,
        ...(professorId !== "all" && { professor_id: professorId }),
      }),
  });

  const groups = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Produções favoritas
          </h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Favoritos agrupados por docente.
        </p>
        <div className="mt-4 max-w-xs">
          <Select
            value={professorId}
            onValueChange={(value) => {
              setProfessorId(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por professor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os professores</SelectItem>
              {professorsData?.data.map((professor) => (
                <SelectItem key={professor.id} value={professor.id.toString()}>
                  {professor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        {isError ? (
          <div className="p-8 text-center text-destructive">
            Erro ao carregar favoritos.
          </div>
        ) : (
          groups.map((group) => (
            <section
              key={group.professor.id}
              className="border-b last:border-b-0"
            >
              <div className="border-b bg-muted/30 px-4 py-3">
                <h2 className="font-semibold">{group.professor.name}</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produção</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Veículo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.productions.map((favorite) => (
                    <TableRow key={favorite.id}>
                      <TableCell className="font-medium">
                        {favorite.production.title}
                      </TableCell>
                      <TableCell>{favorite.production.year}</TableCell>
                      <TableCell>{favorite.production.type}</TableCell>
                      <TableCell>
                        {favorite.production.publisher || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          ))
        )}
        {!isLoading && !isError && groups.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum favorito encontrado.
          </div>
        )}
        {isLoading && (
          <div className="p-8 text-center text-muted-foreground">
            Carregando favoritos...
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((value) => value - 1)}
            disabled={page === 1}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Página {meta.current_page} de {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((value) => value + 1)}
            disabled={page === meta.last_page}
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
