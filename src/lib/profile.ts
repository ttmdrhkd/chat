export interface UserProfile {
  nickname: string;
  region: string;
  mbti: string;
  tendency: string;
}

const PROFILE_KEY = 'anon_profile';

const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
];

const TENDENCIES = [
  '집돌이/집순이', '활동적', '감성적', '이성적', '유머러스',
  '조용한 편', '사교적', '모험적', '낭만적', '현실적',
];

export function getProfile(): UserProfile {
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  const nickname = localStorage.getItem('anon_nickname') || '';
  return { nickname, region: '', mbti: '', tendency: '' };
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem('anon_nickname', profile.nickname);
}

export { REGIONS, MBTI_TYPES, TENDENCIES };
