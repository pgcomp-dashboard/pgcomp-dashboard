import { userService } from "@/services/modules/user.service";
import { Ranking, RankingProduction } from "@/types/academic";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export function useAccreditation() {
  const date = new Date();
  const [isToggled, setIsToggled] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("permanente");
  const [startYear, setStartYear] = useState(date.getFullYear() - 4);
  const [endYear, setEndYear] = useState(date.getFullYear());

  const [isProductionsOpen, setIsProductionsOpen] = useState(false);
  const [currentProductionList, setCurrentProductionList] = useState<
    RankingProduction[] | null
  >(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const {
    data: ranking = [],
    isLoading,
    isFetching,
    error,
  } = useQuery<Ranking[], Error>({
    queryKey: ["ranking", startYear, endYear],
    queryFn: () => userService.getAccreditationRanking(startYear, endYear),
    placeholderData: (prevData) => prevData,
  });

  const filteredRanking = useMemo(() => {
    if (categoryFilter === "all") return ranking;
    return ranking.filter((rank) => rank.category === categoryFilter);
  }, [ranking, categoryFilter]);

  const handleShowDetails = async (userId: number) => {
    setIsLoadingDetails(true);
    setIsProductionsOpen(true);
    try {
      const response = await userService.getAccreditationProductions(
        userId,
        startYear,
        endYear,
      );
      if (response) {
        setCurrentProductionList(response.productions);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da acreditação:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const years = useMemo(() => {
    return Array.from(
      { length: date.getFullYear() - 2000 + 1 },
      (_, i) => 2000 + i,
    ).reverse();
  }, [date]);

  return {
    ranking: filteredRanking,
    isLoading,
    isFetching,
    error,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    isToggled,
    setIsToggled,
    categoryFilter,
    setCategoryFilter,
    isProductionsOpen,
    setIsProductionsOpen,
    currentProductionList,
    isLoadingDetails,
    handleShowDetails,
    years,
  };
}
