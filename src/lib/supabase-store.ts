import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, getNickname } from '@/lib/nickname';

// Types matching the old in-memory store
export interface Post {
  id: string;
  deviceId: string;
  nickname: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  comments: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  deviceId: string;
  nickname: string;
  content: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  fromDeviceId: string;
  fromNickname: string;
  toDeviceId: string;
  toNickname: string;
  postId: string;
  content: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface ChatRoom {
  id: string;
  messageId: string;
  participants: string[];
  nicknames: string[];
  messages: ChatMessage[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  deviceId: string;
  nickname: string;
  content: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  deviceId: string;
  type: 'comment' | 'message_request' | 'message_accepted';
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  relatedId?: string;
}

// Daily message limit (kept in localStorage)
const MESSAGE_LIMIT_KEY = 'daily_message_count';
const MESSAGE_DATE_KEY = 'daily_message_date';

export function getDailyMessageInfo(): { count: number; canSend: boolean; watchedAd: boolean } {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem(MESSAGE_DATE_KEY);
  if (savedDate !== today) {
    localStorage.setItem(MESSAGE_DATE_KEY, today);
    localStorage.setItem(MESSAGE_LIMIT_KEY, '0');
    localStorage.setItem('watched_ad_today', 'false');
    return { count: 0, canSend: true, watchedAd: false };
  }
  const count = parseInt(localStorage.getItem(MESSAGE_LIMIT_KEY) || '0');
  const watchedAd = localStorage.getItem('watched_ad_today') === 'true';
  return { count, canSend: count === 0 || (count === 1 && watchedAd), watchedAd };
}

export function incrementMessageCount() {
  const today = new Date().toDateString();
  localStorage.setItem(MESSAGE_DATE_KEY, today);
  const count = parseInt(localStorage.getItem(MESSAGE_LIMIT_KEY) || '0');
  localStorage.setItem(MESSAGE_LIMIT_KEY, String(count + 1));
}

export function markAdWatched() {
  localStorage.setItem('watched_ad_today', 'true');
}

// ========== Blocked users helper ==========
async function getBlockedDeviceIds(myDeviceId: string): Promise<string[]> {
  const { data } = await supabase
    .from('blocks')
    .select('blocked_device_id')
    .eq('blocker_device_id', myDeviceId);
  return (data || []).map((b: any) => b.blocked_device_id);
}

// ========== POSTS ==========
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const myDeviceId = getDeviceId();

  const fetchPosts = useCallback(async () => {
    const blocked = await getBlockedDeviceIds(myDeviceId);
    setBlockedIds(blocked);

    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!postsData) return;

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    const commentsByPost: Record<string, Comment[]> = {};
    (commentsData || []).forEach((c: any) => {
      if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
      commentsByPost[c.post_id].push({
        id: c.id,
        postId: c.post_id,
        deviceId: c.device_id,
        nickname: c.nickname,
        content: c.content,
        createdAt: new Date(c.created_at),
      });
    });

    const mapped: Post[] = postsData
      .filter((p: any) => !blocked.includes(p.device_id))
      .map((p: any) => ({
        id: p.id,
        deviceId: p.device_id,
        nickname: p.nickname,
        content: p.content,
        imageUrl: p.image_url || undefined,
        createdAt: new Date(p.created_at),
        comments: (commentsByPost[p.id] || []).filter(c => !blocked.includes(c.deviceId)),
      }));

    setPosts(mapped);
  }, [myDeviceId]);

  useEffect(() => {
    fetchPosts();

    const channelName = `posts-realtime-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  return {
    posts,
    addPost: async (post: { deviceId: string; nickname: string; content: string; imageUrl?: string }) => {
      await supabase.from('posts').insert({
        device_id: post.deviceId,
        nickname: post.nickname,
        content: post.content,
        image_url: post.imageUrl || null,
      });
    },
    addComment: async (postId: string, comment: { deviceId: string; nickname: string; content: string }) => {
      await supabase.from('comments').insert({
        post_id: postId,
        device_id: comment.deviceId,
        nickname: comment.nickname,
        content: comment.content,
      });

      // Find the post to notify the author
      const post = posts.find(p => p.id === postId);
      if (post && comment.deviceId !== post.deviceId) {
        await supabase.from('notifications').insert({
          device_id: post.deviceId,
          type: 'comment',
          title: '새 댓글',
          body: `${comment.nickname}님이 댓글을 남겼습니다.`,
          related_id: postId,
        });
      }
    },
    getPost: (id: string) => posts.find(p => p.id === id),
    refresh: fetchPosts,
  };
}

// ========== MESSAGES ==========
export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const myDeviceId = getDeviceId();

  const fetchMessages = useCallback(async () => {
    const blocked = await getBlockedDeviceIds(myDeviceId);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setMessages(
        data
          .filter((m: any) => !blocked.includes(m.from_device_id) && !blocked.includes(m.to_device_id))
          .map((m: any) => ({
            id: m.id,
            fromDeviceId: m.from_device_id,
            fromNickname: m.from_nickname,
            toDeviceId: m.to_device_id,
            toNickname: m.to_nickname,
            postId: m.post_id,
            content: m.content,
            status: m.status as 'pending' | 'accepted' | 'rejected',
            createdAt: new Date(m.created_at),
          }))
      );
    }
  }, [myDeviceId]);

  useEffect(() => {
    fetchMessages();
    const channelName = `messages-realtime-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchMessages]);

