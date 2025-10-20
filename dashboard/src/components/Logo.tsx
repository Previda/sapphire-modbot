'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative', sizes[size])}>
        <Image
          src="/logo.svg"
          alt="Sapphire ModBot Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="text-xl font-bold text-white">
          Sapphire
        </span>
      )}
    </div>
  );
}
