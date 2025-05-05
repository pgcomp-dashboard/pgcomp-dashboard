import AuthLayout from '@/layouts/auth/auth-layout';
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
import api, { ApiError } from '@/services/api';
import { useState } from 'react';
import useAuth from '@/hooks/auth';
import { useNavigate } from 'react-router';

const formSchema = z.object({
  email: z.string().email('Email inválido!'),
  password: z.string().min(1, 'Senha muito curta!'),
});

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [ status, setStatus ] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await api.login(values.email, values.password);

      auth.login(response.token);

      navigate('/admin');
    } catch (e: unknown) {
      const error = e as ApiError;
      console.error('Failed to login', error);
      setStatus(error.errors[0].description);
    }
  }

  return (
    <AuthLayout
      title="Entrar na sua conta"
      description="Informe os seus dados para entrar na sua conta"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      O e-mail do seu usuário.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="" {...field} />
                    </FormControl>
                    <FormDescription>
                      A senha do seu usuário.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {status && <span className="my-2 text-destructive">{status}</span>}
            <Button type="submit" disabled={form.formState.isSubmitting}>Entrar</Button>
          </div>
        </form>
      </Form>
    </AuthLayout>

  );
}
