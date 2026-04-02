import { ArrowLeft, Check, X, Inbox, Send as SendIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/lib/store';
import { getDeviceId } from '@/lib/nickname';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Messages() {
  const navigate = useNavigate();
  const deviceId = getDeviceId();
  const { getReceivedMessages, getSentMessages, acceptMessage, rejectMessage } = useMessages();
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  const received = getReceivedMessages(deviceId);
  const sent = getSentMessages(deviceId);
  const list = tab === 'received' ? received : sent;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-foreground">쪽지함</h1>
        </div>
        <div className="max-w-lg mx-auto flex border-b border-border">
          <button
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'received' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
            onClick={() => setTab('received')}
          >
            <Inbox className="w-4 h-4" /> 받은 쪽지
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'sent' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
            onClick={() => setTab('sent')}
          >
            <SendIcon className="w-4 h-4" /> 보낸 쪽지
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {list.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-16">
            {tab === 'received' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}
          </p>
        )}
        {list.map(msg => (
          <div key={msg.id} className="bg-card rounded-xl p-4 border border-border card-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full mint-gradient flex items-center justify-center text-primary-foreground text-[10px] font-bold">
                  {(tab === 'received' ? msg.fromNickname : msg.toNickname).charAt(0)}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {tab === 'received' ? msg.fromNickname : msg.toNickname}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(msg.createdAt, { addSuffix: true, locale: ko })}
              </span>
            </div>
            <p className="text-sm text-foreground mb-3">{msg.content}</p>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                msg.status === 'pending' ? 'bg-accent text-accent-foreground' :
                msg.status === 'accepted' ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {msg.status === 'pending' ? '대기 중' : msg.status === 'accepted' ? '수락됨' : '거절됨'}
              </span>
              {tab === 'received' && msg.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectMessage(msg.id)}
                    className="gap-1 text-xs"
                  >
                    <X className="w-3 h-3" /> 거절
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const room = acceptMessage(msg.id);
                      if (room) navigate(`/chat/${room.id}`);
                    }}
                    className="gap-1 text-xs"
                  >
                    <Check className="w-3 h-3" /> 수락
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
