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
import { Switch } from "@/components/ui/switch";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { Professor } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const updateProfessorSchema = z.object({
  name: z.string().min(3, "O nome deve conter pelo menos 3 caracteres").optional(),
  siape: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  orcid: z.string().optional(),
  lattes_url: z.string().url("URL do Lattes inválida").optional(),
  category: z.enum(["permanente", "colaborador", "visitante"]),
  is_admin: z.boolean(),
  pq: z.boolean().optional(),
});

type UpdateProfessorForm = z.infer<typeof updateProfessorSchema>;

interface ProfessorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  professor: Professor | null;
  onUpdate: (data: UpdateProfessorForm) => Promise<void>;
}

export function ProfessorDialog({
  isOpen,
  onOpenChange,
  professor,
  onUpdate,
}: ProfessorDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfessorForm>({
    resolver: zodResolver(updateProfessorSchema),
  });

  useFormErrorToast(errors);

  useEffect(() => {
    if (professor) {
      reset({
        name: professor.name,
        siape: professor.siape?.toString(),
        email: professor.email,
        lattes_url: professor.lattes_url,
        orcid: "0000-0000-0000-0000", // Manter placeholder do código original
        category: (professor.category?.toLowerCase() as any) || "permanente",
        is_admin: professor.is_admin,
        pq: professor.pq || false,
      });
    }
  }, [professor, reset]);

  const onSubmit = async (data: UpdateProfessorForm) => {
    await onUpdate(data);
    onOpenChange(false);
  };

  if (!professor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar - Docente</DialogTitle>
          <DialogDescription>
            Editar Informações do Docente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register("email")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="siape">SIAPE</Label>
              <Input id="siape" {...register("siape")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanente">Permanente</SelectItem>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                      <SelectItem value="visitante">Visitante</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lattes_url">Lattes URL</Label>
              <Input id="lattes_url" {...register("lattes_url")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="orcid">ORCID (Opcional)</Label>
              <Input id="orcid" {...register("orcid")} placeholder="0000-0000-0000-0000" />
            </div>

            <div className="flex items-center space-x-2 py-4">
              <Controller
                name="is_admin"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_admin"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_admin" className="font-semibold">Administrador</Label>
            </div>

            <div className="flex items-center space-x-2 py-4">
              <Controller
                name="pq"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="pq"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="pq" className="font-semibold">Bolsista PQ</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)} variant="ghost">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
