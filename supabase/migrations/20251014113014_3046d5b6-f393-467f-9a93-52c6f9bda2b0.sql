-- Add video call support to mentoring_sessions table
ALTER TABLE public.mentoring_sessions
ADD COLUMN IF NOT EXISTS video_room_url TEXT,
ADD COLUMN IF NOT EXISTS video_room_name TEXT,
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS session_completed_at TIMESTAMP WITH TIME ZONE;

-- Add new session status if needed (in_progress)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'session_status'
  ) THEN
    CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
  ELSE
    -- Add in_progress to existing enum if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'in_progress' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'session_status')
    ) THEN
      ALTER TYPE session_status ADD VALUE 'in_progress' AFTER 'confirmed';
    END IF;
  END IF;
END $$;

-- Create index for faster video room lookups
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_video_room 
ON public.mentoring_sessions(video_room_name) 
WHERE video_room_name IS NOT NULL;