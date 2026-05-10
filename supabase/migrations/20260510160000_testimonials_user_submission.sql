-- Add user submission support to testimonials.
-- Existing rows keep status='approved'; new user submissions default to 'pending'.

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status  TEXT NOT NULL DEFAULT 'approved'
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Drop existing SELECT policy and recreate to include status filter
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials"      ON public.testimonials;
DROP POLICY IF EXISTS "Users can submit testimonials"       ON public.testimonials;
DROP POLICY IF EXISTS "Users can view own testimonials"     ON public.testimonials;

-- Public: active + approved only
CREATE POLICY "Public can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (active = true AND status = 'approved');

-- Admins: full access (SELECT bypasses the public policy above)
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
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

-- Authenticated users: INSERT own testimonial (always pending + inactive)
CREATE POLICY "Users can submit testimonials"
  ON public.testimonials FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status  = 'pending'
    AND active  = false
  );

-- Authenticated users: SELECT their own (any status)
CREATE POLICY "Users can view own testimonials"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
