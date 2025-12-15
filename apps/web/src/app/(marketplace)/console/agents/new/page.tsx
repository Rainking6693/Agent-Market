'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsoleNewAgentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agents/new');
  }, [router]);

  return null;
}
