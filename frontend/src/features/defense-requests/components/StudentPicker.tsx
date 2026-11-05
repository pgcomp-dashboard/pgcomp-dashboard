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

/** Orientador escolhe o discente: abre já com os orientandos dele; a busca acha os demais. */
export function StudentPicker({ value, onChange }: StudentPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lookup = useStudentLookup(query, open);
  const students = lookup.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id="defense-student" type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal sm:max-w-md">
          {value ? value.name : <span className="text-muted-foreground">Escolha o orientando…</span>}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar discente pelo nome…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{lookup.isFetching ? "Buscando…" : "Nenhum discente encontrado."}</CommandEmpty>
            {students.length > 0 && (
              <CommandGroup heading={query.trim() ? "Discentes" : "Seus orientandos"}>
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
                    <span className="ml-auto flex shrink-0 gap-1">
                      {s.level && <Badge variant="secondary" className="text-[11px] font-normal">{LEVEL_LABEL[s.level]}</Badge>}
                      {s.is_mine && <Badge variant="outline" className="text-[11px] font-normal">Orientando</Badge>}
                    </span>
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
