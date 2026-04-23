import { useMyBan } from '@/lib/bans';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ShieldAlert } from 'lucide-react';

interface BanGateProps {
  children: React.ReactNode;
}

export default function BanGate({ children }: BanGateProps) {
  const { banned, bannedUntil, loading } = useMyBan();

  if (loading) return <>{children}</>;

  if (banned && bannedUntil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 safe-top safe-bottom">
        <div className="max-w-sm w-full bg-card border border-border rounded-2xl p-6 text-center card-shadow">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-lg font-bold text-foreground mb-2">계정이 정지되었습니다</h1>
          <p className="text-sm text-muted-foreground mb-4">
            누적 신고 3회 이상으로 인해<br />
            <span className="font-semibold text-foreground">3일간 이용이 제한</span>됩니다.
          </p>
          <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
            정지 해제: <span className="font-medium text-foreground">{formatDistanceToNow(bannedUntil, { addSuffix: true, locale: ko })}</span>
            <div className="mt-1 text-[10px]">{bannedUntil.toLocaleString('ko-KR')}</div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
