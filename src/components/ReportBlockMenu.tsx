import { useState } from 'react';
import { MoreVertical, Flag, Ban, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useBlocks, reportUser } from '@/lib/blocks';
import { getDeviceId } from '@/lib/nickname';
import { toast } from 'sonner';

interface ReportBlockMenuProps {
  targetDeviceId: string;
  targetNickname: string;
  reportType: 'post' | 'comment' | 'message' | 'reel' | 'user';
  relatedId?: string;
}

const REPORT_REASONS = [
  '스팸/광고',
  '욕설/비방',
  '성적 콘텐츠',
  '사기/사칭',
  '개인정보 노출',
  '기타',
];

export default function ReportBlockMenu({ targetDeviceId, targetNickname, reportType, relatedId }: ReportBlockMenuProps) {
  const myDeviceId = getDeviceId();
  const { isBlocked, blockUser, unblockUser } = useBlocks();
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const blocked = isBlocked(targetDeviceId);

  if (targetDeviceId === myDeviceId) return null;

  const handleReport = async () => {
    if (!reason) {
      toast.error('신고 사유를 선택해주세요.');
      return;
    }
    await reportUser({
      reporterDeviceId: myDeviceId,
      reportedDeviceId: targetDeviceId,
      reportType,
      relatedId,
      reason: detail ? `${reason}: ${detail}` : reason,
    });
    toast.success('신고가 접수되었습니다.');
    setShowReport(false);
    setReason('');
    setDetail('');
  };

  const handleBlock = async () => {
    if (blocked) {
      await unblockUser(targetDeviceId);
      toast.success(`${targetNickname}님의 차단을 해제했습니다.`);
    } else {
      await blockUser(targetDeviceId);
      toast.success(`${targetNickname}님을 차단했습니다.`);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setShowReport(true)} className="gap-2 text-sm">
            <Flag className="w-4 h-4" />
            신고하기
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBlock} className="gap-2 text-sm">
            {blocked ? (
              <>
                <ShieldOff className="w-4 h-4" />
                차단 해제
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" />
                차단하기
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>신고하기</DialogTitle>
            <DialogDescription>
              {targetNickname}님을 신고합니다. 사유를 선택해주세요.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
            {REPORT_REASONS.map(r => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={r} />
                <span className="text-sm">{r}</span>
              </label>
            ))}
          </RadioGroup>
          {reason === '기타' && (
            <Textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="상세 사유를 입력해주세요..."
              maxLength={300}
              className="resize-none"
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowReport(false)}>취소</Button>
            <Button size="sm" onClick={handleReport} disabled={!reason} variant="destructive">신고</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
