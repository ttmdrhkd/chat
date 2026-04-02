import { useState, useCallback } from 'react';

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

// In-memory store for demo (will be replaced with Supabase)
let posts: Post[] = [];
let messages: Message[] = [];
let chatRooms: ChatRoom[] = [];
let notifications: Notification[] = [];

// Daily message limit
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

export function usePosts() {
  const [, setUpdate] = useState(0);
  const refresh = useCallback(() => setUpdate(v => v + 1), []);

  return {
    posts: [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    addPost: (post: Omit<Post, 'id' | 'createdAt' | 'comments'>) => {
      posts.push({ ...post, id: crypto.randomUUID(), createdAt: new Date(), comments: [] });
      refresh();
    },
    addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'postId'>, onNotify?: (n: Notification) => void) => {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const c: Comment = { ...comment, id: crypto.randomUUID(), postId, createdAt: new Date() };
        post.comments.push(c);
        if (onNotify && comment.deviceId !== post.deviceId) {
          const n: Notification = {
            id: crypto.randomUUID(),
            deviceId: post.deviceId,
            type: 'comment',
            title: '새 댓글',
            body: `${comment.nickname}님이 댓글을 남겼습니다.`,
            read: false,
            createdAt: new Date(),
            relatedId: postId,
          };
          notifications.push(n);
          onNotify(n);
        }
        refresh();
      }
    },
    getPost: (id: string) => posts.find(p => p.id === id),
    refresh,
  };
}

export function useMessages() {
  const [, setUpdate] = useState(0);
  const refresh = useCallback(() => setUpdate(v => v + 1), []);

  return {
    messages: [...messages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    sendMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'status'>) => {
      const m: Message = { ...msg, id: crypto.randomUUID(), status: 'pending', createdAt: new Date() };
      messages.push(m);
      incrementMessageCount();
      const n: Notification = {
        id: crypto.randomUUID(),
        deviceId: msg.toDeviceId,
        type: 'message_request',
        title: '새 쪽지 요청',
        body: `${msg.fromNickname}님이 쪽지를 보냈습니다.`,
        read: false,
        createdAt: new Date(),
        relatedId: m.id,
      };
      notifications.push(n);
      refresh();
      return m;
    },
    acceptMessage: (msgId: string) => {
      const msg = messages.find(m => m.id === msgId);
      if (msg) {
        msg.status = 'accepted';
        const room: ChatRoom = {
          id: crypto.randomUUID(),
          messageId: msgId,
          participants: [msg.fromDeviceId, msg.toDeviceId],
          nicknames: [msg.fromNickname, msg.toNickname],
          messages: [],
          createdAt: new Date(),
        };
        chatRooms.push(room);
        const n: Notification = {
          id: crypto.randomUUID(),
          deviceId: msg.fromDeviceId,
          type: 'message_accepted',
          title: '쪽지 수락됨',
          body: `${msg.toNickname}님이 쪽지를 수락했습니다. 채팅을 시작하세요!`,
          read: false,
          createdAt: new Date(),
          relatedId: room.id,
        };
        notifications.push(n);
        refresh();
        return room;
      }
    },
    rejectMessage: (msgId: string) => {
      const msg = messages.find(m => m.id === msgId);
      if (msg) {
        msg.status = 'rejected';
        refresh();
      }
    },
    getReceivedMessages: (deviceId: string) => messages.filter(m => m.toDeviceId === deviceId),
    getSentMessages: (deviceId: string) => messages.filter(m => m.fromDeviceId === deviceId),
    refresh,
  };
}

export function useChatRooms() {
  const [, setUpdate] = useState(0);
  const refresh = useCallback(() => setUpdate(v => v + 1), []);

  return {
    rooms: chatRooms,
    getRoom: (id: string) => chatRooms.find(r => r.id === id),
    getUserRooms: (deviceId: string) => chatRooms.filter(r => r.participants.includes(deviceId)),
    sendChat: (roomId: string, msg: Omit<ChatMessage, 'id' | 'createdAt' | 'roomId'>) => {
      const room = chatRooms.find(r => r.id === roomId);
      if (room) {
        room.messages.push({ ...msg, id: crypto.randomUUID(), roomId, createdAt: new Date() });
        refresh();
      }
    },
    refresh,
  };
}

export function useNotifications() {
  const [, setUpdate] = useState(0);
  const refresh = useCallback(() => setUpdate(v => v + 1), []);

  return {
    notifications: [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    getUserNotifications: (deviceId: string) => notifications.filter(n => n.deviceId === deviceId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    unreadCount: (deviceId: string) => notifications.filter(n => n.deviceId === deviceId && !n.read).length,
    markRead: (id: string) => {
      const n = notifications.find(n => n.id === id);
      if (n) { n.read = true; refresh(); }
    },
    markAllRead: (deviceId: string) => {
      notifications.filter(n => n.deviceId === deviceId).forEach(n => { n.read = true; });
      refresh();
    },
    refresh,
  };
}
