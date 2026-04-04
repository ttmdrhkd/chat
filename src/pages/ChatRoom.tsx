import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReportBlockMenu from '@/components/ReportBlockMenu';
import { useChatRooms } from '@/lib/supabase-store';
import { getDeviceId, getNickname } from '@/lib/nickname';

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deviceId = getDeviceId();
  const nickname = getNickname();
  const { getRoom, sendChat } = useChatRooms();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const room = getRoom(id || '');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">채팅방을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const otherIdx = room.participants[0] === deviceId ? 1 : 0;
  const otherNick = room.nicknames[otherIdx] || '알 수 없음';
  const otherDeviceId = room.participants[otherIdx];

  const handleSend = () => {
    if (!text.trim()) return;
    sendChat(room.id, { deviceId, nickname, content: text.trim() });
    setText('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border safe-top">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate('/chats')} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full mint-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
            {otherNick.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-foreground flex-1">{otherNick}</span>
          <ReportBlockMenu
            targetDeviceId={otherDeviceId}
            targetNickname={otherNick}
            reportType="user"
          />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
        {room.messages.map(msg => {
          const isMine = msg.deviceId === deviceId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMine
                    ? 'mint-gradient text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <div className="sticky bottom-0 bg-card border-t border-border">
        <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-3 safe-bottom">
          <Input
            placeholder="메시지를 입력하세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={!text.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
