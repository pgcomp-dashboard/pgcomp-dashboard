"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Plus } from "lucide-react";

import { ProductionCreateForm } from "@/features/productions/components/forms/ProductionCreateForm";
import { ProductionDOIForm } from "@/features/productions/components/forms/ProductionDOIForm";
import {
  ClearProductionsDialog,
  ProductionDialogs,
} from "@/features/productions/components/ProductionDialogs";
import { ProductionFilters } from "@/features/productions/components/ProductionFilters";
import { ProductionHeader } from "@/features/productions/components/ProductionHeader";
import { ProductionTable } from "@/features/productions/components/ProductionTable";
import UploadXMLForm from "@/features/productions/components/UploadXMLForm";
import { useProductions } from "@/features/productions/hooks/useProductions";

export default function ProductionsPage() {
  const {
    auth,
    isLoading,
    isPending,
    totalScore,
    filteredScore,
    hasActiveFilters,
    filteredAndSortedProductions,
    filters,
    setFilters,
    sortConfig,
    handleSort,
    clearFilters,
    uniqueYears,
    showFilters,
    setShowFilters,
    chosenForm,
    setChosenForm,
    selectedProduction,
    setSelectedProduction,
    isEditOpen,
    setIsEditOpen,
    onEditSubmit,
    deleteProduction,
    fullDelete,
    selectedProfessorId,
    handleProfessorChange,
    professorsList,
    qualisList,
    editForm,
    editState,
  } = useProductions();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 py-8">
      <ProductionHeader
        isAdmin={auth?.isAdmin}
        totalScore={totalScore}
        filteredScore={filteredScore}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
        isPending={isPending}
        selectedProfessorId={selectedProfessorId}
        onProfessorChange={handleProfessorChange}
        professorsList={professorsList}
      />

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            {chosenForm !== "none" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChosenForm("none")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h2 className="text-xl font-semibold">
              {chosenForm === "xml"
                ? "Importar XML"
                : chosenForm === "doi"
                  ? "Adicionar via DOI"
                  : chosenForm === "other"
                    ? "Adicionar Manualmente"
                    : "Produções"}
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {chosenForm === "none" && (
              <>
                <ClearProductionsDialog onConfirm={fullDelete} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-10 bg-primary hover:bg-primary/90">
                      <Plus className="mr-1.5 h-4 w-4" /> Adicionar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setChosenForm("xml")}>
                      Importar XML Lattes
                    </DropdownMenuItem>
                    {auth?.isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => setChosenForm("doi")}>
                          Adicionar via DOI
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setChosenForm("other")}
                        >
                          Adicionar Manualmente
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {chosenForm === "none" ? (
          <div className="space-y-4">
            <ProductionFilters
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              uniqueYears={uniqueYears}
              qualisList={qualisList}
            />

            <ProductionTable
              isLoading={isLoading}
              hasActiveFilters={hasActiveFilters}
              productions={filteredAndSortedProductions}
              sortConfig={sortConfig}
              onSort={handleSort}
              onEdit={(p) => {
                setSelectedProduction(p);
                setIsEditOpen(true);
              }}
              onDelete={setSelectedProduction}
              confirmDelete={deleteProduction}
              selectedProduction={selectedProduction}
              setProductionToDelete={setSelectedProduction}
            />
          </div>
        ) : chosenForm === "xml" ? (
          <UploadXMLForm
            professorId={
              selectedProfessorId === "own" ? undefined : selectedProfessorId
            }
            onSuccess={() => setChosenForm("none")}
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
      </div>

      <ProductionDialogs
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        onEditSubmit={onEditSubmit}
        editForm={editForm}
        editState={editState}
        onClearAll={fullDelete}
      />
    </div>
  );
}
