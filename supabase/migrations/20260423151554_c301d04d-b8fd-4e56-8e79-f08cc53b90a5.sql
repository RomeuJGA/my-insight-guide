-- Private messages table
CREATE TABLE public.messages (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 534),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Deny all direct access from clients. The edge function uses the
-- service role key which bypasses RLS, so it can still read.
CREATE POLICY "No direct read access to messages"
  ON public.messages FOR SELECT
  USING (false);

CREATE POLICY "No direct insert access to messages"
  ON public.messages FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update access to messages"
  ON public.messages FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete access to messages"
  ON public.messages FOR DELETE
  USING (false);