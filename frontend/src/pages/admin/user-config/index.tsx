import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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

const userConfigFormSchema = z.object({
  exampleInput: z.string(),
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
  const form = useForm<z.infer<typeof userConfigFormSchema>>({
    resolver: zodResolver(userConfigFormSchema),
    defaultValues: {
      exampleInput: 'Hello there!',
    },
  });

  function onSubmit(values: z.infer<typeof userConfigFormSchema>) {
    // TODO: remove this mock
    console.log(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="exampleInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input de teste</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Formulário ainda a ser definido.
              </FormDescription>
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

  function onSubmit(values: z.infer<typeof updatePasswordFormSchema>) {
    // TODO: remove this mock
    console.log(values);
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
