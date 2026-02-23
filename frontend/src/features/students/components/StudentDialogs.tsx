import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Area, Course } from "@/types/academic";
import { Student } from "@/types/user";
import { useEffect, useState } from "react";

interface StudentDialogsProps {
  openAdd: boolean;
  setOpenAdd: (open: boolean) => void;
  openEdit: boolean;
  setOpenEdit: (open: boolean) => void;
  openDelete: boolean;
  setOpenDelete: (open: boolean) => void;
  selectedStudent: Student | null;
  areas: Area[];
  courses: Course[];
  onCreate: (student: Omit<Student, "id">) => void;
  onUpdate: (id: number, student: Omit<Student, "id">) => void;
  onDelete: (id: number) => void;
}

const initialStudent: Omit<Student, "id"> = {
  name: "",
  email: "",
  registration: 0,
  type: "student",
  area_id: 0,
  course_id: 0,
  lattes_url: "",
  defended_at: "",
  is_protected: false,
  is_approved: false,
};

export function StudentDialogs({
  openAdd,
  setOpenAdd,
  openEdit,
  setOpenEdit,
  openDelete,
  setOpenDelete,
  selectedStudent,
  areas,
  courses,
  onCreate,
  onUpdate,
  onDelete,
}: StudentDialogsProps) {
  const [newStudent, setNewStudent] =
    useState<Omit<Student, "id">>(initialStudent);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (selectedStudent) setEditStudent({ ...selectedStudent });
  }, [selectedStudent]);

  const validate = (s: Omit<Student, "id"> | Student) => {
    if (!s.name.trim() || !s.registration || !s.course_id || !s.area_id) {
      alert(
        "Preencha todos os campos obrigatórios: Nome, Matrícula, Curso e Área.",
      );
      return false;
    }
    return true;
  };

  return (
    <>
      {/* Add Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo estudante</DialogTitle>
            <DialogDescription>
              Preencha os dados do estudante
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            student={newStudent}
            setStudent={setNewStudent}
            areas={areas}
            courses={courses}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenAdd(false);
                setNewStudent(initialStudent);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (validate(newStudent)) {
                  onCreate(newStudent);
                  setOpenAdd(false);
                  setNewStudent(initialStudent);
                }
              }}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar estudante</DialogTitle>
            <DialogDescription>Altere os dados do estudante</DialogDescription>
          </DialogHeader>
          {editStudent && (
            <StudentForm
              student={editStudent}
              setStudent={setEditStudent as any}
              areas={areas}
              courses={courses}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editStudent && validate(editStudent)) {
                  onUpdate(editStudent.id, editStudent);
                  setOpenEdit(false);
                }
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o estudante{" "}
              <strong>{selectedStudent?.name}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedStudent) {
                  onDelete(selectedStudent.id);
                  setOpenDelete(false);
                }
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StudentForm({
  student,
  setStudent,
  areas,
  courses,
}: {
  student: any;
  setStudent: any;
  areas: Area[];
  courses: Course[];
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Nome</Label>
        <Input
          value={student.name}
          onChange={(e) => setStudent({ ...student, name: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input
          value={student.email ?? ""}
          onChange={(e) => setStudent({ ...student, email: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Curso</Label>
          <Select
            value={String(student.course_id)}
            onValueChange={(v) =>
              setStudent({ ...student, course_id: Number(v) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Área</Label>
          <Select
            value={String(student.area_id)}
            onValueChange={(v) =>
              setStudent({ ...student, area_id: Number(v) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>URL do Lattes</Label>
        <Input
          value={student.lattes_url ?? ""}
          onChange={(e) =>
            setStudent({ ...student, lattes_url: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Matrícula</Label>
          <Input
            type="number"
            value={student.registration}
            onChange={(e) =>
              setStudent({ ...student, registration: Number(e.target.value) })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Data de Defesa</Label>
          <Input
            type="date"
            value={student.defended_at ?? ""}
            onChange={(e) =>
              setStudent({ ...student, defended_at: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
