'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ConsoleAgentAnalyticsRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.slug) {
      router.replace(`/agents/${params.slug}/analytics`);
    }
  }, [router, params?.slug]);

  return null;
}
