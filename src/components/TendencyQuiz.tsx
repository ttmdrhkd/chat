import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';

interface Question {
  text: string;
  options: { label: string; scores: Record<string, number> }[];
}

const QUESTIONS: Question[] = [
  {
    text: '관계에서 주도권을 잡는 것이 좋다?',
    options: [
      { label: '매우 그렇다', scores: { dom: 3 } },
      { label: '그렇다', scores: { dom: 1 } },
      { label: '상황에 따라 다르다', scores: { switch: 2 } },
      { label: '아니다', scores: { sub: 1 } },
      { label: '전혀 아니다', scores: { sub: 3 } },
    ],
  },
  {
    text: '상대방의 지시를 따르는 것이 편하다?',
    options: [
      { label: '매우 그렇다', scores: { sub: 3 } },
      { label: '그렇다', scores: { sub: 1 } },
      { label: '때에 따라 다르다', scores: { switch: 2 } },
      { label: '아니다', scores: { dom: 1 } },
      { label: '전혀 아니다', scores: { dom: 3 } },
    ],
  },
  {
    text: '상대를 가르치거나 훈육하는 역할에 끌린다?',
    options: [
      { label: '매우 그렇다', scores: { dom: 2, daddy: 2 } },
      { label: '그렇다', scores: { dom: 1, daddy: 1 } },
      { label: '보통이다', scores: { switch: 1 } },
      { label: '아니다', scores: { sub: 1 } },
    ],
  },
  {
    text: '장난치거나 반항하는 것이 재미있다?',
    options: [
      { label: '매우 그렇다', scores: { brat: 3 } },
      { label: '그렇다', scores: { brat: 1 } },
      { label: '보통이다', scores: { switch: 1 } },
      { label: '아니다', scores: { dom: 1 } },
    ],
  },
  {
    text: '약간의 고통이 쾌감으로 느껴진다?',
    options: [
      { label: '매우 그렇다', scores: { maso: 3 } },
      { label: '그렇다', scores: { maso: 1 } },
      { label: '모르겠다', scores: {} },
      { label: '아니다, 주는 쪽이 좋다', scores: { sadist: 2 } },
      { label: '둘 다 아니다', scores: {} },
    ],
  },
];

const RESULT_MAP: Record<string, string> = {
  dom: '도미넌트',
  sub: '서브미시브',
  switch: '스위치',
  daddy: '대디/마미',
  brat: '브랫',
  sadist: '새디스트',
  maso: '마조히스트',
};

interface Props {
  onResult: (tendency: string) => void;
}

export default function TendencyQuiz({ onResult }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string | null>(null);

  const reset = () => {
    setStep(0);
    setScores({});
    setResult(null);
  };

  const handleAnswer = (optionScores: Record<string, number>) => {
    const newScores = { ...scores };
    Object.entries(optionScores).forEach(([key, val]) => {
      newScores[key] = (newScores[key] || 0) + val;
    });
    setScores(newScores);

    if (step + 1 >= QUESTIONS.length) {
      const top = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0];
      const tendency = top ? RESULT_MAP[top[0]] || '스위치' : '스위치';
      setResult(tendency);
    } else {
      setStep(step + 1);
    }
  };

  const applyResult = () => {
    if (result) {
      onResult(result);
      setOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          성향 검사
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">간단 성향 검사</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 text-center py-4">
            <p className="text-sm text-muted-foreground">당신의 성향은</p>
            <p className="text-2xl font-bold text-primary">{result}</p>
            <p className="text-xs text-muted-foreground">* 간단 검사이므로 참고용입니다.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={reset}>다시 검사</Button>
              <Button size="sm" onClick={applyResult}>프로필에 적용</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{step + 1} / {QUESTIONS.length}</span>
              <div className="flex-1 mx-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">{QUESTIONS[step].text}</p>
            <div className="space-y-2">
              {QUESTIONS[step].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.scores)}
                  className="w-full text-left px-3 py-2.5 text-sm rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
