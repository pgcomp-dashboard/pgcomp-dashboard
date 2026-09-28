import { dashboardService } from "@/services/modules/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./auth";

export interface PendingSummary {
  registrations: number;
  student_registrations: number;
  admin_requests: number;
  publishers: number;
  total: number;
}

export function usePendingSummary() {
  const auth = useAuth();

  const { data, isLoading, refetch } = useQuery<PendingSummary>({
    queryKey: ["admin", "pending-summary"],
    queryFn: async () => {
      const summary = await dashboardService.getPendingSummary();
      return {
        ...summary,
        student_registrations: summary.student_registrations ?? 0,
      };
    },
    enabled: !!auth?.isAdmin,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    staleTime: 1000 * 60 * 1, // Stale after 1 minute
  });

  return {
    summary: data || {
      registrations: 0,
      student_registrations: 0,
      admin_requests: 0,
      publishers: 0,
      total: 0,
    },
    isLoading,
    refetch,
  };
}
