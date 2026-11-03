import { useQuery } from '@tanstack/react-query';

import useAuth from '@/hooks/auth';
import { systemFunctionService } from '@/services/modules/system-function.service';

export const LATTES_XML_UPLOAD_QUERY_KEY = [
  'system-function',
  'lattes-xml-upload',
] as const;

export function useLattesXmlUploadAvailability() {
  const auth = useAuth();
  const shouldCheck =
    auth?.user?.type === 'student' && !auth.isAdmin;
  const query = useQuery({
    queryKey: LATTES_XML_UPLOAD_QUERY_KEY,
    queryFn: () => systemFunctionService.getLattesXmlUploadStatus(),
    enabled: shouldCheck,
  });

  return {
    shouldCheck,
    isLoading: query.isLoading,
    isUnavailable:
      shouldCheck && !query.isLoading && query.data?.enabled !== true,
    hasError: query.isError,
  };
}
