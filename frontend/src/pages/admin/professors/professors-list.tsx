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
import { qualisService } from "@/services/modules/qualis.service";
import { StratumQualis } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { Professor } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import z from "zod";

const updateProfessorSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve conter pelo menos 3 caracteres")
    .optional(),
  siape: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  orcid: z.string().optional(),
  lattes_url: z.string().url("URL do Lattes inválida").optional(),
});

type UpdateProfessorForm = z.infer<typeof updateProfessorSchema>;

export default function ProfessorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailProfOpen, setIsDetailProfOpen] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(
    null,
  );
  const [, setQualisList] = useState<StratumQualis[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfessorForm>({
    resolver: zodResolver(updateProfessorSchema),
  });

  const { data, isLoading, error } = useQuery<
    PaginatedResponse<Professor>,
    Error
  >({
    queryKey: ["professors", currentPage, itemsPerPage, debouncedSearchTerm],
    queryFn: () =>
      professorService.fetchProfessors(currentPage, itemsPerPage, {
        name: debouncedSearchTerm || undefined,
      }),
    placeholderData: (prevData) => prevData,
  });

  useEffect(() => {
    if (currentProfessor) {
      reset({
        name: currentProfessor?.name,
        siape: currentProfessor?.siape?.toString(),
        email: currentProfessor?.email,
        lattes_url: currentProfessor?.lattes_url,
        orcid: "0000-0000-0000-0000",
      });
    }
  }, [currentProfessor, reset]);

  const onUpdateSubmit = async (data: UpdateProfessorForm) => {
    if (!currentProfessor) return;

    try {
      const { siape, ...rest } = data;
      await professorService.updateProfessor(currentProfessor.id, {
        siape: siape ? parseInt(siape) : undefined,
        ...rest,
      });
      await queryClient.invalidateQueries({ queryKey: ["professors"] });
      setIsEditing(false);
      setCurrentProfessor({ ...currentProfessor, ...data } as Professor);
    } catch (error) {
      toast.error("Erro ao atualizar docente. Por favor, tente novamente.");
    }
  };

  const professors = data?.data ?? [];
  const totalPages = Math.max(1, data?.meta?.last_page || 1);

  useEffect(() => {
    async function fetchQualis() {
      try {
        const qualis = await qualisService.getAllQualis();
        setQualisList(qualis);
      } catch (err) {
        console.error("Erro ao carregar Qualis:", err);
      }
    }
    fetchQualis();
  }, []);

  const handleNavigateToProductions = (professorId: number) => {
    navigate(`/admin/professors/${professorId}/productions`);
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) {
    console.error(error);
    return <div>Erro ao carregar professores!</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Docentes
        </h1>
        <p className="text-muted-foreground">
          Visualize e gerencie os docentes cadastrados no sistema.
        </p>
      </div>

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
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Label htmlFor="itemsPerPage" className="whitespace-nowrap">
            Itens por página:
          </Label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-md px-2 py-1 text-sm w-full sm:w-auto"
          >
            {[5, 10, 20, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
            {professors.map((professor) => (
              <TableRow key={professor.id}>
                <TableCell className="font-medium text-center">
                  {professor.name}
                </TableCell>
                <TableCell className="font-medium text-center">
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

        {/* Paginação Desktop */}
        <div className="flex items-center justify-between p-4">
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
              {"<<"}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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
              {">>"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile: Cards */}
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
        {/* Paginação Mobile */}
        <div className="flex flex-col gap-3 mt-4">
          <span className="text-sm text-muted-foreground text-center">
            Página {currentPage} de {totalPages}
          </span>
          <div className="grid grid-cols-2 gap-2">
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Próxima ›
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
          {currentProfessor &&
            (isEditing ? (
              <form
                id="edit-professor-form"
                onSubmit={handleSubmit(onUpdateSubmit)}
                className="grid gap-4 py-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <span className="text-xs text-red-500">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="siape">SIAPE</Label>
                  <Input id="siape" {...register("siape")} />
                  {errors.siape && (
                    <span className="text-xs text-red-500">
                      {errors.siape.message}
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" {...register("email")} />
                  {errors.email && (
                    <span className="text-xs text-red-500">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lattes_url">Lattes URL</Label>
                  <Input id="lattes_url" {...register("lattes_url")} />
                  {errors.lattes_url && (
                    <span className="text-xs text-red-500">
                      {errors.lattes_url.message}
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="orcid">ORCID (Opcional)</Label>
                  <Input
                    id="orcid"
                    {...register("orcid")}
                    placeholder="0000-0000-0000-0000"
                  />
                  {errors.orcid && (
                    <span className="text-xs text-red-500">
                      {errors.orcid.message}
                    </span>
                  )}
                </div>
                <DialogFooter>
                  <>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant={"ghost"}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Alterações</Button>
                  </>
                </DialogFooter>
              </form>
            ) : (
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
                <DialogFooter>
                  <Button onClick={() => setIsEditing(true)} variant={"ghost"}>
                    Editar
                  </Button>
                  <Button onClick={() => setIsDetailProfOpen(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}
