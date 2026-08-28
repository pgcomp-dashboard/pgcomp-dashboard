import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { ProductionCreateForm } from "@/features/productions/components/forms/ProductionCreateForm";
import { ProductionDOIForm } from "@/features/productions/components/forms/ProductionDOIForm";
import { ProductionDialogs } from "@/features/productions/components/ProductionDialogs";
import { ProductionHeader } from "@/features/productions/components/ProductionHeader";
import { ProductionTable } from "@/features/productions/components/ProductionTable";
import { ProductionToolbar } from "@/features/productions/components/ProductionToolbar";
import UploadXMLForm from "@/features/productions/components/UploadXMLForm";
import { useProductionCrud } from "@/features/productions/hooks/useProductionCrud";
import { useProductionData } from "@/features/productions/hooks/useProductionData";
import { useProductionFilters } from "@/features/productions/hooks/useProductionFilters";
import { FormType } from "@/features/productions/types";
import { productionService } from "@/services/modules/production.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductionsPage() {
  const [chosenForm, setChosenForm] = useState<FormType>("none");
  const queryClient = useQueryClient();

  const filterState = useProductionFilters();

  const {
    auth,
    isLoading,
    isPending,
    qualisList,
    professorsList,
    uniqueYears,
    filteredAndSortedProductions,
    filteredScore,
    selectedProfessorId,
    handleProfessorChange,
  } = useProductionData({
    filters: filterState.filters,
    sortConfig: filterState.sortConfig,
  });

  const favoritos = filteredAndSortedProductions?.reduce((acc, p) => {
    return acc + Number(p.is_featured);
  }, 0);

  const podeFavoritar = favoritos < 4;

  console.log("podeFavoritar", podeFavoritar);

  const crud = useProductionCrud(selectedProfessorId);
  const featuredMutation = useMutation({
    mutationFn: (productionId: number) =>
      productionService.toggleFeatured(productionId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["productions", "own"] });
      queryClient.invalidateQueries({ queryKey: ["featured-productions"] });
      toast.success(
        response.is_featured ? "Produção favoritada" : "Favorito removido",
      );
    },
    onError: (err) => {
      const erro = err as { errors: { description: string }[]; code: number };
      if (erro.code === 422) {
        erro.errors?.map((e) => {
          toast.error(e.description);
        });
        return;
      }
    },
  });

  const currentProf =
    selectedProfessorId !== "own"
      ? professorsList.find((p) => p.id.toString() === selectedProfessorId)
      : auth?.user;

  const lastXmlUpdate = (currentProf as any)?.lattes_xml_uploaded_at;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 py-8">
      <ProductionHeader
        isAdmin={auth?.isAdmin}
        score={filteredScore}
        hasActiveFilters={filterState.hasActiveFilters}
        isLoading={isLoading}
        isPending={isPending}
        selectedProfessorId={selectedProfessorId}
        onProfessorChange={handleProfessorChange}
        professorsList={professorsList}
        lastXmlUpdate={lastXmlUpdate}
      />
      <div className="bg-background border rounded-xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-2 mb-6">
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
                  : null}
          </h2>
        </div>

        {chosenForm === "none" ? (
          <div className="space-y-4">
            <ProductionToolbar
              showFilters={filterState.showFilters}
              setShowFilters={filterState.setShowFilters}
              filters={filterState.filters}
              setFilters={filterState.setFilters}
              clearFilters={filterState.clearFilters}
              hasActiveFilters={filterState.hasActiveFilters}
              uniqueYears={uniqueYears}
              qualisList={qualisList}
              isAdmin={auth?.isAdmin}
              onAdd={setChosenForm}
              onClearAll={crud.fullDelete}
            />

            <ProductionTable
              isLoading={isLoading}
              hasActiveFilters={filterState.hasActiveFilters}
              productions={filteredAndSortedProductions}
              sortConfig={filterState.sortConfig}
              onSort={filterState.handleSort}
              onEdit={crud.openEdit}
              onDelete={crud.setSelectedProduction}
              confirmDelete={crud.deleteProduction}
              selectedProduction={crud.selectedProduction}
              setProductionToDelete={crud.setSelectedProduction}
              podeFavoritar={podeFavoritar}
              onToggleFeatured={
                selectedProfessorId === "own"
                  ? (production) => featuredMutation.mutate(production.id)
                  : undefined
              }
              isTogglingFeatured={featuredMutation.isPending}
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
        isEditOpen={crud.isEditOpen}
        setIsEditOpen={crud.setIsEditOpen}
        onEditSubmit={crud.onEditSubmit}
        editForm={crud.editForm}
        editState={crud.editState}
        onClearAll={crud.fullDelete}
      />
    </div>
  );
}
