import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useAuth from '@/hooks/auth';
import { parseApiError } from '@/services/http-client';
import { adminService } from '@/services/modules/admin.service';
import { authService } from '@/services/modules/auth.service';
import { userService } from '@/services/modules/user.service';
import { RequestBodyType } from '@/types/common';
import { Professor } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const userConfigFormSchema = z.object({
  name: z.string(),
  email: z.string(),
  registration: z.string().optional().nullable(),
  siape: z.number().optional().nullable(),
  lattes_url: z.string().optional().nullable(),
});

const updatePasswordFormSchema = z.object({
  password: z.string().min(1, 'Senha muito curta!'),
  confirmPassword: z.string().min(1, 'Senha muito curta!'),
})
  .refine((data) => data.password === data.confirmPassword, {
    path: [ 'confirmPassword' ],
    message: 'As senhas não são iguais!',
  });

export default function SystemConfigPage() {
  const auth = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Usuário</h1>
          <p className="text-muted-foreground">Aqui você pode configurar suas informações no PGCOMP Dashboard.</p>
        </div>
      </div>
      <h3 className='text-xl font-bold tracking-tight'>Informações do usuário</h3>
      <div className="rounded-md border p-12">
        <UserConfigForm />
      </div>
      <h3 className='text-xl font-bold tracking-tight'>Configurações de segurança</h3>
      <div className="rounded-md border p-12">
        <UpdatePasswordForm />
      </div>
      {!auth?.isAdmin && (
        <>
          <h3 className='text-xl font-bold tracking-tight'>Solicitar Acesso Admin</h3>
          <div className="rounded-md border p-12">
            <AskForAdminForm />
          </div>
        </>
      )}
    </div>
  );
}

function UserConfigForm() {
  const [ userInfo, setUserInfo ] = useState<Professor | undefined>(undefined);

  useEffect(() => {
    async function fetchPersonalInfo() {
      try {
        const info = await userService.getUserInfo();
        setUserInfo(info.data);
        console.log(info.data);
      } catch (err) {
        console.error('Erro ao carregar Informações do Usuário:', err);
      }
    }
    fetchPersonalInfo();
  }, []);

  const form = useForm<z.infer<typeof userConfigFormSchema>>({
    resolver: zodResolver(userConfigFormSchema),
    defaultValues: {
      name: '',
      email: '',
      registration: '',
      siape: 0,
      lattes_url: '',
    },
    values: userInfo,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  async function onSubmit(values: z.infer<typeof userConfigFormSchema>) {
    console.log(values);
    try {
      await userService.updateUserInfo(values);
      toast.success('Informações atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      toast.error('Erro ao atualizar usuário.');
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome:</FormLabel>
              <FormControl>
                <Input {...field} className={!form.formState.dirtyFields.name ? 'text-muted-foreground/60' : 'text-foreground font-medium'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email:</FormLabel>
              <FormControl>
                <Input {...field} className={!form.formState.dirtyFields.email ? 'text-muted-foreground/60' : 'text-foreground font-medium'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula (Estudante):</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} className={!form.formState.dirtyFields.registration ? 'text-muted-foreground/60' : 'text-foreground font-medium'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="siape"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIAPE (Professor):</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} className={!form.formState.dirtyFields.siape ? 'text-muted-foreground/60' : 'text-foreground font-medium'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="lattes_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Lattes:</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} className={!form.formState.dirtyFields.lattes_url ? 'text-muted-foreground/60' : 'text-foreground font-medium'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </form>
    </Form>
  );
}

function UpdatePasswordForm() {
  const form = useForm<z.infer<typeof updatePasswordFormSchema>>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof updatePasswordFormSchema>) {
    console.log(JSON.stringify(values));
    const payload: RequestBodyType = {
      password: values.password,
      password_confirmation: values.confirmPassword,
    };
    try {
      const response = await authService.updateUserPassword(JSON.stringify(payload));
      console.log(response.status);
    } catch (err) {
      console.error('Erro ao mudar senha:', err);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                Nova senha do seu usuário.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                Confirme a nova senha para seu usuário.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Atualizar senha</Button>
      </form>
    </Form>
  );
}

function AskForAdminForm() {
  const queryClient = useQueryClient();
  const queryKey = ['admin-status'];

  const {
    data: status,
    isLoading: isLoadingStatus,
    error: errorStatus,
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await adminService.getAdminStatus()
      return response.data as 'pending' | 'approved' | 'rejected' | null;
    },
    meta: {
      onError: (err: any) => console.error('Erro ao carregar status de solicitação:', err)
    }
  });

  const requestMutation = useMutation({
    mutationFn: () => adminService.requestAdmin(),
    onSuccess: () => {
      //queryClient.invalidateQueries({ queryKey: ['admin-status'] })
      queryClient.setQueryData(queryKey, () => {
        return "pending";
      })
      console.log("Cache atualizado para pending");
      toast.success('Solicitação enviada com sucesso! Aguarde, um administrador irá analisar o pedido.');
    },
    onError: (err: any) => {
      console.error('Erro ao solicitar admin:', err);
      toast.error(parseApiError(err) || 'Erro ao solicitar admin.');
    },

  })

  if (isLoadingStatus) return (
    <div className="flex items-center justify-center p-10">
      <Loader2 className="animate-spin mr-2" /> Verificando solicitação...
    </div>
  );
  if (errorStatus) return (
    <div className="text-red-500 flex items-center p-10">
      <AlertCircle className="mr-2" /> Erro ao carregar dados.
    </div>
  )

  const statusConfig = {
    pending: {
      title: 'Solicitação Pendente',
      titleColor: 'text-yellow-600',
      description: 'Você já solicitou acesso de administrador. Aguarde a aprovação de um administrador existente.',
      buttonText: 'Aguardando Aprovação',
      buttonVariant: 'outline' as const,
      disabled: true,
      action: null,
    },
    rejected: {
      title: 'Solicitação Rejeitada',
      titleColor: 'text-red-600',
      description: null,
      buttonText: requestMutation.isPending ? 'Solicitando...' : 'Solicitar Novamente',
      buttonVariant: 'default' as const,
      disabled: requestMutation.isPending,
      action: () => requestMutation.mutate(),
    },
    default: {
      title: null,
      description: 'Caso você precise de privilégios de administrador para gerenciar o sistema, clique no botão abaixo para solicitar a promoção.',
      buttonText: requestMutation.isPending ? 'Solicitando...' : 'Solicitar promoção para admin',
      buttonVariant: 'default' as const,
      disabled: requestMutation.isPending,
      action: () => requestMutation.mutate(),
    }
  };

  const currentKey = (status === 'pending' || status === 'rejected') ? status : 'default';
  const config = statusConfig[currentKey];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-6 items-center">
        {config.title && (
          <h4 className={`font-semibold ${config.titleColor || ''}`}>{config.title}</h4>
        )}

        {config.description && (
          <p className="text-sm text-muted-foreground text-center">
            {config.description}
          </p>
        )}

        <Button
          onClick={config.action || undefined}
          disabled={config.disabled}
          variant={config.buttonVariant}
        >
          {config.buttonText}
        </Button>
      </div>
    </div>
  );
}
