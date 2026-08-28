import { publisherService } from '@/services/modules/publisher.service';
import { qualisService } from '@/services/modules/qualis.service';
import { Publisher, StratumQualis } from '@/types/academic';
import { useQuery } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

interface UsePublisherSearchOptions {
  initialType?: string;
  initialSearch?: string;
}

export function usePublisherSearch(options: UsePublisherSearchOptions = {}) {
  const { initialType = 'conference', initialSearch = '' } = options;

  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [publisherType, setPublisherType] = useState(initialType);
  const [publisherSearch, setPublisherSearch] = useState(initialSearch);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Publisher[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const { data: qualisOptions = [] } = useQuery<StratumQualis[], Error>({
    queryKey: ['qualis'],
    queryFn: () => qualisService.getAllQualis(),
  });

  const [newPublisherData, setNewPublisherData] = useState<{ name: string; code: string; stratum_qualis_id?: number }>({ name: '', code: '' });
  const isSelectedRef = useRef(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (publisherSearch.length >= 2 && !isSelectedRef.current) {
        setIsSearching(true);
        try {
          const response = await publisherService.searchPublishers({
            page: 1,
            per_page: 20,
            filter: {
              search: publisherSearch,
              publisher_type: publisherType,
            },
          });
          setSearchResults(response.data);
          setShowResults(true);
        } catch (err) {
          console.error('Erro ao buscar veículos:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [publisherSearch, publisherType]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    isSelectedRef.current = false;
    setPublisherSearch(e.target.value);
    setPublisher(null);
  };

  const handleTypeChange = (value: string) => {
    setPublisherType(value);
    setPublisher(null);
    setSearchResults([]);
    setPublisherSearch('');
  };

  const handleSelect = (p: Publisher) => {
    setPublisher(p);
    isSelectedRef.current = true;
    setPublisherSearch(p.name);
    setShowResults(false);
  };

  const reset = (newPublisher: Publisher | null = null, newType = 'conference', newSearch = '') => {
    setPublisher(newPublisher);
    setPublisherType(newType);
    setPublisherSearch(newSearch);
    setSearchResults([]);
    setShowResults(false);
    isSelectedRef.current = !!newPublisher;
  };

  return {
    publisher,
    setPublisher,
    publisherType,
    publisherSearch,
    isSearching,
    searchResults,
    showResults,
    setShowResults,
    handleInput,
    handleTypeChange,
    handleSelect,
    reset,
    isCreatingNew,
    setIsCreatingNew,
    isSubmittingNew,
    qualisOptions,
    newPublisherData,
    setNewPublisherData,
    handleCreateNew: async () => {
      if (!newPublisherData.name) {
        throw new Error('O nome é obrigatório');
      }

      setIsSubmittingNew(true);
      try {
        const payload: any = {
          name: newPublisherData.name,
          publisher_type: publisherType,
          stratum_qualis_id: newPublisherData.stratum_qualis_id,
        };

        if (publisherType === 'journal') {
          payload.issns = [newPublisherData.code];
        } else {
          payload.initials = newPublisherData.code;
        }

        const response = await publisherService.createPortalPublisher(payload);
        handleSelect(response);
        setIsCreatingNew(false);
        setNewPublisherData({ name: '', code: '', stratum_qualis_id: undefined });
        return response;
      } finally {
        setIsSubmittingNew(false);
      }
    },
  };
}
