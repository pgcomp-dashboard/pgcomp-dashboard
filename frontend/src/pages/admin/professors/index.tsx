"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessorDeleteDialog } from "@/features/professors/components/ProfessorDeleteDialog";
import { ProfessorDialog } from "@/features/professors/components/ProfessorDialog";
import { ProfessorHeader } from "@/features/professors/components/ProfessorHeader";
import { ProfessorTable } from "@/features/professors/components/ProfessorTable";
import { useProfessors } from "@/features/professors/hooks/useProfessors";
import { UnifiedApprovalTable } from "@/features/user-config/components/UnifiedApprovalTable";
import { usePendingSummary } from "@/hooks/usePendingSummary";
import { Professor } from "@/types/user";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function ProfessorsPage() {
  const navigate = useNavigate();
  const {
    professors,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortField,
    sortOrder,
    handleSort,
    counts,
    updateMutation,
    deleteMutation,
  } = useProfessors();

  const [isDetailProfOpen, setIsDetailProfOpen] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(
    null,
  );

  // Estados para o modal de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<Professor | null>(
    null,
  );

  const handleUpdate = async (data: any) => {
    if (!currentProfessor) return;
    const { siape, ...rest } = data;
    await updateMutation.mutateAsync({
      id: currentProfessor.id,
      data: {
        siape: siape ? parseInt(siape) : undefined,
        ...rest,
      },
    });
    setCurrentProfessor({ ...currentProfessor, ...data } as Professor);
  };

  const handleViewDetails = (professor: Professor) => {
    setCurrentProfessor(professor);
    setIsDetailProfOpen(true);
  };

  const handleViewProductions = (id: number) => {
    navigate(`/portal/productions?professorId=${id}`);
  };

  const handleDelete = (professor: Professor) => {
    setProfessorToDelete(professor);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (professorToDelete) {
      await deleteMutation.mutateAsync(professorToDelete.id);
      setIsDeleteDialogOpen(false);
      setProfessorToDelete(null);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "list");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "list" || tab === "requests")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar professores!</div>;

  const { summary } = usePendingSummary();
  const pendingRequests = summary.registrations + summary.admin_requests;

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="list">Lista de Docentes</TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            Solicitações
            {pendingRequests > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 min-w-5 flex items-center justify-center text-[10px]">
                {pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="flex flex-col gap-4 mt-4">
          <ProfessorHeader counts={counts} />

          <ProfessorTable
            professors={professors}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onViewDetails={handleViewDetails}
            onViewProductions={handleViewProductions}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="requests" className="flex flex-col gap-4 mt-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Solicitações de Acesso
            </h1>
            <p className="text-muted-foreground">
              Gerencie novos cadastros e solicitações de privilégios de
              administrador.
            </p>
          </div>
          <UnifiedApprovalTable />
        </TabsContent>
      </Tabs>

      <ProfessorDialog
        isOpen={isDetailProfOpen}
        onOpenChange={setIsDetailProfOpen}
        professor={currentProfessor}
        onUpdate={handleUpdate}
      />

      <ProfessorDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        professor={professorToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
