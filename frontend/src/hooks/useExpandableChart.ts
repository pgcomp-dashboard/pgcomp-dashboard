import { useState } from 'react';

export function useExpandableChart(dataLength: number, maxVisibleBars: number = 8) {
  const [ expanded, setExpanded ] = useState(false);

  const isScrollable = dataLength > maxVisibleBars && !expanded;
  const chartWidth = isScrollable ? `${dataLength * 80}px` : '100%';

  const toggleExpand = () => setExpanded(prev => !prev);

  return {
    expanded,
    toggleExpand,
    isScrollable,
    chartWidth,
  };
}
