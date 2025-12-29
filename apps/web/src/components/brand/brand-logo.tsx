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

const LOGO_SRC_DEFAULT = '/swarm-sync-logo.png';
const LOGO_SRC_TRANSPARENT = '/swarm-sync-logo.png';

export function BrandLogo({
  size = 256,
  className,
  priority = false,
  alt = 'Swarm Sync logo',
  variant = 'default',
}: BrandLogoProps) {
  const src = variant === 'transparent' ? LOGO_SRC_TRANSPARENT : LOGO_SRC_DEFAULT;
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn('h-auto w-auto object-contain', className)}
    />
  );
}
