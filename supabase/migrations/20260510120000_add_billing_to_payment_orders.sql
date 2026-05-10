-- Add billing fields to payment_orders for invoice requests
ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS billing_name TEXT,
  ADD COLUMN IF NOT EXISTS billing_nif  TEXT;
