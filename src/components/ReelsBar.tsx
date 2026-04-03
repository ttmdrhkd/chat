import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useReels } from '@/lib/reels';
import { getDeviceId, getNickname } from '@/lib/nickname';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ReelsBar() {
  const deviceId = getDeviceId();
  const nickname = getNickname();
  const { reels, addReel, canPostToday, getRemainingTime } = useReels();
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState('');
  const [viewingReel, setViewingReel] = useState<typeof reels[0] | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) return;
    addReel({ deviceId, nickname, content: content.trim() });
    setContent('');
    setShowCreate(false);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">
        {/* Add reel button */}
        <button
          onClick={() => canPostToday(deviceId) ? setShowCreate(true) : null}
          className="flex-shrink-0 flex flex-col items-center gap-1"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed transition-colors ${
            canPostToday(deviceId) ? 'border-primary text-primary hover:bg-primary/10' : 'border-muted text-muted-foreground'
          }`}>
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {canPostToday(deviceId) ? '릴스 올리기' : '오늘 완료'}
          </span>
        </button>

        {/* Reel items */}
        {reels.map(reel => {
          const isMine = reel.deviceId === deviceId;
          const remaining = getRemainingTime(reel);
          return (
            <button
              key={reel.id}
              onClick={() => setViewingReel(reel)}
              className="flex-shrink-0 flex flex-col items-center gap-1"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold transition-transform hover:scale-105 ${
                isMine ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-accent to-secondary text-foreground'
              } ring-2 ring-primary/50 ring-offset-2 ring-offset-background`}>
                {reel.nickname.charAt(0)}
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[64px]">
                {isMine ? '나' : reel.nickname}
              </span>
              <span className="text-[9px] text-muted-foreground/70">{remaining}</span>
            </button>
          );
        })}
      </div>

      {/* Create reel dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>릴스 올리기</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">하루에 한 번, 4시간 동안 유지됩니다.</p>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="지금 무슨 생각을 하고 있나요?"
            maxLength={200}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{content.length}/200</span>
            <Button onClick={handleSubmit} disabled={!content.trim()} size="sm">
              올리기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View reel dialog */}
      <Dialog open={!!viewingReel} onOpenChange={() => setViewingReel(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          {viewingReel && (
            <div className="bg-gradient-to-b from-primary/20 to-background min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {viewingReel.nickname.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{viewingReel.nickname}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(viewingReel.createdAt, { addSuffix: true, locale: ko })}
                    </p>
                  </div>
                </div>
                <button onClick={() => setViewingReel(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center px-6 py-8">
                <p className="text-base text-foreground text-center whitespace-pre-wrap leading-relaxed">
                  {viewingReel.content}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground">
                  남은 시간: {getRemainingTime(viewingReel)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
