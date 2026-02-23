import { publisherService } from '@/services/modules/publisher.service';
import { Publisher } from '@/types/academic';
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
  };
}
