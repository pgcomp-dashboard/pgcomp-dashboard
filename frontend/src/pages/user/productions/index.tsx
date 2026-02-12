"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UploadXMLForm from "@/components/UploadXMLForm";
import useAuth from "@/hooks/auth";
import { transformFilters } from "@/lib/utils";
import { productionService } from "@/services/modules/production.service";
import { professorService } from "@/services/modules/professor.service";
import { publisherService } from "@/services/modules/publisher.service";
import { qualisService } from "@/services/modules/qualis.service";
import { Production, Publisher, StratumQualis } from "@/types/academic";
import { extractDoiCode, normalizeDoi } from "@/utils/doi";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  SquarePenIcon,
  Trash,
  X
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

interface RequestBodyType {
  title: string;
  year: number;
  publisher_type: string | null;
  publisher_id: number | null;
  stratum_qualis_id: number | null;
  doi: string | null;
}

interface CreateRequestBodyType {
  title: string;
  year: number;
  publisher_type: string | null;
  publisher_id: number | null;
  doi: string | null;
}

type FormType = "none" | "xml" | "doi" | "other";

const updateProductionFormSchema = z.object({
  title: z.string().min(1, "Campo obrigatório"),
  year: z.coerce.number().min(1900, "Ano inválido"),
  doi: z.string().optional(),
});

const createProductionFormSchema = z.object({
  title: z.string().min(1, "Campo obrigatório"),
  year: z.coerce.number().min(1900, "Ano inválido"),
  doi: z.string().optional(),
});

