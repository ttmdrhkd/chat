import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useChatRooms } from '@/lib/supabase-store';
import { getDeviceId } from '@/lib/nickname';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Chats() {
  const navigate = useNavigate();
  const deviceId = getDeviceId();
  const { getUserRooms } = useChatRooms();
  const rooms = getUserRooms(deviceId);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border safe-top">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-foreground">채팅</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-2">
        {rooms.length === 0 && (
          <div className="text-center py-20">
            <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">아직 채팅방이 없습니다.</p>
            <p className="text-muted-foreground text-xs mt-1">쪽지가 수락되면 채팅이 시작됩니다.</p>
          </div>
        )}
        {rooms.map(room => {
          const otherIdx = room.participants[0] === deviceId ? 1 : 0;
          const otherNick = room.nicknames[otherIdx];
          const lastMsg = room.messages[room.messages.length - 1];
          return (
            <button
              key={room.id}
              onClick={() => navigate(`/chat/${room.id}`)}
              className="w-full bg-card rounded-xl p-4 border border-border card-shadow hover:card-shadow-hover transition-shadow text-left flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full mint-gradient flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                {otherNick?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{otherNick || '알 수 없음'}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(lastMsg?.createdAt || room.createdAt, { addSuffix: true, locale: ko })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {lastMsg ? lastMsg.content : '채팅을 시작해보세요!'}
                </p>
              </div>
            </button>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
