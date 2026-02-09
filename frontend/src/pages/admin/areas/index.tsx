import { AlertCircle, Loader2, Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { areaService } from '@/services/modules/area.service';
import { dashboardService } from '@/services/modules/dashboard.service';
import { Area } from '@/types/academic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash } from 'lucide-react';

// Sample area data
export default function AreasPage() {
  const queryClient = useQueryClient();

  const { data: areas = [], isLoading, error } = useQuery({
    queryKey: [ 'areas' ],
    queryFn: () => areaService.fetchAreas(),
  });

  // Students by area
  const { data: studentsPerField = {} } = useQuery({
    queryKey: [ 'studentsPerField' ],
    queryFn: () => dashboardService.studentsPerField(),
  });

  const addAreaMutation = useMutation({
    mutationFn: (area: { name: string; students: number }) => areaService.createArea(area),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ 'areas' ] }),
  });

  const editAreaMutation = useMutation({
    mutationFn: (area: { id: number; name: string; students: number }) => areaService.updateArea(area),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ 'areas' ] }),
  });

  const deleteAreaMutation = useMutation({
    mutationFn: (id: number) => areaService.deleteArea(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ 'areas' ] }),
  });

  const [ searchTerm, setSearchTerm ] = useState('');
  const [ isAddAreaOpen, setIsAddAreaOpen ] = useState(false);
  const [ isEditAreaOpen, setIsEditAreaOpen ] = useState(false);
  const [ isDeleteAreaOpen, setIsDeleteAreaOpen ] = useState(false);
  const [ currentArea, setCurrentArea ] = useState<Area | null>(null);
  const [ newArea, setNewArea ] = useState({
    name: '',
    description: '',
    students: 0,
    subareas: 0,
  });

  // Filter areas based on search term
  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Add new area
  const handleAddArea = () => {
    addAreaMutation.mutate({
      name: newArea.name,
      students: newArea.students,
    });
    setNewArea({
      name: '',
      description: '',
      students: 0,
      subareas: 0,
    });
    setIsAddAreaOpen(false);
  };

  // Edit area
  const handleEditArea = () => {
    if (!currentArea) return;
    editAreaMutation.mutate({
      id: currentArea.id,
      name: currentArea.name,
      students: currentArea.students,
    });
    setIsEditAreaOpen(false);
  };

  // Delete area
  const handleDeleteArea = () => {
    if (!currentArea) return;
    deleteAreaMutation.mutate(currentArea.id);
    setIsDeleteAreaOpen(false);
  };

  if (isLoading) {
    return <div>Carregando áreas...</div>;
  }
  if (isLoading) return (
    <div className="flex items-center justify-center p-10">
      <Loader2 className="animate-spin mr-2" /> Carregando áreas...
    </div>
  );
  if (error) return (
  <div className="text-red-500 flex items-center p-10">
      <AlertCircle className="mr-2" /> Erro ao carregar áreas.
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Áreas acadêmicas</h1>
          <p className="text-muted-foreground">Gerencie as áreas cadastradas no sistema.</p>
        </div>
        <Dialog open={isAddAreaOpen} onOpenChange={setIsAddAreaOpen}>
          <DialogTrigger asChild>
            <Button data-cy="add-area-button" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Adicionar área
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar nova área</DialogTitle>
              <DialogDescription>Cadastrar uma nova área no sistema</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newArea.name}
                  data-cy="add-area-form-input-name"
                  onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                />
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="students">N. de estudantes</Label>
                  <Input
                    id="students"
                    type="number"
                    data-cy="add-area-form-input-student-number"
                    value={newArea.students}
                    onChange={(e) => setNewArea({ ...newArea, students: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div> */}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddAreaOpen(false)}>
                Cancelar
              </Button>
              <Button data-cy="add-area-form-submit" onClick={handleAddArea}>Adicionar nova área</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar áreas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>N. de estudantes</TableHead>
              <TableHead className="w-25">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAreas.map((area) => (
              <TableRow key={area.id}>
                <TableCell className="font-medium">{area.name}</TableCell>
                <TableCell>{studentsPerField[area.name] || 0}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    data-cy={`area-edit-button-${area.name}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    aria-label="Editar"
                    onClick={() => {
                      setCurrentArea(area);
                      setIsEditAreaOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    data-cy={`area-delete-button-${area.name}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 cursor-pointer"
                    aria-label="Apagar"
                    onClick={() => {
                      setCurrentArea(area);
                      setIsDeleteAreaOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filteredAreas.map((area) => (
          <div key={area.id} className="rounded-lg border p-4 bg-white">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{area.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {studentsPerField[area.name] || 0} estudante{(studentsPerField[area.name] || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setCurrentArea(area);
                    setIsEditAreaOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-500 hover:text-red-600"
                  onClick={() => {
                    setCurrentArea(area);
                    setIsDeleteAreaOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditAreaOpen} onOpenChange={setIsEditAreaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar área</DialogTitle>
            <DialogDescription>Alterar parâmetros da área acadêmica.</DialogDescription>
          </DialogHeader>
          {currentArea && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={currentArea.name}
                  onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
                />
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-students">N. de estudantes</Label>
                  <Input
                    id="edit-students"
                    type="number"
                    value={currentArea.students}
                    onChange={(e) =>
                      setCurrentArea({
                        ...currentArea,
                        students: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div> */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAreaOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditArea}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAreaOpen} onOpenChange={setIsDeleteAreaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Área Acadêmica</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja deletar essa área acadêmica? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {currentArea && (
            <div className="py-4">
              <p>
                Você irá apagar <strong>{currentArea.name}</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Essa ação poderá afetar o registro de múltiplos estudantes.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAreaOpen(false)}>
              Cancelar
            </Button>
            <Button data-cy="area-list-dropdown-delete-modal-confirm-button" variant="destructive" onClick={handleDeleteArea}>
              Apagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
