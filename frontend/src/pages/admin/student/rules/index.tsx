import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Settings2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { configurationService } from "@/services/modules/configuration.service";
import { toast } from "sonner";

const studentRankingRulesSchema = z.object({
  initial_year: z.coerce.number().min(2000).max(2100),
  final_year: z.coerce.number().min(2000).max(2100),
  min_journals: z.coerce.number().min(0),
  min_journals_a1a2: z.coerce.number().min(0),
  min_score: z.coerce.number().min(0),
});

type StudentRankingRulesValues = z.infer<typeof studentRankingRulesSchema>;

export default function StudentRulesPage() {
  const queryClient = useQueryClient();
  const { data: configurations, isLoading } = useQuery({
    queryKey: ["configurations"],
    queryFn: () => configurationService.getAll(),
  });
  const studentRankingConfig = configurations?.find(
    (configuration) =>
      configuration.group === "student_ranking" &&
      configuration.key === "rules",
  );

  const form = useForm<StudentRankingRulesValues>({
    resolver: zodResolver(studentRankingRulesSchema),
    defaultValues: {
      initial_year: new Date().getFullYear() - 4,
      final_year: new Date().getFullYear(),
      min_journals: 0,
      min_journals_a1a2: 0,
      min_score: 0,
    },
  });

  useEffect(() => {
    if (studentRankingConfig?.casted_value) {
      form.reset(studentRankingConfig.casted_value);
    }
  }, [studentRankingConfig, form]);

  const mutation = useMutation({
    mutationFn: (values: StudentRankingRulesValues) =>
      configurationService.create({
        group: "student_ranking",
        key: "rules",
        value: JSON.stringify(values),
        type: "json",
        description: "Regras para o ranking de discentes",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] });
      queryClient.invalidateQueries({ queryKey: ["student-ranking"] });
      toast.success("Regras do ranking de discentes atualizadas com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar regras dos discentes: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Settings2 className="h-8 w-8 text-primary" />
          Regras dos Estudantes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configure o período e os critérios usados para classificar e marcar os
          discentes como aptos.
        </p>
      </div>

      <div className="grid gap-8 rounded-xl border bg-card p-8 shadow-sm">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {(
                [
                  "initial_year",
                  "final_year",
                  "min_journals",
                  "min_journals_a1a2",
                  "min_score",
                ] as const
              ).map((name) => {
                const labels = {
                  initial_year: "Ano Inicial",
                  final_year: "Ano Final",
                  min_journals: "Mínimo de Periódicos A1-A4",
                  min_journals_a1a2: "Mínimo de Periódicos A1-A2",
                  min_score: "Pontuação Mínima",
                };

                return (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{labels[name]}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step={name === "min_score" ? "0.1" : "1"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button type="submit" size="lg" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Regras dos Discentes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
