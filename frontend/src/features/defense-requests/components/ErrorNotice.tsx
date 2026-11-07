import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

interface ErrorNoticeProps {
  title: string;
  children?: ReactNode;
  /** Botões do que fazer agora (tentar de novo, ir ao campo, ver a existente…). */
  actions?: ReactNode;
  tone?: "error" | "warning";
  className?: string;
}

/** Aviso que fica na tela até ser resolvido (o toast some sozinho e não diz onde corrigir). */
export function ErrorNotice({ title, children, actions, tone = "error", className }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm",
        tone === "error" ? "border-destructive/40 bg-destructive/5" : "border-amber-500/50 bg-amber-500/5",
        className,
      )}
    >
      <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", tone === "error" ? "text-destructive" : "text-amber-600")} />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-medium">{title}</p>
        {children}
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
