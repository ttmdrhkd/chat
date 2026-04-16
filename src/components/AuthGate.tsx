import { useEffect, useState } from 'react';
import { ensureAnonymousAuth } from '@/lib/auth';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureAnonymousAuth()
      .then(() => setReady(true))
      .catch((err) => {
        console.error('Auth initialization failed:', err);
        // Retry once after a short delay
        setTimeout(() => {
          ensureAnonymousAuth()
            .then(() => setReady(true))
            .catch(() => setReady(true)); // proceed anyway to avoid infinite loading
        }, 1000);
      });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">로딩 중...</div>
      </div>
    );
  }

  return <>{children}</>;
}
