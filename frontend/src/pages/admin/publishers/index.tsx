"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublisherBulkDeleteDialog } from "@/features/publishers/components/PublisherBulkDeleteDialog";
import { PublisherDeleteDialog } from "@/features/publishers/components/PublisherDeleteDialog";
import { PublisherDialogs } from "@/features/publishers/components/PublisherDialogs";
import { PublisherFilters } from "@/features/publishers/components/PublisherFilters";
import { PublisherImport } from "@/features/publishers/components/PublisherImport";
import { PublisherTable } from "@/features/publishers/components/PublisherTable";
import { usePublishers } from "@/features/publishers/hooks/usePublishers";
import { usePendingSummary } from "@/hooks/usePendingSummary";
import { Publisher } from "@/types/academic";
import { Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export default function PublishersPage() {
  const {
    publishers,
    pagination,
    isLoading,
    isFetching,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    qualisFilter,
    setQualisFilter,
    approvalFilter,
    setApprovalFilter,
    sorting,
    setSorting,
    qualisOptions,
    createMutation,
    updateMutation,
    deleteMutation,
    approveMutation,
    importMutation,
    deletePendingMutation,
    refetch,
  } = usePublishers();

  const [isPublisherDialogOpen, setIsPublisherDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(
    null,
  );
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(
    null,
  );

  const handleAdd = () => {
    setEditingPublisher(null);
    setIsPublisherDialogOpen(true);
  };

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setIsPublisherDialogOpen(true);
  };

  const handleDelete = (publisher: Publisher) => {
    setPublisherToDelete(publisher);
    setIsDeleteDialogOpen(true);
  };

  const handleApprove = async (publisher: Publisher) => {
    await approveMutation.mutateAsync(publisher.id);
  };

  const handleSave = async (values: any) => {
    if (editingPublisher) {
      await updateMutation.mutateAsync({
        id: editingPublisher.id,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleConfirmDelete = async () => {
    if (publisherToDelete) {
      await deleteMutation.mutateAsync(publisherToDelete.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    await deletePendingMutation.mutateAsync();
    setIsBulkDeleteOpen(false);
  };

  const handleImport = async (
    formData: FormData,
    type: "journal" | "conference",
  ) => {
    await importMutation.mutateAsync({ formData, type });
  };

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "approved" || tab === "pending")) {
      setApprovalFilter(tab);
    }
  }, [searchParams, setApprovalFilter]);

  const handleTabChange = (value: string) => {
    setApprovalFilter(value);
    setSearchParams({ tab: value });
  };

  const { summary } = usePendingSummary();

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Veículos
          </h1>
          <p className="text-muted-foreground">
            Gerencie os veículos de publicação cadastrados.
          </p>
        </div>

        <div className="flex gap-2">
          <Button className="flex gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Adicionar Veículo
          </Button>
          <Button className="flex gap-2" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Importar
          </Button>
        </div>
      </header>

      <Tabs value={approvalFilter} onValueChange={handleTabChange} className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pendentes
            {summary.publishers > 0 && (
              <Badge variant="notification" className="h-5 px-1.5 min-w-5 flex items-center justify-center text-[10px]">
                {summary.publishers}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="space-y-4">
          <div className="rounded-md border">
            <PublisherFilters
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              qualisFilter={qualisFilter}
              setQualisFilter={setQualisFilter}
              perPage={perPage}
              setPerPage={setPerPage}
              qualisOptions={qualisOptions}
              refetch={refetch}
              isFetching={isFetching}
            />

            <PublisherTable
              publishers={publishers}
              pagination={pagination}
              isLoading={isLoading}
              isFetching={isFetching}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onPageChange={setPage}
              sorting={sorting}
              onSortingChange={setSorting}
              perPage={perPage}
              onPerPageChange={setPerPage}
              showApprove={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="rounded-md border">
            <PublisherFilters
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              qualisFilter={qualisFilter}
              setQualisFilter={setQualisFilter}
              perPage={perPage}
              setPerPage={setPerPage}
              qualisOptions={qualisOptions}
              refetch={refetch}
              isFetching={isFetching}
            />

            {summary.publishers > 0 && (
              <div className="p-4 border-b bg-muted/30 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="flex gap-2"
                >
                  <Plus className="h-4 w-4 rotate-45" />
                  Remover Todos Pendentes
                </Button>
              </div>
            )}

            <PublisherTable
              publishers={publishers}
              pagination={pagination}
              isLoading={isLoading}
              isFetching={isFetching}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onPageChange={setPage}
              sorting={sorting}
              onSortingChange={setSorting}
              perPage={perPage}
              onPerPageChange={setPerPage}
              showApprove={true}
            />
          </div>
        </TabsContent>
      </Tabs>

      <PublisherDialogs
        isOpen={isPublisherDialogOpen}
        onOpenChange={setIsPublisherDialogOpen}
        editingPublisher={editingPublisher}
        qualisOptions={qualisOptions}
        onSave={handleSave}
      />

      <PublisherImport
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={handleImport}
      />

      <PublisherDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        publisher={publisherToDelete}
        onConfirm={handleConfirmDelete}
      />

      <PublisherBulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        onConfirm={handleConfirmBulkDelete}
        count={summary.publishers}
      />
    </div>
  );
}
