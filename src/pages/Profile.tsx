import { RefreshCw, Save, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BottomNav from '@/components/BottomNav';
import { getDeviceId, generateNickname } from '@/lib/nickname';
import { getDailyMessageInfo } from '@/lib/store';
import { getProfile, saveProfile, REGIONS, MBTI_TYPES, TENDENCIES } from '@/lib/profile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Profile() {
  const deviceId = getDeviceId();
  const [profile, setProfile] = useState(getProfile);
  const msgInfo = getDailyMessageInfo();

  const update = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const regenerateNickname = () => {
    const newName = generateNickname();
    update('nickname', newName);
  };

  const handleSave = () => {
    if (!profile.nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }
    saveProfile(profile);
    toast.success('프로필이 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">내 정보</h1>
          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="w-3.5 h-3.5" />
            저장
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full mint-gradient flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {profile.nickname.charAt(0) || '?'}
          </div>
          <p className="text-xs text-muted-foreground">익명 사용자</p>
        </div>

        {/* Profile fields */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">프로필 설정</h2>

          {/* Nickname */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">닉네임</Label>
            <div className="flex gap-2">
              <Input
                value={profile.nickname}
                onChange={e => update('nickname', e.target.value)}
                placeholder="닉네임을 입력하세요"
                maxLength={20}
                className="flex-1 text-sm"
              />
              <Button variant="outline" size="icon" onClick={regenerateNickname} title="랜덤 닉네임">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Region */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">지역</Label>
            <Select value={profile.region} onValueChange={v => update('region', v)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="지역을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* MBTI */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">MBTI</Label>
            <Select value={profile.mbti} onValueChange={v => update('mbti', v)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="MBTI를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {MBTI_TYPES.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tendency */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">성향</Label>
            <Select value={profile.tendency} onValueChange={v => update('tendency', v)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="성향을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {TENDENCIES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground">오늘의 쪽지</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">사용한 쪽지</span>
            <span className="text-sm font-medium text-foreground">{msgInfo.count}회</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">무료 쪽지 잔여</span>
            <span className="text-sm font-medium text-foreground">{Math.max(0, 1 - msgInfo.count)}회</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">광고 시청 추가</span>
            <span className="text-sm font-medium text-foreground">{msgInfo.watchedAd ? '사용 완료' : '사용 가능'}</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            기기 ID 기반 익명 서비스입니다.<br />
            앱을 삭제하면 데이터가 초기화될 수 있습니다.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
