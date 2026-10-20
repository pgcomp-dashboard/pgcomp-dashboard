import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  COURSE_LABEL,
  formatPeriod,
  LEVEL_LABEL,
} from "@/features/internationalization/types";
import PublicLayout from "@/layouts/public/public-layout";
import {
  publicService,
  PublicInternationalizationAction,
} from "@/services/modules/public.service";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";

const columnHelper = createColumnHelper<PublicInternationalizationAction>();

function Person({ action }: { action: PublicInternationalizationAction }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium">{action.full_name}</span>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{LEVEL_LABEL[action.level]}</Badge>
        {action.level === "student" && (
          <span className="text-xs text-muted-foreground">{COURSE_LABEL[action.course]}</span>
        )}
      </div>
    </div>
  );
}

const abroad = (action: PublicInternationalizationAction) =>
  [action.country, action.institution].filter(Boolean).join(" · ") || "—";

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

const columns: ColumnDef<PublicInternationalizationAction, any>[] = [
  columnHelper.display({
    id: "period",
    header: "Período",
    cell: (info) => <span className="whitespace-nowrap">{formatPeriod(info.row.original)}</span>,
  }),
  columnHelper.accessor("full_name", {
    header: "Pessoa",
    cell: (info) => <Person action={info.row.original} />,
  }),
  columnHelper.accessor("category_name", { header: "Categoria" }),
  columnHelper.display({
    id: "abroad",
    header: "No exterior",
    cell: (info) => abroad(info.row.original),
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

const renderMobileCard = (row: Row<PublicInternationalizationAction>) => {
  const action = row.original;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-xs text-muted-foreground">{formatPeriod(action)}</Label>
        <h3 className="font-semibold text-base">{action.category_name}</h3>
      </div>
      <Person action={action} />
      <p className="text-sm text-muted-foreground">{abroad(action)}</p>
      <p className="text-sm">{action.description}</p>
      <LinkCell url={action.url} />
    </div>
  );
};

/** Página aberta: ações de internacionalização do programa. */
export default function PublicInternationalizationPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "internationalization"],
    queryFn: publicService.listInternationalization,
  });

  return (
    <PublicLayout
      title="Internacionalização"
      description="Ações de internacionalização de docentes e discentes do PGCOMP: intercâmbios, estágios, palestras e parcerias no exterior."
    >
      {isError ? (
        <p className="text-destructive">Não foi possível carregar as ações. Tente novamente mais tarde.</p>
      ) : (
        <>
          {data && (
            <p className="text-sm text-muted-foreground" data-testid="public-count">
              {data.length} {data.length === 1 ? "ação cadastrada" : "ações cadastradas"}
            </p>
          )}
          <DataTable
            columns={columns}
            data={data ?? []}
            isLoading={isLoading}
            emptyMessage="Nenhuma ação cadastrada ainda."
            renderMobileCard={renderMobileCard}
          />
        </>
      )}
    </PublicLayout>
  );
}
