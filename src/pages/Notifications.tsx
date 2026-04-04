import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { useNotifications } from '@/lib/supabase-store';
import { getDeviceId } from '@/lib/nickname';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Notifications() {
  const navigate = useNavigate();
  const deviceId = getDeviceId();
  const { getUserNotifications, markRead, markAllRead } = useNotifications();
  const list = getUserNotifications(deviceId);

  const handleClick = (n: typeof list[0]) => {
    markRead(n.id);
    if (n.type === 'comment' && n.relatedId) {
      navigate(`/post/${n.relatedId}`);
    } else if (n.type === 'message_request' && n.relatedId) {
      navigate('/messages');
    } else if (n.type === 'message_accepted' && n.relatedId) {
      navigate(`/chat/${n.relatedId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border safe-top">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-foreground">알림</h1>
          {list.some(n => !n.read) && (
            <Button size="sm" variant="ghost" onClick={() => markAllRead(deviceId)} className="text-xs gap-1">
              <Check className="w-3 h-3" /> 모두 읽음
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-2">
        {list.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">알림이 없습니다.</p>
          </div>
        )}
        {list.map(n => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={`rounded-xl p-4 border cursor-pointer transition-colors ${
              n.read ? 'bg-card border-border' : 'bg-accent border-primary/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-muted' : 'bg-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: ko })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
