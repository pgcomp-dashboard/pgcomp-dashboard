import AppLogo from '@/components/AppLogo';
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
import { authService } from '@/services/modules/auth.service';
import { ApiError } from '@/types/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

export interface User {
  name: string,
  role: string
}

const formSchema = z.object({
  email: z.string().email('Email inválido!'),
  password: z.string().min(1, 'Senha muito curta!'),
});

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await authService.login(values.email, values.password);

      const user: User = { name:response.name, role:response.role };

      auth?.login(response.token, user);

      navigate('/admin');
    } catch (e: unknown) {
      const error = e as ApiError;
      console.error('Failed to login', error);
      setStatus(error.errors[0].description);
    }
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="mb-4 sm:mb-8 flex h-8 sm:h-9 items-center justify-center rounded-md">
                <AppLogo className="h-8 sm:h-auto" />
              </div>
            </Link>

            <div className="space-y-1 sm:space-y-2 text-center">
              <h1 className="text-lg sm:text-xl font-medium">Entrar na sua conta</h1>
              <p className="text-muted-foreground text-center text-xs sm:text-sm">
                Informe os seus dados para entrar na sua conta
              </p>
            </div>
          </div>
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
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="lg"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent [&_svg]:size-6"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="text-muted-foreground" aria-hidden="true" />
                              ) : (
                                <Eye className="text-muted-foreground" aria-hidden="true" />
                              )}
                              <span className="sr-only">
                                {showPassword ? "Esconder senha" : "Mostrar senha"}
                              </span>
                            </Button>
                          </div>
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
                <div className='text-center'>
                  <Link to="/forgot-password" ><u>Esqueceu sua senha?</u></Link>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
