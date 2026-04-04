import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReelComment {
  id: string;
  reelId: string;
  deviceId: string;
  nickname: string;
  content: string;
  createdAt: Date;
}

export interface Reel {
  id: string;
  deviceId: string;
  nickname: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  expiresAt: Date;
  comments: ReelComment[];
}

const REEL_DURATION_MS = 4 * 60 * 60 * 1000;
const REEL_POST_KEY = 'reel_last_post_date';

export function useReels() {
  const [reels, setReels] = useState<Reel[]>([]);

  const fetchReels = useCallback(async () => {
    const now = new Date().toISOString();
    const { data: reelsData } = await supabase
      .from('reels')
      .select('*')
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (!reelsData) return;

    const reelIds = reelsData.map((r: any) => r.id);
    let commentsData: any[] = [];
    if (reelIds.length > 0) {
      const { data } = await supabase
        .from('reel_comments')
        .select('*')
        .in('reel_id', reelIds)
        .order('created_at', { ascending: true });
      commentsData = data || [];
    }

    const commentsByReel: Record<string, ReelComment[]> = {};
    commentsData.forEach((c: any) => {
      if (!commentsByReel[c.reel_id]) commentsByReel[c.reel_id] = [];
      commentsByReel[c.reel_id].push({
        id: c.id,
        reelId: c.reel_id,
        deviceId: c.device_id,
        nickname: c.nickname,
        content: c.content,
        createdAt: new Date(c.created_at),
      });
    });

    setReels(
      reelsData.map((r: any) => ({
        id: r.id,
        deviceId: r.device_id,
        nickname: r.nickname,
        content: r.content,
        imageUrl: r.image_url || undefined,
        createdAt: new Date(r.created_at),
        expiresAt: new Date(r.expires_at),
        comments: commentsByReel[r.id] || [],
      }))
    );
  }, []);

  useEffect(() => {
    fetchReels();

    const channel = supabase
      .channel('reels-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reels' }, () => fetchReels())
      .subscribe();

    const interval = setInterval(fetchReels, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchReels]);

  return {
    reels,

    addReel: async (reel: { deviceId: string; nickname: string; content: string; imageUrl?: string }) => {
      const now = new Date();
      await supabase.from('reels').insert({
        device_id: reel.deviceId,
        nickname: reel.nickname,
        content: reel.content,
        image_url: reel.imageUrl || null,
        expires_at: new Date(now.getTime() + REEL_DURATION_MS).toISOString(),
      });
      localStorage.setItem(REEL_POST_KEY, now.toDateString());
    },

    addReelComment: async (reelId: string, comment: { deviceId: string; nickname: string; content: string }) => {
      await supabase.from('reel_comments').insert({
        reel_id: reelId,
        device_id: comment.deviceId,
        nickname: comment.nickname,
        content: comment.content,
      });
      // Refresh to get latest comments
      await fetchReels();
    },

    getReel: (id: string) => reels.find(r => r.id === id),

    canPostToday: (deviceId: string) => {
      const today = new Date().toDateString();
      const lastPost = localStorage.getItem(REEL_POST_KEY);
      if (lastPost === today) {
        return !reels.some(r => r.deviceId === deviceId);
      }
      return true;
    },

    getRemainingTime: (reel: Reel) => {
      const now = Date.now();
      const diff = reel.expiresAt.getTime() - now;
      if (diff <= 0) return '만료됨';
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const mins = Math.floor((diff % (60 * 60 * 1000)) / 60000);
      if (hours > 0) return `${hours}시간 ${mins}분`;
      return `${mins}분`;
    },

    refresh: fetchReels,
  };
}
