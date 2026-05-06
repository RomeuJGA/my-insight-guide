-- Add optional question field to message_reveals.
-- Users write their context/question before choosing a number.
-- Stored privately: only the owner can read or update it.

ALTER TABLE public.message_reveals ADD COLUMN question TEXT;

-- The original migration blocks all direct updates (USING false).
-- Replace it with a policy that lets users update only their own rows.
DROP POLICY "No direct update on message_reveals" ON public.message_reveals;

CREATE POLICY "Users can update their own reveals"
  ON public.message_reveals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
