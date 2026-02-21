import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StratumQualis } from "@/types/academic";
import { QualisTable } from "./QualisTable";

interface QualisTabsProps {
  qualis: StratumQualis[];
  onEdit: (item: StratumQualis) => void;
  onDelete: (item: StratumQualis) => void;
}

export function QualisTabs({ qualis, onEdit, onDelete }: QualisTabsProps) {
  const journals = qualis.filter((item) => item.type === "journal");
  const conferences = qualis.filter((item) => item.type === "conference");

  return (
    <Tabs defaultValue="journal" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="journal">Periódicos</TabsTrigger>
        <TabsTrigger value="conference">Conferências</TabsTrigger>
      </TabsList>
      <TabsContent value="journal" className="mt-4">
        <div className="rounded-md border p-4">
          <h3 className="mb-4 text-lg font-medium">
            Qualis das produções de periódicos (NI = Não Identificado)
          </h3>
          <QualisTable items={journals} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </TabsContent>
      <TabsContent value="conference" className="mt-4">
        <div className="rounded-md border p-4">
          <h3 className="mb-4 text-lg font-medium">
            Qualis das produções de conferências (NI = Não Identificado)
          </h3>
          <QualisTable
            items={conferences}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
