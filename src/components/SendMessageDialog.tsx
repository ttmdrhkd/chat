import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getDailyMessageInfo, markAdWatched } from '@/lib/store';
import { AlertCircle, Play } from 'lucide-react';

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  toNickname: string;
}

export default function SendMessageDialog({ open, onClose, onSubmit, toNickname }: SendMessageDialogProps) {
  const [content, setContent] = useState('');
  const [showAdPrompt, setShowAdPrompt] = useState(false);
  const info = getDailyMessageInfo();

  const handleSubmit = () => {
    if (!content.trim()) return;
    const currentInfo = getDailyMessageInfo();
    if (!currentInfo.canSend) {
      if (currentInfo.count === 1 && !currentInfo.watchedAd) {
        setShowAdPrompt(true);
        return;
      }
      return;
    }
    onSubmit(content.trim());
    setContent('');
    onClose();
  };

  const handleWatchAd = () => {
    // Simulate watching an ad
    setTimeout(() => {
      markAdWatched();
      setShowAdPrompt(false);
    }, 2000);
  };

  if (showAdPrompt) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setShowAdPrompt(false); } }}>
        <DialogContent className="max-w-sm mx-auto text-center">
          <DialogHeader>
            <DialogTitle>추가 쪽지 보내기</DialogTitle>
            <DialogDescription>
              오늘의 무료 쪽지를 모두 사용했습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              광고를 시청하면 쪽지를 1회 더 보낼 수 있습니다.
            </p>
            <Button onClick={handleWatchAd} className="gap-2">
              <Play className="w-4 h-4" />
              광고 보기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>쪽지 보내기</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{toNickname}</span>님에게 쪽지를 보냅니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {info.count >= 1 && !info.watchedAd && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent text-accent-foreground text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>오늘의 무료 쪽지(1회)를 이미 사용했습니다. 광고 시청 후 1회 더 보낼 수 있습니다.</span>
            </div>
          )}
          <Textarea
            placeholder="상대방에게 보낼 메시지를 작성하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={300}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              보내기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