  return {
    messages,
    sendMessage: async (msg: Omit<Message, 'id' | 'createdAt' | 'status'>) => {
      const { data } = await supabase.from('messages').insert({
        from_device_id: msg.fromDeviceId,
        from_nickname: msg.fromNickname,
        to_device_id: msg.toDeviceId,
        to_nickname: msg.toNickname,
        post_id: msg.postId,
        content: msg.content,
      }).select().single();

      incrementMessageCount();

      if (data) {
        await supabase.from('notifications').insert({
          device_id: msg.toDeviceId,
          type: 'message_request',
          title: '새 쪽지 요청',
          body: `${msg.fromNickname}님이 쪽지를 보냈습니다.`,
          related_id: data.id,
        });
      }
    },
    acceptMessage: async (msgId: string) => {
      const msg = messages.find(m => m.id === msgId);
      if (!msg) return;

      await supabase.from('messages').update({ status: 'accepted' }).eq('id', msgId);

      const { data: room } = await supabase.from('chat_rooms').insert({
        message_id: msgId,
        participants: [msg.fromDeviceId, msg.toDeviceId],
        nicknames: [msg.fromNickname, msg.toNickname],
      }).select().single();

      if (room) {
        await supabase.from('notifications').insert({
          device_id: msg.fromDeviceId,
          type: 'message_accepted',
          title: '쪽지 수락됨',
          body: `${msg.toNickname}님이 쪽지를 수락했습니다. 채팅을 시작하세요!`,
          related_id: room.id,
        });
        return { id: room.id } as ChatRoom;
      }
    },
    rejectMessage: async (msgId: string) => {
      await supabase.from('messages').update({ status: 'rejected' }).eq('id', msgId);
    },
    getReceivedMessages: (deviceId: string) => messages.filter(m => m.toDeviceId === deviceId),
    getSentMessages: (deviceId: string) => messages.filter(m => m.fromDeviceId === deviceId),
    refresh: fetchMessages,
  };
}

// ========== CHAT ROOMS ==========
export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const myDeviceId = getDeviceId();

  const fetchRooms = useCallback(async () => {
    const blocked = await getBlockedDeviceIds(myDeviceId);
    const { data: roomsData } = await supabase
      .from('chat_rooms')
      .select('*')
      .contains('participants', [myDeviceId])
      .order('created_at', { ascending: false });

    if (!roomsData) return;

    const { data: chatMsgs } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    const msgsByRoom: Record<string, ChatMessage[]> = {};
    (chatMsgs || []).forEach((m: any) => {
      if (!msgsByRoom[m.room_id]) msgsByRoom[m.room_id] = [];
      msgsByRoom[m.room_id].push({
        id: m.id,
        roomId: m.room_id,
        deviceId: m.device_id,
        nickname: m.nickname,
        content: m.content,
        createdAt: new Date(m.created_at),
      });
    });

    setRooms(
      roomsData
        .filter((r: any) => {
          const otherParticipants = (r.participants || []).filter((p: string) => p !== myDeviceId);
          return !otherParticipants.some((p: string) => blocked.includes(p));
        })
        .map((r: any) => ({
          id: r.id,
          messageId: r.message_id,
          participants: r.participants || [],
          nicknames: r.nicknames || [],
          messages: msgsByRoom[r.id] || [],
          createdAt: new Date(r.created_at),
        }))
    );
  }, [myDeviceId]);

  useEffect(() => {
    fetchRooms();
    const channelName = `chatrooms-realtime-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => fetchRooms())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => fetchRooms())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRooms]);

  return {
    rooms,
    getRoom: (id: string) => rooms.find(r => r.id === id),
    getUserRooms: (deviceId: string) => rooms.filter(r => r.participants.includes(deviceId)),
    sendChat: async (roomId: string, msg: { deviceId: string; nickname: string; content: string }) => {
      await supabase.from('chat_messages').insert({
        room_id: roomId,
        device_id: msg.deviceId,
        nickname: msg.nickname,
        content: msg.content,
      });
    },
    refresh: fetchRooms,
  };
}

// ========== NOTIFICATIONS ==========
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const myDeviceId = getDeviceId();

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('device_id', myDeviceId)
      .order('created_at', { ascending: false });

    if (data) {
      setNotifications(
        data.map((n: any) => ({
          id: n.id,
          deviceId: n.device_id,
          type: n.type as 'comment' | 'message_request' | 'message_accepted',
          title: n.title,
          body: n.body,
          read: n.read,
          createdAt: new Date(n.created_at),
          relatedId: n.related_id || undefined,
        }))
      );
    }
  }, [myDeviceId]);

  useEffect(() => {
    fetchNotifications();
    const channelName = `notifications-realtime-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  return {
    notifications,
    getUserNotifications: (deviceId: string) => notifications.filter(n => n.deviceId === deviceId),
    unreadCount: (deviceId: string) => notifications.filter(n => n.deviceId === deviceId && !n.read).length,
    markRead: async (id: string) => {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    },
    markAllRead: async (deviceId: string) => {
      await supabase.from('notifications').update({ read: true }).eq('device_id', deviceId).eq('read', false);
      setNotifications(prev => prev.map(n => n.deviceId === deviceId ? { ...n, read: true } : n));
    },
    refresh: fetchNotifications,
  };
}
