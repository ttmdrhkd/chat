import { RefreshCw, Save, X, Camera, ShieldOff } from 'lucide-react';
import { useState, useRef } from 'react';
import TendencyQuiz from '@/components/TendencyQuiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BottomNav from '@/components/BottomNav';
import { getDeviceId, generateNickname } from '@/lib/nickname';
import { getDailyMessageInfo } from '@/lib/supabase-store';
import { getProfile, saveProfile, REGIONS, MBTI_TYPES, TENDENCIES } from '@/lib/profile';
import { useBlocks } from '@/lib/blocks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MAX_PHOTOS = 3;

export default function Profile() {
  const deviceId = getDeviceId();
  const [profile, setProfile] = useState(getProfile);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgInfo = getDailyMessageInfo();
  const { blocks, unblockUser } = useBlocks();

  const update = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const regenerateNickname = () => {
    const newName = generateNickname();
    update('nickname', newName);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (profile.photos.length >= MAX_PHOTOS) {
      toast.error(`사진은 최대 ${MAX_PHOTOS}장까지 가능합니다.`);
      return;
    }

    setUploading(true);
    try {
      const file = files[0];
      const ext = file.name.split('.').pop();
      const path = `${deviceId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from('profile-photos').upload(path, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path);
      setProfile(prev => ({ ...prev, photos: [...prev.photos, urlData.publicUrl] }));
      toast.success('사진이 업로드되었습니다.');
    } catch (err: any) {
      toast.error('업로드 실패: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setProfile(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
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
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border safe-top">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">내 정보</h1>
          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="w-3.5 h-3.5" />
            저장
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Photos */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground">프로필 사진 (최대 {MAX_PHOTOS}장)</h2>
          <div className="flex gap-3 flex-wrap">
            {profile.photos.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                <img src={url} alt={`프로필 ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {profile.photos.length < MAX_PHOTOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {uploading ? (
                  <span className="text-xs">업로드중...</span>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px]">추가</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Profile fields */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground">프로필 설정</h2>

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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">성향</Label>
              <TendencyQuiz onResult={(t) => update('tendency', t)} />
            </div>
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

        {/* Display badge */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <h2 className="text-sm font-semibold text-foreground">피드에 표시할 정보</h2>
          <p className="text-xs text-muted-foreground">게시글/댓글에 아이디 옆에 표시됩니다.</p>
          <RadioGroup
            value={profile.displayBadge}
            onValueChange={v => update('displayBadge', v)}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="none" />
              <span className="text-sm text-foreground">표시 안함</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="mbti" />
              <span className="text-sm text-foreground">MBTI {profile.mbti && `(${profile.mbti})`}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="tendency" />
              <span className="text-sm text-foreground">성향 {profile.tendency && `(${profile.tendency})`}</span>
            </label>
          </RadioGroup>
        </div>

        {/* Message stats */}
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

        {/* Blocked users */}
        {blocks.length > 0 && (
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <h2 className="text-sm font-semibold text-foreground">차단 목록</h2>
            {blocks.map(block => (
              <div key={block.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{block.blockedDeviceId.slice(0, 8)}...</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  onClick={() => unblockUser(block.blockedDeviceId)}
                >
                  <ShieldOff className="w-3 h-3" /> 해제
                </Button>
              </div>
            ))}
          </div>
        )}

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
