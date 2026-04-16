import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/nickname';

export async function uploadPostImage(file: File): Promise<string> {
  const deviceId = getDeviceId();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${deviceId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('post-images')
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from('post-images').getPublicUrl(path);
  return data.publicUrl;
}
