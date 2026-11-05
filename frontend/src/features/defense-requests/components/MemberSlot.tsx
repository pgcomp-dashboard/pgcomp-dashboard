import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMemberLookup } from "@/features/defense-requests/hooks/useDefenseRequests";
import { DefenseFormField, KIND_LABEL, MemberOption, MemberValue } from "@/features/defense-requests/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, ExternalLink, History, Pencil, Search, UserPlus, X } from "lucide-react";
import { useState } from "react";

interface MemberSlotProps {
  field: DefenseFormField;
  value: MemberValue | null;
  onChange: (value: MemberValue | null) => void;
  error?: string;
  /** Pessoas já escolhidas em outras vagas (não aparecem de novo). */
  takenNames: string[];
  /** Vaga opcional aberta pelo usuário: pode ser fechada. */
  onRemove?: () => void;
}

/**
 * Uma vaga da banca. O caminho normal é buscar e clicar: docente do PGCOMP traz
 * afiliação e Lattes do cadastro; externo de banca anterior traz o que foi informado
 * lá. Só quem nunca apareceu no portal é digitado ("Cadastrar membro externo").
 */
export function MemberSlot({ field, value, onChange, error, takenNames, onRemove }: MemberSlotProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState(false);
  const lookup = useMemberLookup(query, open);

  const id = `member-${field.key}`;
  const taken = new Set(takenNames.map((n) => n.toLowerCase()));
  const options = (lookup.data ?? []).filter((o) => !taken.has(o.name.toLowerCase()));
  const pgcomp = options.filter((o) => o.source === "pgcomp");
  const previous = options.filter((o) => o.source === "previous");
  // Vaga de externo: sugere primeiro quem já veio de fora.
  const groups: [string, MemberOption[]][] =
    field.kind === "external"
      ? [["Externos de bancas anteriores", previous], ["Docentes do PGCOMP", pgcomp]]
      : [["Docentes do PGCOMP", pgcomp], ["Externos de bancas anteriores", previous]];

  const pick = (option: MemberOption) => {
    onChange({ user_id: option.user_id, name: option.name, affiliation: option.affiliation, lattes: option.lattes });
    setOpen(false);
    setQuery("");
  };

  const startManual = () => {
    onChange({ user_id: null, name: query.trim(), affiliation: "", lattes: null });
    setManual(true);
    setOpen(false);
    setQuery("");
  };

  const set = (patch: Partial<MemberValue>) =>
    onChange({ user_id: null, name: "", affiliation: "", lattes: null, ...value, ...patch });

  const kindWarning =
    value?.name && field.kind === "external" && value.user_id
      ? "Esta vaga pede membro externo, e esta pessoa é docente do PGCOMP."
      : value?.name && field.kind === "internal" && !value.user_id
        ? "Esta vaga pede membro interno (docente do PGCOMP)."
        : null;

  return (
    <div
      className={cn("space-y-2 rounded-lg border p-3", error && "border-destructive/60")}
      data-testid={`slot-${field.key}`}
      role="group"
      aria-label={field.label}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {field.label}
          {field.required && " *"}
        </Label>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[11px] font-normal">
            {KIND_LABEL[field.kind ?? "any"]}
          </Badge>
          {onRemove && (
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" aria-label={`Remover ${field.label}`} onClick={onRemove}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {value?.name && !manual ? (
        <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 px-3 py-2">
          <div className="min-w-0 text-sm">
            <p className="font-medium">{value.name}</p>
            <p className="text-muted-foreground">
              {value.affiliation || "sem afiliação"}
              {value.lattes ? (
                <>
                  {" · "}
                  <a href={value.lattes} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">
                    Lattes <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              ) : (
                " · sem Lattes"
              )}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Editar ${field.label}`} onClick={() => setManual(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Trocar ${field.label}`} onClick={() => onChange(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : manual ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input aria-label={`${field.label}: nome`} placeholder="Nome completo" value={value?.name ?? ""} onChange={(e) => set({ name: e.target.value })} />
          <Input aria-label={`${field.label}: afiliação`} placeholder="Afiliação (ex.: UFPE)" value={value?.affiliation ?? ""} onChange={(e) => set({ affiliation: e.target.value })} />
          <Input
            aria-label={`${field.label}: Lattes`}
            placeholder={`Link do Lattes${field.lattes_required ? "" : " (opcional)"}`}
            value={value?.lattes ?? ""}
            onChange={(e) => set({ lattes: e.target.value || null })}
          />
          <div className="sm:col-span-3 flex justify-end">
            <Button type="button" size="sm" variant="secondary" onClick={() => setManual(false)} disabled={!value?.name}>
              Pronto
            </Button>
          </div>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button id={id} type="button" variant="outline" className="w-full justify-start gap-2 font-normal text-muted-foreground">
              <Search className="h-4 w-4" />
              Buscar docente ou membro externo…
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) min-w-[320px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Digite um nome…" value={query} onValueChange={setQuery} />
              <CommandList>
                <CommandEmpty>{lookup.isFetching ? "Buscando…" : "Ninguém encontrado."}</CommandEmpty>
                {groups.map(([heading, items]) =>
                  items.length ? (
                    <CommandGroup key={heading} heading={heading}>
                      {items.map((option) => (
                        <CommandItem key={`${option.source}-${option.user_id ?? option.name}`} value={`${option.source}-${option.user_id ?? option.name}`} onSelect={() => pick(option)}>
                          {option.source === "previous" && <History className="h-3.5 w-3.5 text-muted-foreground" />}
                          <span className="truncate">{option.name}</span>
                          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{option.affiliation}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : null,
                )}
                <CommandGroup>
                  <CommandItem value="__manual__" onSelect={startManual}>
                    <UserPlus className="h-4 w-4" />
                    {query.trim() ? `Cadastrar externo "${query.trim()}"` : "Cadastrar membro externo"}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {kindWarning && (
        <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" /> {kindWarning}
        </p>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
