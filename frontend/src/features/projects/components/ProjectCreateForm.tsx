import { queryClient } from '@/lib/query-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormErrorToast } from '@/hooks/useFormErrorToast';
import { projectService } from '@/services/modules/project.service';
import { projectFormSchema, ProjectFormValues } from '../types';

interface ProjectCreateFormProps {
  professorId?: string;
  onSuccess?: () => void;
}

export function ProjectCreateForm({ professorId, onSuccess }: ProjectCreateFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      home_page: '',
      start_year: new Date().getFullYear(),
      status: '',
      nature: '',
      funding_source: '',
      role: 'Integrante',
    },
  });

  useFormErrorToast(form.formState.errors);

  async function onSubmit(values: ProjectFormValues) {
    try {
      if (professorId && professorId !== 'own') {
        await projectService.createUserProject(Number(professorId), values);
      }
      toast.success('Projeto criado com sucesso');
      await queryClient.invalidateQueries({ queryKey: [ 'projects', professorId || 'own' ] });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Erro ao criar projeto');
      console.error('Erro ao criar projeto:', err);
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col gap-4 w-full max-lg:max-w-lg">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">Adicionar manualmente</h2>
          <p className="text-sm text-muted-foreground mt-1">Preencha os dados do projeto</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do projeto</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Digite o nome do projeto" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="home_page"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do projeto (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="https://..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de início</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2024" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de fim (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2026" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Ex: Em andamento, Concluído" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Natureza</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Ex: Nacional, Internacional" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workload"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carga horária semanal (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 10" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do projeto (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 50000" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="funding_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fomento (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Ex: CNPq, FAPESB" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função no projeto</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Ex: Coordenador, Integrante" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Projeto"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}