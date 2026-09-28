import { UnifiedApprovalTable } from "@/features/user-config/components/UnifiedApprovalTable";

export default function StudentRequestsPage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Solicitações de discentes
        </h1>
        <p className="text-muted-foreground">
          Revise os cadastros de estudantes que aguardam aprovação.
        </p>
      </header>
      <UnifiedApprovalTable userType="student" />
    </div>
  );
}
