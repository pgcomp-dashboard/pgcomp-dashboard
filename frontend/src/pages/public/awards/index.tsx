import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { RECIPIENT_TYPE_LABEL, SCOPE_LABEL } from "@/features/awards/types";
import PublicLayout from "@/layouts/public/public-layout";
import { publicService, PublicAward } from "@/services/modules/public.service";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";

const columnHelper = createColumnHelper<PublicAward>();

function Winners({ award }: { award: PublicAward }) {
  return (
    <ul className="flex flex-col gap-1">
      {award.winners.map((winner, index) => (
        <li key={`${winner.name}-${index}`} className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{winner.name}</span>
          <Badge variant="outline">{RECIPIENT_TYPE_LABEL[winner.recipient_type]}</Badge>
        </li>
      ))}
    </ul>
  );
}

function LinkCell({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
    >
      Ver <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

const columns: ColumnDef<PublicAward, any>[] = [
  columnHelper.accessor("year", {
    header: "Ano",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("category_name", { header: "Categoria" }),
  columnHelper.display({
    id: "winners",
    header: "Vencedor(es)",
    cell: (info) => <Winners award={info.row.original} />,
  }),
  columnHelper.accessor("scope", {
    header: "Abrangência",
    cell: (info) => SCOPE_LABEL[info.getValue() as PublicAward["scope"]],
  }),
  columnHelper.accessor("description", {
    header: "Descrição",
    cell: (info) => <p className="max-w-md whitespace-normal">{info.getValue()}</p>,
  }),
  columnHelper.display({
    id: "link",
    header: "Link",
    cell: (info) => <LinkCell url={info.row.original.url} />,
  }),
];

const renderMobileCard = (row: Row<PublicAward>) => {
  const award = row.original;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-xs text-muted-foreground">
          {award.year} · {SCOPE_LABEL[award.scope]}
        </Label>
        <h3 className="font-semibold text-base">{award.category_name}</h3>
      </div>
      <Winners award={award} />
      <p className="text-sm">{award.description}</p>
      <LinkCell url={award.url} />
    </div>
  );
};

/** Página aberta: prêmios recebidos pelo programa. */
export default function PublicAwardsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "awards"],
    queryFn: publicService.listAwards,
  });

  return (
    <PublicLayout
      title="Prêmios"
      description="Prêmios e reconhecimentos recebidos por docentes, discentes e técnicos do PGCOMP."
    >
      {isError ? (
        <p className="text-destructive">Não foi possível carregar os prêmios. Tente novamente mais tarde.</p>
      ) : (
        <>
          {data && (
            <p className="text-sm text-muted-foreground" data-testid="public-count">
              {data.length} {data.length === 1 ? "prêmio cadastrado" : "prêmios cadastrados"}
            </p>
          )}
          <DataTable
            columns={columns}
            data={data ?? []}
            isLoading={isLoading}
            emptyMessage="Nenhum prêmio cadastrado ainda."
            renderMobileCard={renderMobileCard}
          />
        </>
      )}
    </PublicLayout>
  );
}
