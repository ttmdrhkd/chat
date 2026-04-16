import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { uploadPostImage } from '@/lib/image-upload';

interface WritePostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string, imageUrl?: string) => void;
  nickname: string;
}

export default function WritePostDialog({ open, onClose, onSubmit, nickname }: WritePostDialogProps) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadPostImage(imageFile);
      }
      onSubmit(content.trim(), imageUrl);
      setContent('');
      setImageFile(null);
      setImagePreview(undefined);
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(undefined);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">글 작성하기</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full mint-gradient flex items-center justify-center text-primary-foreground text-[10px] font-bold">
              {nickname.charAt(0)}
            </div>
            <span className="text-sm font-medium text-foreground">{nickname}</span>
          </div>
          <Textarea
            placeholder="자유롭게 이야기를 나눠보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={1000}
          />
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="미리보기" className="rounded-lg max-h-48 object-cover w-full" />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <Button onClick={handleSubmit} disabled={!content.trim() || uploading}>
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> 업로드 중...</> : '게시하기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
