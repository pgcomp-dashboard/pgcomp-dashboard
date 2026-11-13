import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStudentLookup } from "@/features/defense-requests/hooks/useDefenseRequests";
import { LEVEL_LABEL, StudentOption } from "@/features/defense-requests/types";
import { ChevronsUpDown, GraduationCap } from "lucide-react";
import { useState } from "react";

interface StudentPickerProps {
  value: StudentOption | null;
  onChange: (student: StudentOption) => void;
}

/** Orientador escolhe o discente entre os orientandos dele (a API só aceita orientando). */
export function StudentPicker({ value, onChange }: StudentPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lookup = useStudentLookup(query, open);
  const students = lookup.data ?? [];

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Ao fechar sem escolher, a próxima abertura começa sem a busca antiga.
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button id="defense-student" type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal sm:max-w-md">
          {value ? value.name : <span className="text-muted-foreground">Escolha o orientando…</span>}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar entre seus orientandos…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>
              {lookup.isFetching ? (
                "Buscando…"
              ) : lookup.isError ? (
                <LookupFailed onRetry={() => lookup.refetch()} />
              ) : (
                "Nenhum orientando encontrado."
              )}
            </CommandEmpty>
            {students.length > 0 && (
              <CommandGroup heading="Seus orientandos">
                {students.map((s) => (
                  <CommandItem
                    key={s.id}
                    value={String(s.id)}
                    onSelect={() => {
                      onChange(s);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{s.name}</span>
                    {s.level && (
                      <Badge variant="secondary" className="ml-auto shrink-0 text-[11px] font-normal">
                        {LEVEL_LABEL[s.level]}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Falha de rede na busca não é "ninguém encontrado": diz o que houve e oferece tentar de novo. */
export function LookupFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <span className="text-destructive">
      Não foi possível buscar.{" "}
      <button type="button" className="font-medium text-primary hover:underline" onClick={onRetry}>
        Tentar de novo
      </button>
    </span>
  );
}
