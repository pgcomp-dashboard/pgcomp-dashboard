import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Link as LinkIcon, Loader2, Save, Settings2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Switch } from "@/components/ui/switch";
import { configurationService } from "@/services/modules/configuration.service";
import { toast } from "sonner";

const accreditationRulesSchema = z.object({
  initial_year: z.coerce.number().min(2000).max(2100),
  final_year: z.coerce.number().min(2000).max(2100),
  is_pq_required: z.boolean(),
  is_senior_required: z.boolean(),
  min_journals: z.coerce.number().min(0),
  min_journals_a1a2: z.coerce.number().min(0),
  min_score: z.coerce.number().min(0),
  is_maintenance_mode: z.boolean(),
});

const resolutionLinkSchema = z.object({
  resolution_link: z
    .string()
    .url("Informe uma URL válida")
    .min(1, "O link não pode ser vazio"),
});

type AccreditationRulesValues = z.infer<typeof accreditationRulesSchema>;
type ResolutionLinkValues = z.infer<typeof resolutionLinkSchema>;

const DEFAULT_RESOLUTION_LINK =
  "https://pgcomp.ufba.br/";

export default function RulesPage() {
  const queryClient = useQueryClient();

  const { data: configurations, isLoading } = useQuery({
    queryKey: ["configurations"],
    queryFn: () => configurationService.getAll(),
  });

  const accreditationConfig = configurations?.find(
    (c) => c.group === "accreditation" && c.key === "rules"
  );

  const form = useForm<AccreditationRulesValues>({
    resolver: zodResolver(accreditationRulesSchema),
    defaultValues: {
      initial_year: new Date().getFullYear() - 4,
      final_year: new Date().getFullYear() - 1,
      is_pq_required: false,
      is_senior_required: false,
      min_journals: 0,
      min_journals_a1a2: 0,
      min_score: 0,
      is_maintenance_mode: false,
    },
  });

  useEffect(() => {
    if (accreditationConfig?.casted_value) {
      form.reset(accreditationConfig.casted_value);
    }
  }, [accreditationConfig, form]);

  const updateMutation = useMutation({
    mutationFn: (values: AccreditationRulesValues) =>
      configurationService.create({
        group: "accreditation",
        key: "rules",
        value: JSON.stringify(values),
        type: "json",
        description: "Regras fixas para o cálculo de credenciamento",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
      toast.success("Regras de credenciamento atualizadas com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar regras: " + error.message);
    },
  });

  function onSubmit(values: AccreditationRulesValues) {
    updateMutation.mutate(values);
  }

  const { data: resolutionLink, isLoading: isLinkLoading } = useQuery({
    queryKey: ["accreditation-resolution-link"],
    queryFn: () => configurationService.getResolutionLink(),
  });

  const linkForm = useForm<ResolutionLinkValues>({
    resolver: zodResolver(resolutionLinkSchema),
    defaultValues: {
      resolution_link: DEFAULT_RESOLUTION_LINK,
    },
  });

  useEffect(() => {
    if (resolutionLink) {
      linkForm.reset({ resolution_link: resolutionLink });
    }
  }, [resolutionLink, linkForm]);

  const linkMutation = useMutation({
    mutationFn: (values: ResolutionLinkValues) =>
      configurationService.create({
        group: "accreditation",
        key: "resolution_link",
        value: values.resolution_link,
        type: "string",
        description: "Link para o documento da Resolução PGCOMP de Credenciamento",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] });
      queryClient.invalidateQueries({ queryKey: ["accreditation-resolution-link"] });
      toast.success("Link da resolução atualizado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar link: " + error.message);
    },
  });

  function onLinkSubmit(values: ResolutionLinkValues) {
    linkMutation.mutate(values);
  }

  if (isLoading || isLinkLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="h-8 w-8 text-primary" />
          Regras de Credenciamento
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure os critérios para o ranking de credenciamento dos docentes.
        </p>
      </div>

      <div className="grid gap-8 p-8 border rounded-xl bg-card shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="initial_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano Inicial</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Início da janela de avaliação.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="final_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano Final</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Fim da janela de avaliação.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_journals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mínimo de Periódicos (A1 a A4)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Quantidade mínima de publicações em estratos superiores.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_journals_a1a2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mínimo de Periódicos (A1 e A2)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Quantidade mínima de publicações em estratos A1 E A2.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontuação Mínima</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Soma mínima de pontos no período.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_pq_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Aprovar se Bolsa PQ?</FormLabel>
                    <FormDescription>
                      Docentes bolsistas de Produtividade em Pesquisa são credenciados diretamente.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_senior_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Aprovar se Sênior?</FormLabel>
                    <FormDescription>
                      Se ativado, docentes seniores são credenciados diretamente.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_maintenance_mode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-destructive/10 border-destructive/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-destructive font-bold">Modo Manutenção</FormLabel>
                    <FormDescription>
                      Ativa um aviso de manutenção na página inicial para todos os usuários.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" size="lg" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="grid gap-6 p-8 border rounded-xl bg-card shadow-sm">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Link da Resolução de Credenciamento
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            URL do documento oficial da Resolução PGCOMP exibido como link na página de credenciamento.
          </p>
        </div>

        <Form {...linkForm}>
          <form onSubmit={linkForm.handleSubmit(onLinkSubmit)} className="space-y-4">
            <FormField
              control={linkForm.control}
              name="resolution_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Resolução</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        className="flex-1"
                        {...field}
                      />
                    </FormControl>
                    {field.value && (
                      <a
                        href={field.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-muted transition-colors"
                        title="Abrir link em nova aba"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <FormDescription>
                    Link exibido como "Resolução PGCOMP de Credenciamento" na página de credenciamento.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2 border-t">
              <Button type="submit" size="lg" disabled={linkMutation.isPending}>
                {linkMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Link
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