export default function ProductionsPage() {
  const queryClient = useQueryClient();
  const date = new Date();
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramProfessorId = searchParams.get("professorId");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production>();
  const [chosenForm, setChosenForm] = useState<FormType>("none");
  const [showFilters, setShowFilters] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Edit Publisher States
  const [editPublisher, setEditPublisher] = useState<Publisher | null>(null);
  const [editPublisherType, setEditPublisherType] = useState("conference");
  const [editPublisherSearch, setEditPublisherSearch] = useState("");
  const [isEditSearching, setIsEditSearching] = useState(false);
  const [editSearchResults, setEditSearchResults] = useState<Publisher[]>([]);
  const [showEditResults, setShowEditResults] = useState(false);
  const isEditSelectedRef = useRef(false);

  // Filtros
  const [filters, setFilters] = useState({
    titulo: "",
    local: "",
    anoInicio: (date.getFullYear() - 4).toString(),
    anoFim: (date.getFullYear() - 1).toString(),
    tipo: "all",
    origem: "all",
    qualis: "all",
  });

  // Ordenação
  const [sortConfig, setSortConfig] = useState<{
    key: "titulo" | "local" | "year" | "tipo" | "origem" | "pontuacao";
    direction: "asc" | "desc";
  }>({ key: "year", direction: "desc" });

  // Debounced search logic for Edit
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (editPublisherSearch.length >= 2 && !isEditSelectedRef.current) {
        setIsEditSearching(true);
        try {
          const filters = transformFilters([
            { field: "name", value: editPublisherSearch, operator: "like" },
            { field: "publisher_type", value: editPublisherType, operator: "=" },
          ]);

          const response = await publisherService.getAllPublishers(
            1,
            20,
            filters,
          );
          setEditSearchResults(response.data);
          setShowEditResults(true);
        } catch (err) {
          console.error("Erro ao buscar veículos:", err);
        } finally {
          setIsEditSearching(false);
        }
      } else {
        setEditSearchResults([]);
        setShowEditResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [editPublisherSearch, editPublisherType]);

  // Admin states
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>(
    paramProfessorId || "own",
  );

  const { data: qualisData } = useQuery({
    queryKey: ["qualis"],
    queryFn: () => qualisService.getAllQualis(),
  });

  const qualisList = useMemo(() => qualisData || [], [qualisData]);

  const { data: professorsData } = useQuery({
    queryKey: ["professors"],
    queryFn: () => professorService.fetchProfessors(),
    enabled: !!auth?.isAdmin,
  });

  const professorsList = useMemo(() => professorsData || [], [professorsData]);

  const { data, isLoading, error } = useQuery<Production[], Error>({
    queryKey: ["productions", selectedProfessorId],
    queryFn: () => {
      if (
        auth?.isAdmin &&
        selectedProfessorId &&
        selectedProfessorId !== "own"
      ) {
        return productionService.getUserProductions(
          Number(selectedProfessorId),
        );
      }
      return productionService.getProductions();
    },
  });

  const qualisMap = useMemo(() => {
    const map = new Map<number, StratumQualis>();
    qualisList.forEach((q) => map.set(q.id, q));
    return map;
  }, [qualisList]);

  // Transform raw query data into sorted list
  const baseProductions = useMemo(() => {
    if (!data) return [];
    const entries = Object.entries(data)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([, value]) => value as unknown as Production);

    return [...entries].sort((a, b) => b.year - a.year);
  }, [data]);

  // Standard score calculation (last 4 years rule)
  const totalScore = useMemo(() => {
    if (qualisList.length === 0) return 0;
    const currentYear = date.getFullYear();
    const validList = baseProductions.filter((item) => {
      return (
        item.year >= currentYear - 4 &&
        item.year <= currentYear - 1
      );
    });

    return validList.reduce((accumulator, production) => {
      const qId = production.publisher?.stratum_qualis?.id;
      if (qId) {
        const qualis = qualisMap.get(qId);
        return accumulator + (qualis ? qualis.score : 0);
      }
      return accumulator;
    }, 0);
  }, [baseProductions, qualisMap, date]);

  // Lógica de filtro e ordenação
  const filteredAndSortedProductions = useMemo(() => {
    let result = [...baseProductions];

    // Aplicar filtros
    if (filters.titulo && filters.titulo.trim() !== "") {
      const searchTerm = filters.titulo.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(searchTerm));
    }
    if (filters.local && filters.local.trim() !== "") {
      const searchTerm = filters.local.toLowerCase();
      result = result.filter((p) => {
        const publisherName = p.publisher?.name || "";
        return publisherName.toLowerCase().includes(searchTerm);
      });
    }
    if (filters.anoInicio && filters.anoInicio !== "all") {
      result = result.filter((p) => p.year >= parseInt(filters.anoInicio));
    }
    if (filters.anoFim && filters.anoFim !== "all") {
      result = result.filter((p) => p.year <= parseInt(filters.anoFim));
    }
    if (filters.tipo && filters.tipo !== "all") {
      result = result.filter((p) => p.publisher_type === filters.tipo);
    }
    if (filters.origem && filters.origem !== "all") {
      result = result.filter((p) => p.source === filters.origem);
    }
    if (filters.qualis && filters.qualis !== "all") {
      result = result.filter((p) => {
        const qualis = qualisList.find(
          (q) => q.id === p.publisher?.stratum_qualis?.id,
        );
        return qualis?.code === filters.qualis;
      });
    }

    // Aplicar ordenação
    result.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortConfig.key) {
        case "titulo":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "local":
          aValue = (a.publisher?.name || "").toLowerCase();
          bValue = (b.publisher?.name || "").toLowerCase();
          break;
        case "year":
          aValue = a.year;
          bValue = b.year;
          break;
        case "tipo":
          aValue = a.publisher_type || "";
          bValue = b.publisher_type || "";
          break;
        case "origem":
          aValue = a.source || "";
          bValue = b.source || "";
          break;
        case "pontuacao":
          aValue =
            qualisList.find((q) => q.id === a.publisher?.stratum_qualis?.id)
              ?.score || 0;
          bValue =
            qualisList.find((q) => q.id === b.publisher?.stratum_qualis?.id)
              ?.score || 0;
          break;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [baseProductions, qualisList, filters, sortConfig]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "titulo" || key === "local") {
      return value.trim() !== "";
    }
    return value !== "all";
  });

  const clearFilters = () => {
    setFilters({
      titulo: "",
      local: "",
      anoInicio: "all",
      anoFim: "all",
      tipo: "all",
      origem: "all",
      qualis: "all",
    });
  };

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ column }: { column: typeof sortConfig.key }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // Anos únicos para o filtro
  const uniqueYears = useMemo(() => {
    const years = new Set(baseProductions.map((p) => p.year));
    // Ensure the default range years are available in the dropdown
    const currentYear = date.getFullYear();
    for (let y = currentYear - 10; y <= currentYear; y++) {
      years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [baseProductions, date]);

  // Filtered score calculation
  const filteredScore = useMemo(() => {
    return filteredAndSortedProductions.reduce((accumulator, production) => {
      const qId = production.publisher?.stratum_qualis?.id;
      if (qId) {
        const qualis = qualisMap.get(qId);
        return accumulator + (qualis ? qualis.score : 0);
      }
      return accumulator;
    }, 0);
  }, [filteredAndSortedProductions, qualisMap]);

  async function onSubmit(values: z.infer<typeof updateProductionFormSchema>) {
    //console.log("Submitting")
    //console.log(JSON.stringify(values))
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) {
      console.error("Ano Inválido");
      return;
    }

    const payload: RequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: editPublisher?.publisher_type || null,
      publisher_id: editPublisher?.id || null,
      stratum_qualis_id: editPublisher?.stratum_qualis_id || null,
      doi: values.doi ?? null,
    };
    //console.log(payload)
    try {
      if (selectedProduction) {
        // Normalize DOI if present
        payload.doi = normalizeDoi(values.doi);

        if (selectedProfessorId && selectedProfessorId !== "own") {
          await productionService.updateUserProduction(
            Number(selectedProfessorId),
            selectedProduction.id,
            payload,
          );
        } else {
          await productionService.updateProduction(
            selectedProduction.id,
            payload,
          );
        }

        toast.success("Atualizado com sucesso");
        setIsEditOpen(false);
        queryClient.invalidateQueries({
          queryKey: ["productions", selectedProfessorId],
        });
      }
    } catch (err) {
      console.error("Erro ao editar publicação:", err);
    }
  }

  async function deleteProduction(id: number) {
    if (!selectedProduction) return;
    try {
      const response =
        selectedProfessorId && selectedProfessorId !== "own"
          ? await productionService.deleteUserProduction(
            Number(selectedProfessorId),
            id,
          )
          : await productionService.deleteProduction(id);

      if (response.status == "200" || (response as any).status == 200) {
        toast.success("Produção deletada com sucesso.");
        queryClient.invalidateQueries({ queryKey: ["productions", selectedProfessorId] });
      }
    } catch (err) {
      console.error("Erro ao deletar a produção:", err);
      toast.error("Erro ao deletar a produção.");
    }
  }

  async function fullDelete() {
    try {
      const response =
        selectedProfessorId && selectedProfessorId !== "own"
          ? await productionService.clearUserProductions(
            Number(selectedProfessorId),
          )
          : await productionService.clearProductions();

      console.log(response);
      if (response.status == "200" || (response as any).status == 200) {
        toast.success("Produções deletadas com sucesso.");
        queryClient.invalidateQueries({ queryKey: ["productions", selectedProfessorId] });
      }
    } catch (err) {
      toast.error("Erro ao deletar produções.");
    }
  }

  const form = useForm<z.infer<typeof updateProductionFormSchema>>({
    resolver: zodResolver(updateProductionFormSchema),
    defaultValues: {
      title: selectedProduction?.title,
      year: selectedProduction?.year,
      doi: selectedProduction?.doi || undefined,
    },
  });

  useEffect(() => {
    if (selectedProduction && isEditOpen) {
      form.reset({
        title: selectedProduction.title,
        year: selectedProduction.year,
        doi: selectedProduction.doi || "",
      });
      setEditPublisher(selectedProduction.publisher || null);
      setEditPublisherType(selectedProduction.publisher_type || "conference");
      setEditPublisherSearch(selectedProduction.publisher?.name || "");
      isEditSelectedRef.current = !!selectedProduction.publisher;
    }
  }, [selectedProduction, isEditOpen, form]);

  if (error) {
    console.error(error);
    return <div>Erro ao carregar produções!</div>;
  }

  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell className="px-2 py-3"><Skeleton className="h-4 w-[90%]" /></TableCell>
          <TableCell className="px-2 py-3"><Skeleton className="h-4 w-[70%] mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
          <TableCell className="px-1 py-3"><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  const CardSkeleton = () => (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden mb-3">
      <div className="p-3 bg-muted/30 border-b">
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="p-3 space-y-4">
        <div>
          <Skeleton className="h-3 w-10 mb-1" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-8 mb-1" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Produções
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize, crie e edite produções.
          </p>
        </div>

        {/* Admin Professor Selection */}
        {auth?.isAdmin && (
          <div className="w-full max-w-md mx-auto mb-4">
            <Label className="text-sm font-medium mb-1.5 block">
              Visualizar produções de:
            </Label>
            <Select
              value={selectedProfessorId}
              onValueChange={(value) => {
                startTransition(() => {
                  setSelectedProfessorId(value);
                  if (value === "own") {
                    searchParams.delete("professorId");
                    setSearchParams(searchParams);
                  } else {
                    setSearchParams({ professorId: value });
                  }
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um docente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="own">Minhas Produções</SelectItem>
                {professorsList.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id.toString()}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Score e Ações */}
        <div className="w-full space-y-3">
          {/* Pontuação */}
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-medium">Pontuação total:</span>
              {(isLoading || isPending) ? (
                <Skeleton className="h-6 w-12 bg-primary/20" />
              ) : (
                  <span className="text-lg font-bold text-primary">
                    {totalScore}
                  </span>
              )}
            </div>

            {hasActiveFilters && !isLoading && !isPending && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-medium border border-amber-500/20">
                <Filter className="h-3 w-3" />
                <span>Pontuação filtrada: <strong>{filteredScore}</strong></span>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col gap-2">
            {chosenForm !== "none" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChosenForm("none")}
                className="self-start text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar para lista
              </Button>
            )}

            {chosenForm === "none" && (
              <>
                <Label className="text-sm font-medium">
                  Adicionar Produção
                </Label>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setChosenForm("xml")}
                    className="h-10"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    XML
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setChosenForm("doi")}
                    className="h-10"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    DOI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setChosenForm("other")}
                    className="h-10"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Manual
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash className="mr-1.5 h-4 w-4" />
                        Limpar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogPortal>
                      <AlertDialogOverlay />
                      <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso vai
                          permanentemente deletar todas as produções.
                        </AlertDialogDescription>
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                          <AlertDialogCancel asChild>
                            <Button variant="outline">Cancelar</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => fullDelete()}
                            >
                              Sim, deletar todas
                            </Button>
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialogPortal>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      {chosenForm === "none" && (
        <div className="w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-3 w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {Object.values(filters).filter((f) => f !== "all").length}
              </span>
            )}
          </Button>

          {showFilters && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* Título */}
                <div>
                  <Label className="text-xs mb-1.5 block">Título</Label>
                  <Input
                    type="text"
                    placeholder="Filtrar título..."
                    value={filters.titulo}
                    onChange={(e) =>
                      setFilters({ ...filters, titulo: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                {/* Local */}
                <div>
                  <Label className="text-xs mb-1.5 block">Local</Label>
                  <Input
                    type="text"
                    placeholder="Filtrar local..."
                    value={filters.local}
                    onChange={(e) =>
                      setFilters({ ...filters, local: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                {/* Ano - Intervalo */}
                <div className="lg:col-span-2">
                  <Label className="text-xs mb-1.5 block">Período (Ano)</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={filters.anoInicio}
                      onValueChange={(value) =>
                        setFilters({ ...filters, anoInicio: value })
                      }
                    >
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue placeholder="De" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">até</span>
                    <Select
                      value={filters.anoFim}
                      onValueChange={(value) =>
                        setFilters({ ...filters, anoFim: value })
                      }
                    >
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue placeholder="Até" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <Label className="text-xs mb-1.5 block">Tipo</Label>
                  <Select
                    value={filters.tipo}
                    onValueChange={(value) =>
                      setFilters({ ...filters, tipo: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="journal">Revista</SelectItem>
                      <SelectItem value="conference">Conferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Origem */}
                <div>
                  <Label className="text-xs mb-1.5 block">Origem</Label>
                  <Select
                    value={filters.origem}
                    onValueChange={(value) =>
                      setFilters({ ...filters, origem: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="lattes">Lattes</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="doi">DOI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Qualis */}
                <div>
                  <Label className="text-xs mb-1.5 block">Qualis</Label>
                  <Select
                    value={filters.qualis}
                    onValueChange={(value) =>
                      setFilters({ ...filters, qualis: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="B3">B3</SelectItem>
                      <SelectItem value="B4">B4</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    {filteredAndSortedProductions.length} resultado(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Ordenação Mobile */}
          <div className="md:hidden mt-3">
            <Label className="text-xs mb-1.5 block">Ordenar por</Label>
            <div className="flex gap-2">
              <Select
                value={sortConfig.key}
                onValueChange={(value) =>
                  setSortConfig((prev) => ({
                    ...prev,
                    key: value as typeof sortConfig.key,
                  }))
                }
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="titulo">Título</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                  <SelectItem value="tipo">Tipo</SelectItem>
                  <SelectItem value="origem">Origem</SelectItem>
                  <SelectItem value="pontuacao">Pontuação</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setSortConfig((prev) => ({
                    ...prev,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                  }))
                }
              >
                {sortConfig.direction === "asc" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Filtros de texto mobile */}
          <div className="md:hidden mt-3 space-y-2">
            <div>
              <Label className="text-xs mb-1 block">Título</Label>
              <Input
                type="text"
                placeholder="Filtrar por título..."
                value={filters.titulo}
                onChange={(e) =>
                  setFilters({ ...filters, titulo: e.target.value })
                }
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Local</Label>
              <Input
                type="text"
                placeholder="Filtrar por local..."
                value={filters.local}
                onChange={(e) =>
                  setFilters({ ...filters, local: e.target.value })
                }
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Período (Ano)</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={filters.anoInicio}
                  onValueChange={(value) =>
                    setFilters({ ...filters, anoInicio: value })
                  }
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="De" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">até</span>
                <Select
                  value={filters.anoFim}
                  onValueChange={(value) =>
                    setFilters({ ...filters, anoFim: value })
                  }
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="Até" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      {chosenForm === "none" ? (
        <>
          {/* Desktop: Tabela */}
          <div className="hidden w-full md:block rounded-md border max-h-[calc(100vh-350px)] overflow-y-auto">
            <Table className="table-fixed w-full">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[25%] text-left px-2 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort("titulo")}
                    >
                      Título
                      <SortIcon column="titulo" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[20%] text-center px-2 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold justify-center"
                      onClick={() => handleSort("local")}
                    >
                      Local
                      <SortIcon column="local" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[8%] text-center px-1 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort("year")}
                    >
                      Ano
                      <SortIcon column="year" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[10%] text-center px-1 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort("tipo")}
                    >
                      Tipo
                      <SortIcon column="tipo" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[10%] text-center px-1 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort("origem")}
                    >
                      Origem
                      <SortIcon column="origem" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[8%] text-center px-1 py-2">
                    <span className="text-xs font-semibold">Qualis</span>
                  </TableHead>
                  <TableHead className="w-[8%] text-center px-1 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs font-semibold"
                      onClick={() => handleSort("pontuacao")}
                    >
                      Pts
                      <SortIcon column="pontuacao" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[11%] text-center px-1 py-2">
                    <span className="text-xs font-semibold">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : filteredAndSortedProductions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {hasActiveFilters
                        ? "Nenhuma produção encontrada com os filtros aplicados"
                        : "Não foram encontradas produções cadastradas para o usuário"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedProductions.map((production) => (
                    <TableRow key={production.id}>
                      <TableCell className="text-left px-2 py-2 align-top">
                        <Link
                          to={production.doi || production.home_page || "#"}
                          target={
                            production.doi || production.home_page
                              ? "_blank"
                              : ""
                          }
                          rel={
                            production.doi || production.home_page
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          <div
                            className="text-sm leading-snug whitespace-normal wrap-break-word text-justify"
                            title={production.title}
                          >
                            {production.title}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-center px-2 py-2 align-top">
                        <div
                          className="text-sm leading-snug whitespace-normal wrap-break-word capitalize"
                          title={production.publisher?.name || "--"}
                        >
                          {production.publisher?.name.toLowerCase() || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm">
                        {production.year}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm">
                        {production.publisher_type === "journal"
                          ? "Revista"
                          : production.publisher_type === "conference"
                            ? "Conferência"
                            : "NI"}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm capitalize">
                        {production.source === "xml" ||
                        production.source === "lattes"
                          ? "Lattes"
                          : production.source === "manual"
                            ? "Manual"
                            : production.source === "doi"
                              ? "DOI"
                              : "NI"}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm">
                        {production.publisher?.stratum_qualis?.id &&
                          qualisList.find(
                            (qualis) =>
                              qualis.id ==
                              production.publisher?.stratum_qualis?.id,
                          )?.code}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 text-sm">
                        {production.publisher?.stratum_qualis?.id &&
                          qualisList.find(
                            (qualis) =>
                              qualis.id ==
                              production.publisher?.stratum_qualis?.id,
                          )?.score}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduction(production);
                            setIsEditOpen(true);
                          }}
                          title="Editar"
                        >
                          <SquarePenIcon className="h-5 w-5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedProduction(production);
                              }}
                              title="Deletar"
                            >
                              <Trash className="text-red-500 h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogPortal>
                            <AlertDialogOverlay />
                            <AlertDialogContent>
                              <AlertDialogTitle>
                                Você tem certeza?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso vai
                                permanentemente deletar a produção{" "}
                                {selectedProduction?.title}.
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-4">
                                <AlertDialogCancel asChild>
                                  <Button
                                    className="bg-white text-black"
                                    onClick={() => {
                                      setSelectedProduction(undefined);
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button
                                    className="bg-red-400 hover:bg-red-500"
                                    onClick={() => {
                                      if (selectedProduction)
                                        deleteProduction(selectedProduction.id);
                                    }}
                                  >
                                    Sim, deletar produção
                                  </Button>
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialogPortal>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden flex flex-col gap-3 w-full">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : filteredAndSortedProductions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-lg">
                {hasActiveFilters
                  ? "Nenhuma produção encontrada com os filtros aplicados"
                  : "Não foram encontradas produções cadastradas para o usuário"}
              </div>
            ) : (
              filteredAndSortedProductions.map((production) => {
                const qualis = qualisList.find(
                  (q) => q.id === production.publisher?.stratum_qualis?.id,
                );
                return (
                  <div
                    key={production.id}
                    className="rounded-lg border bg-card shadow-sm overflow-hidden"
                  >
                    {/* Header do Card */}
                    <div className="p-3 bg-muted/30 border-b">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2">
                        {production.title}
                      </h3>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-3">
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground block">
                          Local
                        </span>
                        <span className="font-medium text-sm capitalize">
                          {production.publisher?.name.toLowerCase() || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Ano
                          </span>
                          <span className="font-medium">{production.year}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Tipo
                          </span>
                          <span className="font-medium">
                            {production.publisher_type === "journal"
                              ? "Revista"
                              : production.publisher_type === "conference"
                                ? "Conferência"
                                : "NI"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Origem
                          </span>
                          <span className="font-medium capitalize">
                            {production.source || "NI"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Qualis / Pontos
                          </span>
                          <span className="font-medium">
                            {qualis ? `${qualis.code} / ${qualis.score}` : "NI"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ações do Card */}
                    <div className="flex border-t">
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-none h-11 text-sm"
                        onClick={() => {
                          setSelectedProduction(production);
                          setIsEditOpen(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <div className="w-px bg-border" />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex-1 rounded-none h-11 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedProduction(production);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogPortal>
                          <AlertDialogOverlay />
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg mx-auto">
                            <AlertDialogTitle>
                              Você tem certeza?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Essa ação não pode ser desfeita. Isso vai
                              permanentemente deletar a produção.
                            </AlertDialogDescription>
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                              <AlertDialogCancel asChild>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setSelectedProduction(undefined)
                                  }
                                >
                                  Cancelar
                                </Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => {
                                    if (selectedProduction)
                                      deleteProduction(selectedProduction.id);
                                  }}
                                >
                                  Deletar
                                </Button>
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialogPortal>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : chosenForm === "xml" ? (
          <UploadXMLForm
            professorId={
              selectedProfessorId === "own" ? undefined : selectedProfessorId
            }
            onSuccess={() => {
              setChosenForm("none");
              queryClient.invalidateQueries({
                queryKey: ["productions", selectedProfessorId],
              });
            }}
          />
      ) : chosenForm === "doi" ? (
            <ProductionDOIForm
              professorId={
                selectedProfessorId === "own" ? undefined : selectedProfessorId
              }
              onSuccess={() => setChosenForm("none")}
            />
      ) : (
              <ProductionCreateForm
                professorId={
                  selectedProfessorId === "own" ? undefined : selectedProfessorId
                }
                onSuccess={() => setChosenForm("none")}
              />
      )}

      {/* Dialog - Formulário de edição da produção */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edite as informações da sua publicação</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {/* Formulário aqui */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Produção:</FormLabel>
                      <FormDescription>
                        {selectedProduction?.title}
                      </FormDescription>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormDescription>
                        {selectedProduction?.year || "N/A"}
                      </FormDescription>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>D.O.I:</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Busca de Publisher para Edição */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg relative">
                  <Label className="text-sm">Tipo de Veículo</Label>
                  <RadioGroup
                    className="flex gap-4 mb-2"
                    value={editPublisherType}
                    onValueChange={(value) => {
                      setEditPublisherType(value);
                      setEditPublisher(null);
                      setEditSearchResults([]);
                      setEditPublisherSearch("");
                      isEditSelectedRef.current = false;
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conference" id="edit-conference" />
                      <Label htmlFor="edit-conference" className="font-normal cursor-pointer">Conferência</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="journal" id="edit-journal" />
                      <Label htmlFor="edit-journal" className="font-normal cursor-pointer">Revista</Label>
                    </div>
                  </RadioGroup>

                  <Label className="text-sm">
                    Buscar{" "}
                    {editPublisherType === "journal" ? "Periódico" : "Conferência"}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                      {isEditSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </div>
                    <Input
                      placeholder={
                        editPublisherType === "journal"
                          ? "Buscar por nome ou ISSN..."
                          : "Buscar por nome ou sigla..."
                      }
                      type="text"
                      value={editPublisherSearch}
                      onChange={(e) => {
                        isEditSelectedRef.current = false;
                        setEditPublisherSearch(e.target.value);
                        setEditPublisher(null);
                      }}
                      className="pl-9 h-10"
                    />

                    {showEditResults && editSearchResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                        {editSearchResults.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b last:border-0 transition-colors"
                            onClick={() => {
                              setEditPublisher(p);
                              isEditSelectedRef.current = true;
                              setEditPublisherSearch(p.name);
                              setShowEditResults(false);
                            }}
                          >
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground flex justify-between">
                              <span>
                                {p.publisher_type === "journal"
                                  ? `ISSN: ${p.issn || "N/A"}`
                                  : `Sigla: ${p.initials || "N/A"}`}
                              </span>
                              <span className="font-semibold text-primary">
                                Qualis: {p.stratum_qualis?.code || "N/A"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {editPublisher && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-green-800">{editPublisher.name}</p>
                          <p className="text-xs text-green-700">
                            {editPublisher.publisher_type === "journal"
                              ? `ISSN: ${editPublisher.issn || "N/A"}`
                              : `Sigla: ${editPublisher.initials || "N/A"}`}
                          </p>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold">
                          Qualis: {editPublisher.stratum_qualis?.code || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setIsEditOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-green-700 hover:bg-green-800"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductionDOIForm({
  professorId,
  onSuccess,
}: {
  professorId?: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [doi, setDoi] = useState<string>("");
  const [publisherType, setPublisherType] = useState("conference");
  const [isLoading, setIsLoading] = useState(false);

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    setDoi(e.target.value);
  }

  function handleValueChange(value: string) {
    setPublisherType(value);
  }

  async function createProduction() {
    if (!doi) return;

    setIsLoading(true);
    const request = {
      type: publisherType,
      doi: extractDoiCode(doi),
    };

    try {
      if (professorId) {
        await productionService.createProfessorProductionFromDoi(
          Number(professorId),
          request,
        );
      } else {
        await productionService.createProductionFromDoi(request);
      }

      toast.success("Criado com sucesso");
      setDoi("");
      queryClient.invalidateQueries({
        queryKey: ["productions", professorId || "own"],
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Erro ao criar produção");
      console.error("Erro ao criar produção:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col w-full max-w-md gap-4 items-center">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            Adicionar com DOI
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Importe a produção pelo identificador DOI
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Tipo de publicação</Label>
            <RadioGroup
              className="flex gap-4"
              defaultValue="conference"
              onValueChange={handleValueChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conference" id="doi-conference" />
                <Label
                  htmlFor="doi-conference"
                  className="font-normal cursor-pointer"
                >
                  Conferência
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="journal" id="doi-journal" />
                <Label
                  htmlFor="doi-journal"
                  className="font-normal cursor-pointer"
                >
                  Revista
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">DOI</Label>
            <Input
              placeholder="Ex: 10.1000/xyz123"
              type="text"
              value={doi}
              onChange={handleInput}
            />
          </div>

          <Button
            onClick={createProduction}
            disabled={!doi || isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Importando..." : "Importar produção"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductionCreateForm({
  professorId,
  onSuccess,
}: {
  professorId?: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [publisherType, setPublisherType] = useState("conference");
  const [publisherSearch, setPublisherSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Publisher[]>([]);
  const [showResults, setShowResults] = useState(false);
  const isSelectedRef = useRef(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (publisherSearch.length >= 2 && !isSelectedRef.current) {
        setIsSearching(true);
        try {
          const filters = transformFilters([
            { field: "name", value: publisherSearch, operator: "like" },
            { field: "publisher_type", value: publisherType, operator: "=" },
          ]);

          const response = await publisherService.getAllPublishers(
            1,
            20,
            filters,
          );
          setSearchResults(response.data);
          setShowResults(true);
        } catch (err) {
          console.error("Erro ao buscar veículos:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [publisherSearch, publisherType]);

  const form = useForm<z.infer<typeof createProductionFormSchema>>({
    resolver: zodResolver(createProductionFormSchema),
    defaultValues: {
      title: "",
      year: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof createProductionFormSchema>) {
    const parsedYear = parseFloat(values.year.toString());
    if (isNaN(parsedYear)) {
      console.error("Ano Inválido");
      return;
    }

    const payload: CreateRequestBodyType = {
      title: values.title,
      year: parsedYear,
      publisher_type: publisher?.publisher_type || null,
      publisher_id: publisher?.id || null,
      doi: normalizeDoi(values.doi),
    };

    try {
      if (professorId) {
        await productionService.createUserProduction(
          Number(professorId),
          payload,
        );
      } else {
        await productionService.createProduction(payload);
      }
      toast.success("Produção Criada com sucesso");
      queryClient.invalidateQueries({
        queryKey: ["productions", professorId || "own"],
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Erro ao criar Produção");
      console.error("Erro ao criar produção:", err);
    }
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    isSelectedRef.current = false;
    setPublisherSearch(e.target.value);
    setPublisher(null);
  }

  function handleValueChange(value: string) {
    setPublisherType(value);
    setPublisher(null);
    setSearchResults([]);
    setPublisherSearch("");
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col gap-4 w-full max-lg:max-w-lg">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            Adicionar manualmente
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados da produção
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Tipo de publicação</Label>
          <RadioGroup
            className="flex gap-4"
            defaultValue="conference"
            onValueChange={handleValueChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="conference" id="manual-conference" />
              <Label
                htmlFor="manual-conference"
                className="font-normal cursor-pointer"
              >
                Conferência
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="journal" id="manual-journal" />
              <Label
                htmlFor="manual-journal"
                className="font-normal cursor-pointer"
              >
                Revista
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da produção</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Digite o título"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DOI (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ex: 10.1590/xyz or http://dx.doi.org/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 p-4 bg-muted/30 rounded-lg relative">
              <Label className="text-sm">
                Buscar{" "}
                {publisherType === "journal" ? "Periódico" : "Conferência"}
              </Label>
              <div className="relative">
                <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </div>
                <Input
                  placeholder={
                    publisherType === "journal"
                      ? "Buscar pelo nome ou ISSN..."
                      : "Buscar pelo nome ou sigla (ex: SBBD)..."
                  }
                  type="text"
                  value={publisherSearch}
                  onChange={handleInput}
                  className="pl-9 h-10"
                />

                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b last:border-0 transition-colors"
                        onClick={() => {
                          setPublisher(p);
                          isSelectedRef.current = true;
                          setPublisherSearch(p.name);
                          setShowResults(false);
                        }}
                      >
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>
                            {p.publisher_type === "journal"
                              ? `ISSN: ${p.issn || "N/A"}`
                              : `Sigla: ${p.initials || "N/A"}`}
                          </span>
                          <span className="font-semibold text-primary">
                            Qualis: {p.stratum_qualis?.code || "N/A"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {publisher && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-green-800">
                        {publisher.name}
                      </p>
                      <p className="text-xs text-green-700">
                        {publisher.publisher_type === "journal"
                          ? `ISSN: ${publisher.issn || "N/A"}`
                          : `Sigla: ${publisher.initials || "N/A"}`}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                      Qualis: {publisher.stratum_qualis?.code || "N/A"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full">
              Criar Produção
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
