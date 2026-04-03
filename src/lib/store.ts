import { useState, useCallback } from 'react';
import { getDeviceId, getNickname } from '@/lib/nickname';

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
const DEMO_OTHER = 'demo-user-other';
const DEMO_OTHER_NICK = '신비한 고양이';

const now = new Date();
const ago = (min: number) => new Date(now.getTime() - min * 60000);

let posts: Post[] = [];
let messages: Message[] = [];
let chatRooms: ChatRoom[] = [];
let notifications: Notification[] = [];
let demoSeeded = false;

function seedDemo() {
  if (demoSeeded) return;
  demoSeeded = true;

  const myId = getDeviceId();
  const myNick = getNickname();

  const demoMsgId = 'demo-msg-1';
  const demoChatRoomId = 'demo-chat-1';

  posts = [
    {
      id: 'demo-post-1',
      deviceId: DEMO_OTHER,
      nickname: DEMO_OTHER_NICK,
      content: '오늘 처음 가입했는데 다들 반가워요 😊\n취미가 비슷한 분 있으면 이야기 나눠봐요~',
      createdAt: ago(30),
      comments: [
        { id: 'demo-c1', postId: 'demo-post-1', deviceId: myId, nickname: myNick, content: '반가워요! 저도 오늘 가입했어요 ㅎㅎ', createdAt: ago(25) },
      ],
    },
    {
      id: 'demo-post-2',
      deviceId: DEMO_OTHER,
      nickname: DEMO_OTHER_NICK,
      content: '주말에 같이 이야기할 사람 구해요~\n편하게 연락 주세요 :)',
      createdAt: ago(15),
      comments: [],
    },
    {
      id: 'demo-post-3',
      deviceId: myId,
      nickname: myNick,
      content: '성향 검사 해봤는데 스위치래요 ㅋㅋ 다들 해보세요!',
      createdAt: ago(5),
      comments: [
        { id: 'demo-c2', postId: 'demo-post-3', deviceId: DEMO_OTHER, nickname: DEMO_OTHER_NICK, content: '저도 해봐야겠다!', createdAt: ago(3) },
      ],
    },
  ];

  messages = [
    {
      id: demoMsgId,
      fromDeviceId: DEMO_OTHER,
      fromNickname: DEMO_OTHER_NICK,
      toDeviceId: myId,
      toNickname: myNick,
      postId: 'demo-post-3',
      content: '안녕하세요! 이야기 나눠보고 싶어서 쪽지 보내요 😊',
      status: 'accepted',
      createdAt: ago(10),
    },
    {
      id: 'demo-msg-2',
      fromDeviceId: 'demo-user-zzz',
      fromNickname: '활발한 다람쥐',
      toDeviceId: myId,
      toNickname: myNick,
      postId: 'demo-post-3',
      content: '혹시 대화 가능하신가요?',
      status: 'pending',
      createdAt: ago(2),
    },
  ];

  chatRooms = [
    {
      id: demoChatRoomId,
      messageId: demoMsgId,
      participants: [DEMO_OTHER, myId],
      nicknames: [DEMO_OTHER_NICK, myNick],
      messages: [
        { id: 'demo-chat-msg-1', roomId: demoChatRoomId, deviceId: DEMO_OTHER, nickname: DEMO_OTHER_NICK, content: '쪽지 수락해줘서 고마워요!', createdAt: ago(8) },
        { id: 'demo-chat-msg-2', roomId: demoChatRoomId, deviceId: myId, nickname: myNick, content: '반가워요~ 편하게 말해요 ㅎㅎ', createdAt: ago(7) },
        { id: 'demo-chat-msg-3', roomId: demoChatRoomId, deviceId: DEMO_OTHER, nickname: DEMO_OTHER_NICK, content: '주말에 뭐 하세요?', createdAt: ago(5) },
      ],
      createdAt: ago(9),
    },
  ];

  notifications = [
    {
      id: 'demo-notif-1',
      deviceId: myId,
      type: 'message_request',
      title: '새 쪽지 요청',
      body: '활발한 다람쥐님이 쪽지를 보냈습니다.',
      read: false,
      createdAt: ago(2),
      relatedId: 'demo-msg-2',
    },
    {
      id: 'demo-notif-2',
      deviceId: myId,
      type: 'comment',
      title: '새 댓글',
      body: `${DEMO_OTHER_NICK}님이 댓글을 남겼습니다.`,
      read: false,
      createdAt: ago(3),
      relatedId: 'demo-post-3',
    },
  ];
}

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
  seedDemo();
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
  seedDemo();
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
  seedDemo();
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
