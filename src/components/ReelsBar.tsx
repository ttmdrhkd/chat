import { useState, useRef } from 'react';
import { Plus, X, Send, MessageSquare, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useReels } from '@/lib/reels';
import { getDeviceId, getNickname } from '@/lib/nickname';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import SendMessageDialog from '@/components/SendMessageDialog';
import { useMessages } from '@/lib/store';

export default function ReelsBar() {
  const deviceId = getDeviceId();
  const nickname = getNickname();
  const { reels, addReel, addReelComment, canPostToday, getRemainingTime, getReel } = useReels();
  const { sendMessage } = useMessages();
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewingReel, setViewingReel] = useState<ReturnType<typeof getReel> | null>(null);
  const [commentText, setCommentText] = useState('');
  const [messageTarget, setMessageTarget] = useState<{ deviceId: string; nickname: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createFileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, forCreate: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (forCreate) {
        setImageUrl(url);
        setImagePreview(url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!content.trim() && !imageUrl) return;
    addReel({ deviceId, nickname, content: content.trim(), imageUrl: imageUrl || undefined });
    setContent('');
    setImageUrl('');
    setImagePreview(null);
    setShowCreate(false);
  };

  const handleComment = () => {
    if (!commentText.trim() || !viewingReel) return;
    addReelComment(viewingReel.id, { deviceId, nickname, content: commentText.trim() });
    setCommentText('');
    // refresh viewing reel
    setViewingReel(getReel(viewingReel.id) || null);
  };

  const openReel = (reelId: string) => {
    const r = getReel(reelId);
    if (r) setViewingReel(r);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">
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

        {reels.map(reel => {
          const isMine = reel.deviceId === deviceId;
          const remaining = getRemainingTime(reel);
          return (
            <button
              key={reel.id}
              onClick={() => openReel(reel.id)}
              className="flex-shrink-0 flex flex-col items-center gap-1"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold transition-transform hover:scale-105 overflow-hidden ${
                isMine ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-accent to-secondary text-foreground'
              } ring-2 ring-primary/50 ring-offset-2 ring-offset-background`}>
                {reel.imageUrl ? (
                  <img src={reel.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  reel.nickname.charAt(0)
                )}
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
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden">
              <img src={imagePreview} alt="미리보기" className="w-full max-h-40 object-cover" />
              <button
                onClick={() => { setImageUrl(''); setImagePreview(null); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input
            ref={createFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleImageSelect(e, true)}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => createFileRef.current?.click()}>
                <ImagePlus className="w-4 h-4 mr-1" /> 사진
              </Button>
              <span className="text-xs text-muted-foreground">{content.length}/200</span>
            </div>
            <Button onClick={handleSubmit} disabled={!content.trim() && !imageUrl} size="sm">
              올리기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View reel dialog - no default close button */}
      <Dialog open={!!viewingReel} onOpenChange={() => setViewingReel(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden [&>button.absolute]:hidden">
          {viewingReel && (
            <div className="bg-gradient-to-b from-primary/20 to-background min-h-[350px] flex flex-col">
              {/* Header */}
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
                <div className="flex items-center gap-1">
                  {viewingReel.deviceId !== deviceId && (
                    <button
                      onClick={() => setMessageTarget({ deviceId: viewingReel.deviceId, nickname: viewingReel.nickname })}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="쪽지 보내기"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setViewingReel(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Image */}
              {viewingReel.imageUrl && (
                <div className="px-4">
                  <img src={viewingReel.imageUrl} alt="" className="w-full max-h-48 object-cover rounded-lg" />
                </div>
              )}

              {/* Content */}
              {viewingReel.content && (
                <div className="flex-1 flex items-center justify-center px-6 py-4">
                  <p className="text-base text-foreground text-center whitespace-pre-wrap leading-relaxed">
                    {viewingReel.content}
                  </p>
                </div>
              )}

              {/* Comments */}
              <div className="px-4 pb-2">
                <div className="flex items-center gap-1 text-muted-foreground mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-xs">{viewingReel.comments.length}개 댓글</span>
                </div>
                {viewingReel.comments.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                    {viewingReel.comments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                          {c.nickname.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-foreground">{c.nickname}</span>
                          <span className="text-xs text-muted-foreground ml-1">{c.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <Input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="댓글 입력..."
                    className="text-xs h-8"
                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                  />
                  <Button size="sm" variant="ghost" onClick={handleComment} disabled={!commentText.trim()} className="h-8 px-2">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Remaining time */}
              <div className="p-3 text-center border-t border-border">
                <p className="text-[10px] text-muted-foreground">
                  남은 시간: {getRemainingTime(viewingReel)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send message dialog */}
      {messageTarget && (
        <SendMessageDialog
          open={!!messageTarget}
          onClose={() => setMessageTarget(null)}
          toNickname={messageTarget.nickname}
          onSubmit={(msgContent) => {
            sendMessage({
              fromDeviceId: deviceId,
              fromNickname: nickname,
              toDeviceId: messageTarget.deviceId,
              toNickname: messageTarget.nickname,
              postId: viewingReel?.id || '',
              content: msgContent,
            });
            setMessageTarget(null);
          }}
        />
      )}
    </>
  );
}
