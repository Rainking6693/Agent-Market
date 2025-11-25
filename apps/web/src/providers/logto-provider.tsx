'use client';

import { LogtoProvider as LogtoProviderBase } from '@logto/react';
import { ReactNode } from 'react';

import { logtoConfig } from '@/lib/logto-config';

interface LogtoProviderProps {
  children: ReactNode;
}

export function LogtoProvider({ children }: LogtoProviderProps) {
  if (!logtoConfig.endpoint || !logtoConfig.appId) {
    // If Logto is not configured, render children without provider
    console.warn('Logto is not configured. Authentication features will be disabled.');
    return <>{children}</>;
  }

  return (
    <LogtoProviderBase
      config={{
        endpoint: logtoConfig.endpoint,
        appId: logtoConfig.appId,
        resources: logtoConfig.resources,
        scopes: logtoConfig.scopes,
      }}
    >
      {children}
    </LogtoProviderBase>
  );
}

