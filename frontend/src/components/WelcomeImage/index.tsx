import React from 'react';

import imgSrc from '@/assets/nota_6.png';
import { cn } from '@/lib/utils';

export default function WelcomeImage({ className }: React.ComponentProps<'img'>) {
  return <img src={imgSrc} className={cn('w-48', className)} />;
}
