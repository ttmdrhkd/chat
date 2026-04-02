import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/BottomNav';
import { usePosts } from '@/lib/store';
import { getDeviceId, getNickname } from '@/lib/nickname';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deviceId = getDeviceId();
  const nickname = getNickname();
  const { getPost, addComment } = usePosts();
  const [commentText, setCommentText] = useState('');
  const post = getPost(id || '');

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, { deviceId, nickname, content: commentText.trim() });
    setCommentText('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">게시글</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full mint-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
              {post.nickname.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{post.nickname}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img src={post.imageUrl} alt="첨부 이미지" className="w-full object-cover" />
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">댓글 {post.comments.length}개</h2>
          {post.comments.map(c => (
            <div key={c.id} className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-[9px] font-bold">
                  {c.nickname.charAt(0)}
                </div>
                <span className="text-xs font-medium text-foreground">{c.nickname}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(c.createdAt, { addSuffix: true, locale: ko })}
                </span>
              </div>
              <p className="text-sm text-foreground ml-8">{c.content}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Comment input */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border z-40">
        <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-2">
          <Input
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            className="flex-1 text-sm"
          />
          <Button size="icon" onClick={handleComment} disabled={!commentText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
