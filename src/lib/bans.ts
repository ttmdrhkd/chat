import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/nickname';

export interface BanInfo {
  banned: boolean;
  bannedUntil: Date | null;
  reason: string | null;
}

export async function fetchBan(deviceId: string): Promise<BanInfo> {
  const { data } = await supabase
    .from('bans')
    .select('*')
    .eq('device_id', deviceId)
    .gt('banned_until', new Date().toISOString())
    .order('banned_until', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return { banned: false, bannedUntil: null, reason: null };
  return { banned: true, bannedUntil: new Date(data.banned_until), reason: data.reason };
}

export function useMyBan() {
  const [info, setInfo] = useState<BanInfo>({ banned: false, bannedUntil: null, reason: null });
  const [loading, setLoading] = useState(true);
  const myDeviceId = getDeviceId();

  const refresh = useCallback(async () => {
    const result = await fetchBan(myDeviceId);
    setInfo(result);
    setLoading(false);
  }, [myDeviceId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { ...info, loading, refresh };
}
