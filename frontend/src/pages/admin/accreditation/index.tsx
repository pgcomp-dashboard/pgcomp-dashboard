"use client";

import LattesIcon from "@/components/LattesIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { userService } from "@/services/modules/user.service";
import { Ranking, RankingProduction } from "@/types/academic";
import Switch from "@mui/material/Switch";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpenTextIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function CredenciamentoPage() {
  const date = new Date();

  //Ranking States
  const [isToggled, setIsToggled] = useState(false);
  const [startYear, setStartYear] = useState(date.getFullYear() - 5);
  const [endYear, setEndYear] = useState(date.getFullYear());

  //Production Details States
  const [isProductionsOpen, setIsProductionsOpen] = useState(false);
  const [currentProductionList, setCurrentProductionList] = useState<
    RankingProduction[] | null
  >(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleShowDetails = async (userId: number) => {
    setIsLoadingDetails(true);
    setIsProductionsOpen(true);
    try {
      const response = await userService.getAccreditationProductions(
        userId,
        startYear,
        endYear,
      );
      if (response) {
        setCurrentProductionList(response.productions);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da acreditação:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  const years = Array.from(
    { length: date.getFullYear() - 2000 + 1 },
    (_, i) => 2000 + i,
  ).reverse();

  const { data, isLoading, isFetching, error } = useQuery<Ranking[], Error>({
    queryKey: ["ranking", startYear, endYear],
    queryFn: () => userService.getAccreditationRanking(startYear, endYear),
    placeholderData: (prevData) => prevData,
  });

  const ranking = data ?? [];

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin mr-2" /> Carregando ranking de
        credenciamento...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 flex items-center p-10">
        <AlertCircle className="mr-2" /> Erro ao carregar ranking.
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Credenciamento
        </h1>
        <div className="flex flex-row gap-2 md:gap-4 items-center justify-end">
          <Label className="text-xs md:text-sm">Mostrar Todos</Label>
          <Switch
            checked={isToggled}
            onChange={handleToggle}
            size="medium"
            color="primary"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-lg border">
        <div className="flex flex-col gap-2">
          <Label htmlFor="start-year">Ano Início</Label>
          <Select
            value={startYear.toString()}
            onValueChange={(value) => {
              const newStart = parseInt(value);
              setStartYear(newStart);
              if (newStart > endYear) {
                setEndYear(newStart);
              }
            }}
          >
            <SelectTrigger id="start-year" className="w-30">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="end-year">Ano Fim</Label>
          <Select
            value={endYear.toString()}
            onValueChange={(value) => {
              const newEnd = parseInt(value);
              setEndYear(newEnd);
              if (newEnd < startYear) {
                setStartYear(newEnd);
              }
            }}
          >
            <SelectTrigger id="end-year" className="w-30">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      </div>

      <p className="text-sm sm:text-base text-muted-foreground">
        Visualize o ranking dos docentes com publicações cadastrados no sistema.
        Pela{" "}
        <Link
          to="https://pgcomp.ufba.br/sites/pgcomp.ufba.br/files/2022_resolucao_05_-_credenciamento_de_docentes.pdf"
          target="_blank"
          className="underline"
        >
          {" "}
          Resolução
        </Link>{" "}
        são considerados os últimos 4 anos completos.
      </p>
      <p className="text-sm sm:text-base text-muted-foreground">
        Para o calculo estão sendo considerados as produções de {startYear} até{" "}
        {endYear}
      </p>

      {/* Tabela - Desktop */}
      <div className="hidden md:block rounded-md border w-full">
        <Table>
          <ShowRanking
            rankerList={isToggled ? ranking : ranking.filter(rank => rank.category === "permanente")}
            onShowDetails={handleShowDetails}
          />
        </Table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        <ShowRankingCards
          rankerList={isToggled ? ranking : ranking.filter(rank => rank.category === "permanente")}
          onShowDetails={handleShowDetails}
        />
      </div>


      <Dialog open={isProductionsOpen} onOpenChange={setIsProductionsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Produções Consideradas</DialogTitle>
            <DialogDescription>
              Visualizar produções consideradas na pontuação. Caso queira mais
              detalhes sobre suas produções vá a aba Minhas Produções
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="animate-spin mr-2" /> Carregando detalhes...
              </div>
            ) : currentProductionList && currentProductionList.length > 0 ? (
              currentProductionList.map((production, index) => (
                <div
                  key={index}
                  className="rounded border bg-gray-100 p-4 text-sm flex flex-col gap-1"
                >
                  <p>
                    <strong>Título da Produção:</strong> {production.title}
                  </p>
                  <p>
                    <strong>Ano:</strong> {production.year}
                  </p>
                  <p>
                    <strong>Qualis:</strong>{" "}
                    {production.code ? production.code : "Não encontrado"}
                  </p>
                  <p>
                    <strong>Pontuação:</strong>{" "}
                    {production.score ? production.score : 0}
                  </p>
                  <p>
                    <strong>Tipo de Publicação:</strong>{" "}
                    {production.publisher_type
                      ? production.publisher_type
                      : "Não encontrado"}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center p-10 text-muted-foreground">
                Nenhuma produção encontrada para este período.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsProductionsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


type RankingTableProps = {
  rankerList: Ranking[];
  onShowDetails: (userId: number) => void;
};

function ShowRanking({ rankerList, onShowDetails }: RankingTableProps) {


  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Colocação</TableHead>
          <TableHead className="text-center">Nome</TableHead>
          <TableHead className="text-center">Categoria</TableHead>
          <TableHead className="text-center">Publicações</TableHead>
          <TableHead className="text-center">Pontuação</TableHead>
          <TableHead className="text-center">Lattes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankerList
          ? rankerList.map((rank, index) => (
              <TableRow
                className={
                  rank.total_score >= 250
                    ? "font-medium bg-green-100 hover:bg-green-200"
                    : "bg-red-50"
                }
                key={index}
              >
                <TableCell className="font-medium text-center">
                  {rank.total_score > 0 ? `${index + 1}º` : "--"}
                </TableCell>
                <TableCell className="font-medium text-center">
                  <Button
                    variant="ghost"
                    className="hover:bg-transparent"
                    onClick={() => onShowDetails(rank.user_id)}

                  >
                    {rank.name.replace(/ D([aeiou]s?) /g, " d$1 ")}
                  </Button>

                </TableCell>
                <TableCell className="font-medium text-center">
                  {rank.category ? rank.category.replace(/^./, (match) => match.toUpperCase()) : "Não encontrado"}
                </TableCell>
                <TableCell className="font-medium text-center">
                  <Button
                    variant="ghost"
                    className="hover:bg-transparent h-full"
                    onClick={() => onShowDetails(rank.user_id)}

                  >
                    {" "}
                    <BookOpenTextIcon className="size-6" />
                  </Button>

                </TableCell>
                <TableCell className="font-medium text-center">
                  {rank.total_score.toFixed(1)}
                </TableCell>
                <TableCell className="font-medium text-center">
                  <Link
                    to={rank.lattes_url}
                    target="_blank"
                    className="flex justify-center"
                  >
                    <LattesIcon />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          : null}
      </TableBody>
    </>
  );
}



// Componente de Cards para Mobile
function ShowRankingCards({ rankerList, onShowDetails }: RankingTableProps) {
  return (
    <>
      {rankerList.map((rank, index) => (
        <div
          key={index}
          className={`rounded-lg border p-4 ${
            rank.total_score >= 250 ? "bg-green-50 border-green-200" : ""
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">
                {index + 1}º
              </span>
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  className={`p-0 h-auto font-semibold text-left justify-start hover:underline ${
                    rank.total_score >= 250 ? "hover:bg-transparent" : ""
                  }`}
                  onClick={() => onShowDetails(rank.user_id)}

                >
                  {rank.name.replace(/ D([aeiou]s?) /g, " d$1 ")}
                </Button>

                <span className="text-sm text-muted-foreground capitalize">
                  {rank.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Pontuação</span>
              <span className="text-xl font-bold">
                {rank.total_score.toFixed(1)}
              </span>
            </div>
            <Link
              to={rank.lattes_url}
              target="_blank"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <LattesIcon className="h-4 w-4" />
              <span>Lattes</span>
            </Link>
          </div>
        </div>
      ))}
    </>
  );
}
