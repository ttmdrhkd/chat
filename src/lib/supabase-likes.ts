import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/nickname';

export interface LikeInfo {
  count: number;
  liked: boolean;
}

export function useLikes() {
  const [likesMap, setLikesMap] = useState<Record<string, { count: number; devices: string[] }>>({});
  const myDeviceId = getDeviceId();

  const fetchLikes = useCallback(async () => {
    const { data } = await supabase
      .from('likes')
      .select('post_id, device_id');

    if (!data) return;

    const map: Record<string, { count: number; devices: string[] }> = {};
    data.forEach((l: any) => {
      if (!map[l.post_id]) map[l.post_id] = { count: 0, devices: [] };
      map[l.post_id].count++;
      map[l.post_id].devices.push(l.device_id);
    });
    setLikesMap(map);
  }, []);

  useEffect(() => {
    fetchLikes();
    const channel = supabase.channel(`likes-realtime-${crypto.randomUUID()}`);
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => fetchLikes());
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLikes]);

  return {
    getLikeInfo: (postId: string): LikeInfo => {
      const info = likesMap[postId];
      return {
        count: info?.count || 0,
        liked: info?.devices.includes(myDeviceId) || false,
      };
    },
    toggleLike: async (postId: string) => {
      const info = likesMap[postId];
      const liked = info?.devices.includes(myDeviceId) || false;

      if (liked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('device_id', myDeviceId);
      } else {
        await supabase.from('likes').insert({ post_id: postId, device_id: myDeviceId });
      }
    },
    refresh: fetchLikes,
  };
}
