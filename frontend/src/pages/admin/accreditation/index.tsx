"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AccreditationTable } from "@/features/accreditation/components/AccreditationTable";
import { useAccreditation } from "@/features/accreditation/hooks/useAccreditation";
import { cn } from "@/lib/utils";
import { EyeOff, Loader2, RotateCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function CredenciamentoPage() {
  const {
    ranking,
    isLoading,
    isFetching,
    error,
    refetch,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    categoryFilter,
    setCategoryFilter,
    years,
  } = useAccreditation();

  const [blurNames, setBlurNames] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin mr-2" /> Carregando ranking de
        credenciamento...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex items-center justify-center p-10">
        Erro ao carregar ranking. Por favor, tente novamente mais tarde.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Credenciamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Ranking de docentes de acordo com a{" "}
            <Link
              to="https://pgcomp.ufba.br/sites/pgcomp.ufba.br/files/2022_resolucao_05_-_credenciamento_de_docentes.pdf"
              target="_blank"
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors italic"
            >
              Resolução PGCOMP de Credenciamento
            </Link>{" "}
            vigente.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 items-end bg-muted/40 p-4 rounded-lg border">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="start-year"
            className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
          >
            Ano Início
          </Label>
          <Select
            value={startYear.toString()}
            onValueChange={(value) => {
              const newStart = parseInt(value);
              setStartYear(newStart);
              if (newStart > endYear) setEndYear(newStart);
            }}
          >
            <SelectTrigger id="start-year" className="w-32 bg-background">
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
          <Label
            htmlFor="end-year"
            className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
          >
            Ano Fim
          </Label>
          <Select
            value={endYear.toString()}
            onValueChange={(value) => {
              const newEnd = parseInt(value);
              setEndYear(newEnd);
              if (newEnd < startYear) setStartYear(newEnd);
            }}
          >
            <SelectTrigger id="end-year" className="w-32 bg-background">
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
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Categoria
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="permanente">Permanente</SelectItem>
              <SelectItem value="colaborador">Colaborador</SelectItem>
              <SelectItem value="visitante">Visitante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-background">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            <Label
              htmlFor="blur-names"
              className="text-xs uppercase tracking-wider text-muted-foreground font-semibold cursor-pointer"
            >
              Ocultar nomes
            </Label>
            <Switch
              id="blur-names"
              checked={blurNames}
              onCheckedChange={setBlurNames}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar ranking"
            className="bg-background hover:bg-muted"
          >
            <RotateCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>

          {isFetching && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Atualizando...
            </span>
          )}
        </div>
      </div>

      <AccreditationTable
        ranking={ranking}
        isLoading={isLoading}
        startYear={startYear}
        endYear={endYear}
        blurNames={blurNames}
      />
    </div>
  );
}
