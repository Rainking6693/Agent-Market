"use client";

import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'muted' | 'ghost';
  href?: string;
  className?: string;
};

export function TacticalButton({ children, variant = 'primary', href, className }: Props) {
  const classes = ['tactical-button', variant, className].filter(Boolean).join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
}
