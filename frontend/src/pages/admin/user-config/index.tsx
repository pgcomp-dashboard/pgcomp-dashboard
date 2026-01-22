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
import api, { RequestBodyType } from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type UserInfo = {
  registration: string;
  siape: string;
  name: string;
  type: string;
  category: string;
  email: string;
  lattes_url: string;
};

const userConfigFormSchema = z.object({
  name: z.string(),
  email: z.string(),
  registration: z.string().optional().nullable(),
  siape: z.string().optional().nullable(),
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do sistema</h1>
          <p className="text-muted-foreground">Aqui você pode configurar o sistema do PGCOMP Dashboard.</p>
        </div>
      </div>
      <h3 className='text-xl font-bold tracking-tight'>Configurações do usuário</h3>
      <div className="rounded-md border p-12">
        <UserConfigForm />
      </div>
      <h3 className='text-xl font-bold tracking-tight'>Configurações de segurança</h3>
      <div className="rounded-md border p-12">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}

function UserConfigForm() {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);

  useEffect(() => {
    async function fetchPersonalInfo() {
      try {
        const info = await api.getUserInfo();
        setUserInfo(info.data);
        console.log(info.data);
      } catch (err) {
        console.error('Erro ao carregar Informações do Usuário:', err);
      }
    }
    fetchPersonalInfo()
  }, [])

  const form = useForm<z.infer<typeof userConfigFormSchema>>({
    resolver: zodResolver(userConfigFormSchema),
    defaultValues: {
      name: "",
      email: "",
      registration: "",
      siape: "",
      lattes_url: "",
    },
    values: userInfo,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  async function onSubmit(values: z.infer<typeof userConfigFormSchema>) {
    try {
      // Clean up empty strings to null or undefined if needed, or send as is
      await api.updateUserInfo(values as any);
      alert('Informações atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      alert('Erro ao atualizar usuário.');
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
                <Input {...field} className={!form.formState.dirtyFields.name ? "text-muted-foreground/60" : "text-foreground font-medium"} />
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
                <Input {...field} className={!form.formState.dirtyFields.email ? "text-muted-foreground/60" : "text-foreground font-medium"} />
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
                  <Input {...field} value={field.value || ''} className={!form.formState.dirtyFields.registration ? "text-muted-foreground/60" : "text-foreground font-medium"} />
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
                  <Input {...field} value={field.value || ''} className={!form.formState.dirtyFields.siape ? "text-muted-foreground/60" : "text-foreground font-medium"} />
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
                <Input {...field} value={field.value || ''} className={!form.formState.dirtyFields.lattes_url ? "text-muted-foreground/60" : "text-foreground font-medium"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Atualizar</Button>
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
    console.log(JSON.stringify(values))
    const payload: RequestBodyType = {
      password: values.password,
      confirmPassword: values.confirmPassword
    }
    try {
      const response = await api.updateUserPassword(JSON.stringify(payload))
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
