
-- =============================================
-- DROP ALL EXISTING PERMISSIVE POLICIES
-- =============================================

-- posts
DROP POLICY IF EXISTS "Anyone can create posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can read posts" ON public.posts;

-- comments
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;

-- messages
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.messages;

-- chat_rooms
DROP POLICY IF EXISTS "Anyone can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Anyone can read chat rooms" ON public.chat_rooms;

-- chat_messages
DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can send chat messages" ON public.chat_messages;

-- notifications
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON public.notifications;

-- blocks
DROP POLICY IF EXISTS "Anyone can create blocks" ON public.blocks;
DROP POLICY IF EXISTS "Anyone can delete blocks" ON public.blocks;
DROP POLICY IF EXISTS "Anyone can read blocks" ON public.blocks;

-- reports
DROP POLICY IF EXISTS "Anyone can create reports" ON public.reports;
DROP POLICY IF EXISTS "Anyone can read own reports" ON public.reports;

-- profiles
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update own profile" ON public.profiles;

-- reels
DROP POLICY IF EXISTS "Anyone can create reels" ON public.reels;
DROP POLICY IF EXISTS "Anyone can read reels" ON public.reels;

-- reel_comments
DROP POLICY IF EXISTS "Anyone can create reel comments" ON public.reel_comments;
DROP POLICY IF EXISTS "Anyone can read reel comments" ON public.reel_comments;

-- =============================================
-- NEW POLICIES: posts (public read, owner write/delete)
-- =============================================
CREATE POLICY "Anyone authenticated can read posts" ON public.posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner can create posts" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (device_id = auth.uid()::text);

CREATE POLICY "Owner can delete own posts" ON public.posts
  FOR DELETE TO authenticated
  USING (device_id = auth.uid()::text);

-- =============================================
-- NEW POLICIES: comments (public read, owner write)
-- =============================================
CREATE POLICY "Anyone authenticated can read comments" ON public.comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner can create comments" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (device_id = auth.uid()::text);

-- =============================================
-- NEW POLICIES: messages (participants only)
-- =============================================
CREATE POLICY "Participants can read messages" ON public.messages
  FOR SELECT TO authenticated
  USING (from_device_id = auth.uid()::text OR to_device_id = auth.uid()::text);

CREATE POLICY "Sender can create messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (from_device_id = auth.uid()::text);

CREATE POLICY "Recipient can update message status" ON public.messages
  FOR UPDATE TO authenticated
  USING (to_device_id = auth.uid()::text);

-- =============================================
-- NEW POLICIES: chat_rooms (participants only)
-- =============================================
CREATE POLICY "Participants can read chat rooms" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING (auth.uid()::text = ANY(participants));

CREATE POLICY "Authenticated can create chat rooms" ON public.chat_rooms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = ANY(participants));

-- =============================================
-- NEW POLICIES: chat_messages (room participants)
-- =============================================
CREATE POLICY "Authenticated can read chat messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = chat_messages.room_id
    AND auth.uid()::text = ANY(chat_rooms.participants)
  ));

CREATE POLICY "Authenticated can send chat messages" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (device_id = auth.uid()::text AND EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = room_id
    AND auth.uid()::text = ANY(chat_rooms.participants)
  ));

-- =============================================
-- NEW POLICIES: notifications (owner only)
-- =============================================
CREATE POLICY "Owner can read notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (device_id = auth.uid()::text);

CREATE POLICY "Authenticated can create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owner can update notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (device_id = auth.uid()::text);

-- =============================================
-- NEW POLICIES: blocks (owner only)
-- =============================================
CREATE POLICY "Owner can read blocks" ON public.blocks
  FOR SELECT TO authenticated
  USING (blocker_device_id = auth.uid()::text);

CREATE POLICY "Owner can create blocks" ON public.blocks
  FOR INSERT TO authenticated
  WITH CHECK (blocker_device_id = auth.uid()::text);

CREATE POLICY "Owner can delete blocks" ON public.blocks
  FOR DELETE TO authenticated
  USING (blocker_device_id = auth.uid()::text);

-- =============================================
-- NEW POLICIES: reports (reporter only)
-- =============================================
CREATE POLICY "Reporter can create reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_device_id = auth.uid()::text);

CREATE POLICY "Reporter can read own reports" ON public.reports
  FOR SELECT TO authenticated
  USING (reporter_device_id = auth.uid()::text);

-- =============================================
-- NEW POLICIES: profiles (public read, owner write)
-- =============================================
CREATE POLICY "Anyone authenticated can read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner can insert profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (device_id = auth.uid()::text);

CREATE POLICY "Owner can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (device_id = auth.uid()::text);

-- =============================================
-- NEW POLICIES: reels (public read, owner write)
-- =============================================
CREATE POLICY "Anyone authenticated can read reels" ON public.reels
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner can create reels" ON public.reels
  FOR INSERT TO authenticated
  WITH CHECK (device_id = auth.uid()::text);

-- =============================================
-- NEW POLICIES: reel_comments (public read, owner write)
-- =============================================
CREATE POLICY "Anyone authenticated can read reel comments" ON public.reel_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner can create reel comments" ON public.reel_comments
  FOR INSERT TO authenticated
  WITH CHECK (device_id = auth.uid()::text);

-- =============================================
-- STORAGE: Fix profile-photos policies
-- =============================================
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Public read for profile photos (avatars need to be visible)
CREATE POLICY "Public can view profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

-- Owner can upload to their own folder
CREATE POLICY "Owner can upload profile photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Owner can update their own photos
CREATE POLICY "Owner can update profile photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Owner can delete their own photos
CREATE POLICY "Owner can delete profile photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
