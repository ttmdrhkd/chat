import { MessageSquare, Send } from 'lucide-react';
import type { Post } from '@/lib/supabase-store';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import ReportBlockMenu from '@/components/ReportBlockMenu';
import { getDeviceId } from '@/lib/nickname';

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  onMessage?: () => void;
  isMine?: boolean;
  badge?: { label: string; value: string } | null;
}

export default function PostCard({ post, onClick, onMessage, isMine, badge }: PostCardProps) {
  const deviceId = getDeviceId();

  return (
    <article
      className="bg-card rounded-xl p-4 card-shadow hover:card-shadow-hover transition-shadow cursor-pointer border border-border"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full mint-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
          {post.nickname.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground truncate">{post.nickname}</p>
            {badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                {badge.value}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
          </p>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isMine && onMessage && (
            <button
              onClick={(e) => { e.stopPropagation(); onMessage(); }}
              className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              title="쪽지 보내기"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          {!isMine && (
            <ReportBlockMenu
              targetDeviceId={post.deviceId}
              targetNickname={post.nickname}
              reportType="post"
              relatedId={post.id}
            />
          )}
        </div>
      </div>

      <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

      {post.imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img src={post.imageUrl} alt="첨부 이미지" className="w-full object-cover max-h-64" />
        </div>
      )}

      <div className="flex items-center gap-1 text-muted-foreground">
        <MessageSquare className="w-4 h-4" />
        <span className="text-xs">{post.comments.length}</span>
      </div>
    </article>
  );
}
