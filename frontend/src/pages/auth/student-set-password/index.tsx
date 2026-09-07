import AppLogo from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { authService } from "@/services/modules/auth.service";
import { ApiError } from "@/types/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import zxcvbn from "zxcvbn";

const formSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres!"),
    confirmPassword: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres!"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não são iguais!",
  });

export default function StudentSetPasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const strengthMap = [
    { label: "Fraca", color: "bg-red-500" },
    { label: "Razoável", color: "bg-yellow-400" },
    { label: "Boa", color: "bg-lime-500" },
    { label: "Forte", color: "bg-green-600" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({ control: form.control, name: "password" });
  const strengthScore = passwordValue ? zxcvbn(passwordValue).score : -1;
  const strengthStage = strengthScore <= 1 ? 0 : strengthScore - 1;

  useFormErrorToast(form.formState.errors);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const token = urlParams.get("token");
  const email = urlParams.get("email");
  const registration = urlParams.get("registration");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token || !email || !registration) {
      toast.error("Link de confirmação inválido.");
      return;
    }

    try {
      await authService.confirmStudentRegistration({
        token,
        email,
        registration,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });

      toast.success("Cadastro confirmado com sucesso!", {
        description: "Sua senha foi cadastrada e o acesso já está liberado.",
        duration: 6000,
      });

      navigate("/login");
    } catch (e: unknown) {
      const error = e as ApiError;
      console.error("Erro ao confirmar cadastro do estudante", error);
      toast.error(
        "Não foi possível confirmar o cadastro. Verifique o link ou tente novamente.",
      );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center h-screen space-y-6">
      <div className="flex flex-col items-center gap-4">
        <AppLogo />
        <h1 className="text-3xl font-bold tracking-tight">Definir senha</h1>
      </div>

      <div className="rounded-md border p-12 w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
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
                  <FormDescription>
                    Cadastre uma senha segura para concluir o seu acesso.
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
                    <div className="relative">
                      <Input
                        type={showPasswordConfirmation ? "text" : "password"}
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
                          setShowPasswordConfirmation(!showPasswordConfirmation)
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {form.formState.isSubmitting
                ? "Confirmando..."
                : "Confirmar cadastro"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
