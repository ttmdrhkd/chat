import { getCachedUserId } from '@/lib/auth';

const adjectives = [
  '행복한', '지혜로운', '용감한', '귀여운', '씩씩한', '따뜻한', '빛나는', '졸린',
  '신비한', '활발한', '조용한', '재빠른', '느긋한', '장난꾸러기', '수줍은', '당당한',
  '순수한', '멋진', '다정한', '영리한', '꿈꾸는', '힘찬', '유쾌한', '점잖은',
];

const animals = [
  '고양이', '올빼미', '토끼', '여우', '곰', '펭귄', '강아지', '다람쥐',
  '코알라', '판다', '수달', '사슴', '돌고래', '햄스터', '부엉이', '나비',
  '호랑이', '두루미', '고슴도치', '앵무새', '거북이', '카멜레온',
];

export function generateNickname(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adj} ${animal}`;
}

const NICKNAME_KEY = 'anon_nickname';

/**
 * Returns the authenticated user's ID (auth.uid()).
 * Must be called after AuthGate has initialized auth.
 */
export function getDeviceId(): string {
  const userId = getCachedUserId();
  if (!userId) {
    throw new Error('Auth not initialized. Ensure AuthGate wraps the app.');
  }
  return userId;
}

export function getNickname(): string {
  let name = localStorage.getItem(NICKNAME_KEY);
  if (!name) {
    name = generateNickname();
    localStorage.setItem(NICKNAME_KEY, name);
  }
  return name;
}
