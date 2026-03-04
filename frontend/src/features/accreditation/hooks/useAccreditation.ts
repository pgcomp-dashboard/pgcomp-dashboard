import { userService } from "@/services/modules/user.service";
import { Ranking } from "@/types/academic";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { configurationService } from "@/services/modules/configuration.service";

export function useAccreditation() {
  const date = new Date();
  const [isToggled, setIsToggled] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("permanente");
  const [startYear, setStartYear] = useState(date.getFullYear() - 4);
  const [endYear, setEndYear] = useState(date.getFullYear());

  const {
    data: rulesData
  } = useQuery({
    queryKey: ["rulesYears"],
    queryFn: () => configurationService.getRulesEndAndStartYears(),
    staleTime: 0,
    refetchOnMount: true,
  })

  useEffect(() => {
    if (rulesData?.startYear) setStartYear(rulesData.startYear);
    if (rulesData?.endYear) setEndYear(rulesData.endYear);
  }, [rulesData]);

  const {
    data: ranking = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<Ranking[], Error>({
    queryKey: ["ranking", startYear, endYear],
    queryFn: () => userService.getAccreditationRanking(startYear, endYear),
    placeholderData: (prevData) => prevData,
    enabled: !!rulesData,
  });

  const filteredRanking = useMemo(() => {
    if (categoryFilter === "all") return ranking;
    return ranking.filter((rank) => rank.category === categoryFilter);
  }, [ranking, categoryFilter]);



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
    refetch,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    isToggled,
    setIsToggled,
    categoryFilter,
    setCategoryFilter,
    years,
  };
}
