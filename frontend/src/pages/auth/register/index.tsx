import AppLogo from '@/components/AppLogo';
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
import { authService } from '@/services/modules/auth.service';
import { ApiError } from '@/types/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Nome muito curto!'),
  email: z.string().email('Email inválido!'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres!'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  useFormErrorToast(form.formState.errors);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await authService.register({ ...values, type: 'professor' });
      navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Aguarde a aprovação.' } });
    } catch (e: unknown) {
      const error = e as ApiError;
      console.error('Falha ao realizar cadastro', error);
      toast.error('Erro ao realizar cadastro. Verifique os dados e tente novamente.');
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
              <div className="mb-4 sm:mb-8 flex items-center justify-center">
                <AppLogo />
              </div>
            </Link>

            <div className="space-y-1 sm:space-y-2 text-center">
              <h1 className="text-lg sm:text-xl font-medium">Criar sua conta</h1>
              <p className="text-muted-foreground text-center text-xs sm:text-sm">
                Preencha os dados abaixo para se cadastrar no sistema
              </p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="example@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />



                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar
                </Button>

                <div className="text-center text-sm">
                  Já tem uma conta? <Link to="/login" className="underline underline-offset-4 hover:text-primary">Entrar</Link>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
