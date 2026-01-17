import { useRef, useEffect, useState, ReactNode } from 'react';
import './chart.css';

interface ChartScrollWrapperProps {
  children: ReactNode;
  minWidth?: string;
  isScrollable?: boolean;
  className?: string;
}

/**
 * Wrapper para gráficos com scroll horizontal otimizado para mobile
 * - Scroll suave (webkit-overflow-scrolling)
 * - Indicadores visuais de scroll (fade nas bordas)
 * - Scrollbar estilizada
 * - Touch-friendly
 */
export default function ChartScrollWrapper({
  children,
  minWidth,
  isScrollable = false,
  className = '',
}: ChartScrollWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ start: true, end: false });

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isAtStart = scrollLeft === 0;
      const isAtEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) < 1;

      setScrollState({ start: isAtStart, end: isAtEnd });
    };

    // Check inicial
    updateScrollState();

    // Listener para scroll
    container.addEventListener('scroll', updateScrollState);
    
    // Listener para resize (caso o gráfico mude de tamanho)
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [isScrollable]);

  return (
    <div
      ref={scrollRef}
      className={`chart-scroll-container ${isScrollable ? 'pb-4' : ''} ${className}`}
      data-scroll-start={scrollState.start}
      data-scroll-end={scrollState.end}
      style={{ minHeight: '400px' }}
    >
      <div style={{ minWidth: minWidth || '100%' }}>
        {children}
      </div>
    </div>
  );
}
