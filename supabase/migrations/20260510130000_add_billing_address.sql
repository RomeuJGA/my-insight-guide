ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS billing_address TEXT;
