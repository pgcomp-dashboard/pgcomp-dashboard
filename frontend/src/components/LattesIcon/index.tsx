import React from 'react';

import imgSrc from '@/assets/lattes-icon.png';
import { cn } from '@/lib/utils';

export default function LattesIcon({ className }: React.ComponentProps<'img'>) {
  return <img src={imgSrc} className={cn('w-7', className)} />;
}
