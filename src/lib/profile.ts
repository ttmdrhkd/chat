export interface UserProfile {
  nickname: string;
  region: string;
  mbti: string;
  tendency: string;
  displayBadge: 'mbti' | 'tendency' | 'none';
  photos: string[]; // URLs from storage
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
  '없음', '도미넌트', '서브미시브', '스위치',
  '새디스트', '마조히스트',
  '대디/마미', '브랫', '브랫테이머',
  '바이', '게이', '레즈비언', '스트레이트',
  '궁금해요',
];

export function getProfile(): UserProfile {
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        nickname: parsed.nickname || '',
        region: parsed.region || '',
        mbti: parsed.mbti || '',
        tendency: parsed.tendency || '',
        displayBadge: parsed.displayBadge || 'none',
        photos: parsed.photos || [],
      };
    } catch {}
  }
  const nickname = localStorage.getItem('anon_nickname') || '';
  return { nickname, region: '', mbti: '', tendency: '', displayBadge: 'none', photos: [] };
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem('anon_nickname', profile.nickname);
}

export function getProfileBadge(): { label: string; value: string } | null {
  const profile = getProfile();
  if (profile.displayBadge === 'mbti' && profile.mbti) {
    return { label: 'MBTI', value: profile.mbti };
  }
  if (profile.displayBadge === 'tendency' && profile.tendency) {
    return { label: '성향', value: profile.tendency };
  }
  return null;
}

export { REGIONS, MBTI_TYPES, TENDENCIES };
