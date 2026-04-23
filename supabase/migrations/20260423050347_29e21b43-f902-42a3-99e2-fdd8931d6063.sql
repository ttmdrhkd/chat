
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_device_id TEXT NOT NULL,
  reported_device_id TEXT NOT NULL,
  report_type TEXT NOT NULL,
  related_id TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON public.reports(reported_device_id);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert reports" ON public.reports;
CREATE POLICY "Anyone can insert reports" ON public.reports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;
CREATE POLICY "Anyone can view reports" ON public.reports FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'auto_report_threshold',
  banned_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bans_device ON public.bans(device_id, banned_until DESC);
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view bans" ON public.bans;
CREATE POLICY "Anyone can view bans" ON public.bans FOR SELECT USING (true);
DROP POLICY IF EXISTS "System can insert bans" ON public.bans;
CREATE POLICY "System can insert bans" ON public.bans FOR INSERT WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_reports_per_target
  ON public.reports (reporter_device_id, reported_device_id, COALESCE(related_id, ''::text), report_type);

CREATE OR REPLACE FUNCTION public.check_auto_ban()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reporter_count INT;
  active_ban_count INT;
BEGIN
  SELECT COUNT(DISTINCT reporter_device_id)
    INTO reporter_count
    FROM public.reports
    WHERE reported_device_id = NEW.reported_device_id;

  IF reporter_count >= 3 THEN
    SELECT COUNT(*) INTO active_ban_count
      FROM public.bans
      WHERE device_id = NEW.reported_device_id
        AND banned_until > now();

    IF active_ban_count = 0 THEN
      INSERT INTO public.bans (device_id, reason, banned_until)
      VALUES (NEW.reported_device_id, 'auto_report_threshold', now() + INTERVAL '3 days');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reports_auto_ban ON public.reports;
CREATE TRIGGER trg_reports_auto_ban
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.check_auto_ban();
