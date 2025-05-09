import { useState } from 'react';
import { MoreHorizontal, Plus, Search } from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Area {
  id: number;
  name: string;
  students: number;
}

// Sample area data
const initialAreas = [
  {
    id: 1,
    name: 'Computação Aplicada',
    students: 400,
  },
  {
    id: 2,
    name: 'Engenharia de Software',
    students: 300,
  },
  {
    id: 3,
    name: 'Sistemas Computacionais',
    students: 250,
  },
] as Area[];

export default function AreasPage() {
  const [ areas, setAreas ] = useState(initialAreas);
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
    const id = areas.length > 0 ? Math.max(...areas.map((area) => area.id)) + 1 : 1;
    setAreas([ ...areas, { id, ...newArea } ]);
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
    setAreas(areas.map((area) => (area.id === currentArea.id ? currentArea : area)));
    setIsEditAreaOpen(false);
  };

  // Delete area
  const handleDeleteArea = () => {
    if (!currentArea) return;
    setAreas(areas.filter((area) => area.id !== currentArea.id));
    setIsDeleteAreaOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Áreas acadêmicas</h1>
          <p className="text-muted-foreground">Gerencie as áreas cadastradas no sistema.</p>
        </div>
        <Dialog open={isAddAreaOpen} onOpenChange={setIsAddAreaOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="students">N. de estudantes</Label>
                  <Input
                    id="students"
                    type="number"
                    value={newArea.students}
                    onChange={(e) => setNewArea({ ...newArea, students: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddAreaOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddArea}>Adicionar nova área</Button>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>N. de estudantes</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAreas.map((area) => (
              <TableRow key={area.id}>
                <TableCell className="font-medium">{area.name}</TableCell>
                <TableCell>{area.students}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentArea(area);
                          setIsEditAreaOpen(true);
                        }}
                      >
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setCurrentArea(area);
                          setIsDeleteAreaOpen(true);
                        }}
                      >
                        Apagar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Area Dialog */}
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAreaOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditArea}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Area Dialog */}
      <Dialog open={isDeleteAreaOpen} onOpenChange={setIsDeleteAreaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Academic Area</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this academic area? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentArea && (
            <div className="py-4">
              <p>
                You are about to delete <strong>{currentArea.name}</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This will also delete all associated subareas and may affect student records.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAreaOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteArea}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
