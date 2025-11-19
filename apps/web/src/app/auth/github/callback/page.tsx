import { Suspense } from 'react';

import { GitHubCallbackHandler } from './GitHubCallbackHandler';

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={<GitHubCallbackLoadingState />}>
      <GitHubCallbackHandler />
    </Suspense>
  );
}

function GitHubCallbackLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Completing GitHub authentication...</p>
      </div>
    </div>
  );
}

