import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import PostCard from '@/components/PostCard';
import WritePostDialog from '@/components/WritePostDialog';
import SendMessageDialog from '@/components/SendMessageDialog';
import { usePosts, useMessages } from '@/lib/supabase-store';
import { getDeviceId, getNickname } from '@/lib/nickname';
import { getProfileBadge } from '@/lib/profile';
import ReelsBar from '@/components/ReelsBar';

export default function Index() {
  const navigate = useNavigate();
  const deviceId = getDeviceId();
  const nickname = getNickname();
  const { posts, addPost } = usePosts();
  const { sendMessage } = useMessages();
  const [showWrite, setShowWrite] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{ deviceId: string; nickname: string; postId: string } | null>(null);

  const badge = getProfileBadge();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border safe-top">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-foreground">피드</h1>
          <Button size="sm" onClick={() => setShowWrite(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            글쓰기
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto border-b border-border">
        <ReelsBar />
      </div>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">아직 게시글이 없습니다.</p>
            <p className="text-muted-foreground text-xs mt-1">첫 번째 글을 작성해보세요!</p>
          </div>
        )}
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            isMine={post.deviceId === deviceId}
            onClick={() => navigate(`/post/${post.id}`)}
            onMessage={() => setMessageTarget({ deviceId: post.deviceId, nickname: post.nickname, postId: post.id })}
            badge={post.deviceId === deviceId ? badge : null}
          />
        ))}
      </main>

      <WritePostDialog
        open={showWrite}
        onClose={() => setShowWrite(false)}
        onSubmit={(content, imageUrl) => addPost({ deviceId, nickname, content, imageUrl })}
        nickname={nickname}
      />

      {messageTarget && (
        <SendMessageDialog
          open={!!messageTarget}
          onClose={() => setMessageTarget(null)}
          toNickname={messageTarget.nickname}
          onSubmit={(content) => {
            sendMessage({
              fromDeviceId: deviceId,
              fromNickname: nickname,
              toDeviceId: messageTarget.deviceId,
              toNickname: messageTarget.nickname,
              postId: messageTarget.postId,
              content,
            });
            setMessageTarget(null);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
