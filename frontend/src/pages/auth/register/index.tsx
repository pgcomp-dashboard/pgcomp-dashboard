import AppLogo from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { authService } from "@/services/modules/auth.service";
import { ApiError } from "@/types/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import zxcvbn from "zxcvbn";

const formSchema = z
  .object({
    name: z.string().min(2, "Nome muito curto!"),
    email: z.string().email("Email inválido!"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres!"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "As senhas não coincidem",
    path: ["password_confirmation"],
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState<boolean>(false);

  const strengthMap = [
    { label: "Fraca", color: "bg-red-500" },
    { label: "Razoável", color: "bg-yellow-400" },
    { label: "Boa", color: "bg-lime-500" },
    { label: "Forte", color: "bg-green-600" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const passwordValue = useWatch({ control: form.control, name: "password" });
  const strengthScore = passwordValue ? zxcvbn(passwordValue).score : -1;
  const strengthStage = strengthScore <= 1 ? 0 : strengthScore - 1;

  useFormErrorToast(form.formState.errors);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await authService.register({ ...values, type: "professor" });
      toast.success("Cadastro realizado com sucesso!", {
        description:
          "Verifique seu e-mail e aguarde a aprovação do administrador para acessar o sistema.",
        duration: 6000,
      });
      navigate("/login");
    } catch (e: unknown) {
      const error = e as ApiError;
      console.error("Falha ao realizar cadastro", error);
      toast.error(
        "Erro ao realizar cadastro. Verifique os dados e tente novamente.",
      );
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
                <AppLogo className="w-30" />
              </div>
            </Link>

            <div className="space-y-1 sm:space-y-2 text-center">
              <h1 className="text-lg sm:text-xl font-medium">
                Criar sua conta
              </h1>
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
                      {passwordValue && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {strengthMap.map((s, i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strengthStage ? s.color : "bg-muted"}`}
                              />
                            ))}
                          </div>
                          <p
                            className={`text-xs ${strengthMap[strengthStage].color.replace("bg-", "text-")}`}
                          >
                            {strengthMap[strengthStage].label}
                          </p>
                        </div>
                      )}
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
                        <div className="relative">
                          <Input
                            type={
                              showPasswordConfirmation ? "text" : "password"
                            }
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowPasswordConfirmation(
                                !showPasswordConfirmation,
                              )
                            }
                          >
                            {showPasswordConfirmation ? (
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cadastrar
                </Button>

                <div className="text-center text-sm">
                  Já tem uma conta?{" "}
                  <Link
                    to="/login"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Entrar
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
