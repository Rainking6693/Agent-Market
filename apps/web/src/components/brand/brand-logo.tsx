import Image from 'next/image';

import { cn } from '@/lib/utils';

interface BrandLogoProps {
  /**
   * Target render size in pixels (logo is square so width = height).
   */
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
  variant?: 'default' | 'transparent';
}

const LOGO_SRC_FINAL = '/logos/swarm-sync-v1-final.png';

export function BrandLogo({
  size = 256,
  className,
  priority = false,
  alt = 'Swarm Sync logo',
  variant = 'default',
}: BrandLogoProps) {
  return (
    <Image
      src={LOGO_SRC_FINAL}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn('h-auto w-auto object-contain', className)}
    />
  );
}
