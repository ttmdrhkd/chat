import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/nickname';

export interface Block {
  id: string;
  blockerDeviceId: string;
  blockedDeviceId: string;
  createdAt: Date;
}

export function useBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const myDeviceId = getDeviceId();

  const fetchBlocks = useCallback(async () => {
    const { data } = await supabase
      .from('blocks')
      .select('*')
      .eq('blocker_device_id', myDeviceId);

    if (data) {
      setBlocks(data.map((b: any) => ({
        id: b.id,
        blockerDeviceId: b.blocker_device_id,
        blockedDeviceId: b.blocked_device_id,
        createdAt: new Date(b.created_at),
      })));
    }
  }, [myDeviceId]);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  return {
    blocks,
    isBlocked: (deviceId: string) => blocks.some(b => b.blockedDeviceId === deviceId),
    blockUser: async (blockedDeviceId: string) => {
      await supabase.from('blocks').insert({
        blocker_device_id: myDeviceId,
        blocked_device_id: blockedDeviceId,
      });
      await fetchBlocks();
    },
    unblockUser: async (blockedDeviceId: string) => {
      await supabase.from('blocks')
        .delete()
        .eq('blocker_device_id', myDeviceId)
        .eq('blocked_device_id', blockedDeviceId);
      await fetchBlocks();
    },
    refresh: fetchBlocks,
  };
}

export async function reportUser(report: {
  reporterDeviceId: string;
  reportedDeviceId: string;
  reportType: 'post' | 'comment' | 'message' | 'reel' | 'user';
  relatedId?: string;
  reason: string;
}) {
  await supabase.from('reports').insert({
    reporter_device_id: report.reporterDeviceId,
    reported_device_id: report.reportedDeviceId,
    report_type: report.reportType,
    related_id: report.relatedId || null,
    reason: report.reason,
  });
}
