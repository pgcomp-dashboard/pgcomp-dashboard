import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { StratumQualis } from "@/types/academic";
import { QualisTable } from "./QualisTable";

interface QualisAccordionProps {
  qualis: StratumQualis[];
  onEdit: (item: StratumQualis) => void;
  onDelete: (item: StratumQualis) => void;
}

export function QualisAccordion({ qualis, onEdit, onDelete }: QualisAccordionProps) {
  const journals = qualis.filter((item) => item.type === "journal");
  const conferences = qualis.filter((item) => item.type === "conference");

  return (
    <Accordion type="multiple" defaultValue={["journal", "conference"]}>
      <AccordionItem value="journal">
        <AccordionTrigger>Qualis das produções de revistas</AccordionTrigger>
        <AccordionContent>
          <QualisTable items={journals} onEdit={onEdit} onDelete={onDelete} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="conference">
        <AccordionTrigger>Qualis das produções de conferências</AccordionTrigger>
        <AccordionContent>
          <QualisTable items={conferences} onEdit={onEdit} onDelete={onDelete} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
