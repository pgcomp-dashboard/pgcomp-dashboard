"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/features/professors/components/AdminHeader";
import { AdminTable } from "@/features/professors/components/AdminTable";
import { ProfessorDeleteDialog } from "@/features/professors/components/ProfessorDeleteDialog";
import { ProfessorDialog } from "@/features/professors/components/ProfessorDialog";
import { ProfessorHeader } from "@/features/professors/components/ProfessorHeader";
import { ProfessorTable } from "@/features/professors/components/ProfessorTable";
import { useProfessors } from "@/features/professors/hooks/useProfessors";
import { Professor } from "@/types/user";
import { useState } from "react";
import { useNavigate } from "react-router";

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

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar professores!</div>;

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista de Docentes</TabsTrigger>
          <TabsTrigger value="requests">Solicitações de Admin</TabsTrigger>
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
          <AdminHeader />
          <AdminTable />
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
