import React from 'react';

import imgSrc from '@/assets/logo.png';
import { cn } from '@/lib/utils';

export default function AppLogo({ className }: React.ComponentProps<'img'>) {
  return (
    <img src={imgSrc} className={cn('aspect-auto w-35', className)} />
  );
}
