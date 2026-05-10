CREATE TABLE public.contact_requests (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  subject     TEXT        NOT NULL DEFAULT 'general'
                CHECK (subject IN ('general', 'consultation')),
  message     TEXT        NOT NULL,
  preferred_date TEXT,
  preferred_time TEXT,
  status      TEXT        NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'read', 'replied')),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact requests"
  ON public.contact_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage contact requests"
  ON public.contact_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );
