-- Add file size limit and MIME type restrictions to the avatars bucket
-- This prevents storage abuse and ensures only valid image files are uploaded
UPDATE storage.buckets
SET 
  file_size_limit = 2097152, -- 2MB for profile photos
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'avatars';