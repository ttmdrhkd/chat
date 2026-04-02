import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { getDeviceId, getNickname, generateNickname } from '@/lib/nickname';
import { getDailyMessageInfo } from '@/lib/store';

export default function Profile() {
  const deviceId = getDeviceId();
  const [nickname, setNickname] = useState(getNickname());
  const msgInfo = getDailyMessageInfo();

  const regenerateNickname = () => {
    const newName = generateNickname();
    localStorage.setItem('anon_nickname', newName);
    setNickname(newName);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-foreground">내 정보</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Avatar & nickname */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full mint-gradient flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {nickname.charAt(0)}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{nickname}</p>
            <p className="text-xs text-muted-foreground mt-0.5">익명 사용자</p>
          </div>
          <Button variant="outline" size="sm" onClick={regenerateNickname} className="gap-1.5 text-xs">
            <RefreshCw className="w-3 h-3" />
            닉네임 변경
          </Button>
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
