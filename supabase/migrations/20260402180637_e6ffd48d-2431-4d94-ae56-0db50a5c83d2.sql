
-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Allow anyone to read profile photos
CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Allow anyone to upload profile photos (anonymous app)
CREATE POLICY "Anyone can upload profile photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos');

-- Allow anyone to update their own photos
CREATE POLICY "Anyone can update profile photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos');

-- Allow anyone to delete profile photos
CREATE POLICY "Anyone can delete profile photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos');
