import { MessageSquare, Send } from 'lucide-react';
import type { Post } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  onMessage?: () => void;
  isMine?: boolean;
}

export default function PostCard({ post, onClick, onMessage, isMine }: PostCardProps) {
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
          <p className="text-sm font-semibold text-foreground truncate">{post.nickname}</p>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
          </p>
        </div>
        {!isMine && onMessage && (
          <button
            onClick={(e) => { e.stopPropagation(); onMessage(); }}
            className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            title="쪽지 보내기"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
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
