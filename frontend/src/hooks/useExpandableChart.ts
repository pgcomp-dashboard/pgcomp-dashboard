import { useState, useEffect } from 'react';

export function useExpandableChart(dataLength: number, maxVisibleBars: number = 8) {
  const [ expanded, setExpanded ] = useState(false);
  const [ isMobile, setIsMobile ] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isScrollable = dataLength > maxVisibleBars && !expanded;
  
  // Mobile: largura mínima maior (100px por barra) para melhor legibilidade
  // Desktop: largura padrão (80px por barra)
  const barWidth = isMobile ? 100 : 80;
  const chartWidth = isScrollable ? `${dataLength * barWidth}px` : '100%';

  const toggleExpand = () => setExpanded(prev => !prev);

  return {
    expanded,
    toggleExpand,
    isScrollable,
    chartWidth,
    isMobile,
  };
}
