
-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, device_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read likes"
  ON public.likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owner can create likes"
  ON public.likes FOR INSERT TO authenticated
  WITH CHECK (device_id = auth.uid()::text);

CREATE POLICY "Owner can delete likes"
  ON public.likes FOR DELETE TO authenticated
  USING (device_id = auth.uid()::text);

-- Add delete policy for comments
CREATE POLICY "Owner can delete own comments"
  ON public.comments FOR DELETE TO authenticated
  USING (device_id = auth.uid()::text);

-- Create post-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "Owner can upload post images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner can delete post images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for likes
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
