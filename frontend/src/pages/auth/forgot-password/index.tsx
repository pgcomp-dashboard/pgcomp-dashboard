import AppLogo from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormErrorToast } from '@/hooks/useFormErrorToast';
import { authService } from '@/services/modules/auth.service';
import { RequestBodyType } from '@/types/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Email inválido!'),
});

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  useFormErrorToast(form.formState.errors);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(JSON.stringify(values));
    const payload: RequestBodyType = {
      email: values.email,
    };
    try {
      const response = await authService.forgotPassword(payload);
      console.log(response.status);
      toast.success('Email de recuperação enviado com sucesso!');
    } catch (err) {
      console.error('Erro ao solicitar troca de senha', err);
      toast.error('Erro ao solicitar troca de senha.');
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
              <h1 className="text-lg sm:text-xl font-medium">Esqueceu sua senha?</h1>
              <p className="text-muted-foreground text-center text-xs sm:text-sm">
                Solicite a recuperação de senha de sua conta.
              </p>
            </div>
          </div>

          <div className="rounded-md border p-6 sm:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormDescription>
                        Digite o e-mail da conta que deseja recuperar
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {form.formState.isSubmitting ? 'Enviando...' : 'Solicitar troca de senha'}
                </Button>
              </form>
            </Form>
          </div>
          <div className='text-center'>
            <Link to="/login" className="text-sm">
              <u>Voltar para o login</u>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
