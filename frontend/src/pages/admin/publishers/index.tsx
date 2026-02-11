import { Button } from "@/components/ui/button";
import { publisherService } from "@/services/modules/publisher.service";
import { Publisher } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function PublishersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, isPlaceholderData } = useQuery<
    PaginatedResponse<Publisher>,
    Error
  >({
    queryKey: ["publishers", page],
    queryFn: async () => {
      return await publisherService.getAllPublishers(page);
    },
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;

  return (
    <>
      {data?.data?.map((publisher) => (
        <div>{publisher.name}</div>
      ))}
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">
          Página {page} de {data?.meta.last_page}
        </span>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            {"<<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            ‹ Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!isPlaceholderData && page < (data?.meta.last_page || 1)) {
                setPage((prev) => prev + 1);
              }
            }}
            disabled={isPlaceholderData || page === data?.meta.last_page}
          >
            Próxima ›
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(data?.meta.last_page || 1)}
            disabled={page === data?.meta.last_page}
          >
            {">>"}
          </Button>
        </div>
      </div>
    </>
  );
}
