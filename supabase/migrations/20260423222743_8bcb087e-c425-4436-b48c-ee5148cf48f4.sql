
-- Payment orders table
CREATE TABLE public.payment_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  payment_method TEXT NOT NULL,
  package TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  ifthenpay_request_id TEXT,
  ifthenpay_reference TEXT,
  ifthenpay_entity TEXT,
  ifthenpay_payment_url TEXT,
  mbway_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON public.payment_orders(status);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment orders"
ON public.payment_orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment orders"
ON public.payment_orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No direct insert on payment_orders"
ON public.payment_orders
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct update on payment_orders"
ON public.payment_orders
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No direct delete on payment_orders"
ON public.payment_orders
FOR DELETE
TO authenticated
USING (false);

-- Atomic, idempotent: mark order paid + add credits + log transaction.
-- Returns the user's new credit balance, or -1 if already processed.
CREATE OR REPLACE FUNCTION public.mark_order_paid_and_credit(
  _order_id TEXT,
  _ifthenpay_request_id TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_credits INTEGER;
  v_method TEXT;
  v_package TEXT;
  v_status TEXT;
  v_new_balance INTEGER;
BEGIN
  -- Lock the row to avoid race conditions on duplicate callbacks
  SELECT user_id, credits, payment_method, package, status
    INTO v_user_id, v_credits, v_method, v_package, v_status
  FROM public.payment_orders
  WHERE order_id = _order_id
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', _order_id;
  END IF;

  -- Idempotency: already paid
  IF v_status = 'paid' THEN
    RETURN -1;
  END IF;

  UPDATE public.payment_orders
  SET status = 'paid',
      paid_at = now(),
      ifthenpay_request_id = COALESCE(_ifthenpay_request_id, ifthenpay_request_id)
  WHERE order_id = _order_id;

  -- Add credits atomically
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (v_user_id, v_credits)
  ON CONFLICT (user_id) DO UPDATE
    SET credits = public.user_credits.credits + v_credits,
        updated_at = now()
  RETURNING credits INTO v_new_balance;

  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (
    v_user_id,
    'purchase',
    v_credits,
    'Compra IfthenPay - ' || v_method || ' - ' || v_package
  );

  RETURN v_new_balance;
END;
$$;
