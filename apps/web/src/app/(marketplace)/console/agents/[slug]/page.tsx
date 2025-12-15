'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ConsoleAgentDetailRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.slug) {
      router.replace(`/agents/${params.slug}`);
    }
  }, [router, params?.slug]);

  return null;
}
