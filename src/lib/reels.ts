import { useState, useCallback, useEffect } from 'react';

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

const REEL_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
const REEL_POST_KEY = 'reel_last_post_date';

let reels: Reel[] = [];
let reelSeeded = false;

function seedDemoReels() {
  if (reelSeeded) return;
  reelSeeded = true;

  const now = new Date();
  reels = [
    {
      id: 'demo-reel-1',
      deviceId: 'demo-user-other',
      nickname: '신비한 고양이',
      content: '오늘 날씨 너무 좋다 ☀️\n산책 가고 싶은 사람~?',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      comments: [
        { id: 'demo-rc-1', reelId: 'demo-reel-1', deviceId: 'demo-user-zzz', nickname: '활발한 다람쥐', content: '저도 산책 가고 싶어요!', createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000) },
      ],
    },
    {
      id: 'demo-reel-2',
      deviceId: 'demo-user-zzz',
      nickname: '활발한 다람쥐',
      content: '새로 가입했어요!\n잘 부탁드립니다 😊',
      imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=300&fit=crop',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      comments: [],
    },
  ];
}

function cleanExpired() {
  const now = new Date();
  reels = reels.filter(r => r.expiresAt.getTime() > now.getTime());
}

export function useReels() {
  seedDemoReels();
  const [, setUpdate] = useState(0);
  const refresh = useCallback(() => setUpdate(v => v + 1), []);

  useEffect(() => {
    const interval = setInterval(() => {
      const before = reels.length;
      cleanExpired();
      if (reels.length !== before) refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  cleanExpired();

  return {
    reels: [...reels].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),

    addReel: (reel: Omit<Reel, 'id' | 'createdAt' | 'expiresAt' | 'comments'>) => {
      const now = new Date();
      reels.push({
        ...reel,
        id: crypto.randomUUID(),
        createdAt: now,
        expiresAt: new Date(now.getTime() + REEL_DURATION_MS),
        comments: [],
      });
      localStorage.setItem(REEL_POST_KEY, now.toDateString());
      refresh();
    },

    addReelComment: (reelId: string, comment: Omit<ReelComment, 'id' | 'createdAt' | 'reelId'>) => {
      const reel = reels.find(r => r.id === reelId);
      if (reel) {
        reel.comments.push({ ...comment, id: crypto.randomUUID(), reelId, createdAt: new Date() });
        refresh();
      }
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

    refresh,
  };
}
