-- =========================================
-- USER CREDITS TABLE
-- =========================================
CREATE TABLE public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT credits_non_negative CHECK (credits >= 0)
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can read their own balance
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all balances
CREATE POLICY "Admins can view all credits"
ON public.user_credits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- No direct writes from clients (server-side only via SECURITY DEFINER functions)
CREATE POLICY "No direct insert on user_credits"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct update on user_credits"
ON public.user_credits
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No direct delete on user_credits"
ON public.user_credits
FOR DELETE
TO authenticated
USING (false);

-- =========================================
-- CREDIT TRANSACTIONS TABLE
-- =========================================
CREATE TYPE public.credit_tx_type AS ENUM ('purchase', 'usage', 'admin', 'welcome');

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.credit_tx_type NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_tx_user_created ON public.credit_transactions (user_id, created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.credit_transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- No direct writes from clients
CREATE POLICY "No direct insert on credit_transactions"
ON public.credit_transactions
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct update on credit_transactions"
ON public.credit_transactions
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No direct delete on credit_transactions"
ON public.credit_transactions
FOR DELETE
TO authenticated
USING (false);

-- =========================================
-- ATOMIC CONSUME FUNCTION
-- =========================================
CREATE OR REPLACE FUNCTION public.consume_one_credit(
  _user_id UUID,
  _description TEXT DEFAULT 'Mensagem revelada'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Ensure row exists
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Atomic decrement; check >0 in WHERE so no row updates if no credits
  UPDATE public.user_credits
  SET credits = credits - 1, updated_at = now()
  WHERE user_id = _user_id AND credits > 0
  RETURNING credits INTO new_balance;

  IF new_balance IS NULL THEN
    RETURN -1; -- caller interprets as "no credits"
  END IF;

  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (_user_id, 'usage', -1, _description);

  RETURN new_balance;
END;
$$;

-- =========================================
-- ADD CREDITS FUNCTION
-- =========================================
CREATE OR REPLACE FUNCTION public.add_credits(
  _user_id UUID,
  _amount INTEGER,
  _type public.credit_tx_type,
  _description TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  IF _amount = 0 THEN
    RAISE EXCEPTION 'Amount cannot be zero';
  END IF;

  INSERT INTO public.user_credits (user_id, credits)
  VALUES (_user_id, GREATEST(_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
    SET credits = GREATEST(public.user_credits.credits + _amount, 0),
        updated_at = now()
  RETURNING credits INTO new_balance;

  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (_user_id, _type, _amount, _description);

  RETURN new_balance;
END;
$$;

-- =========================================
-- WELCOME CREDITS TRIGGER (3 credits for new users)
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 3)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (NEW.id, 'welcome', 3, 'Créditos de boas-vindas');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_credits
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- =========================================
-- BACKFILL EXISTING USERS (give them 3 welcome credits)
-- =========================================
INSERT INTO public.user_credits (user_id, credits)
SELECT id, 3 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.credit_transactions (user_id, type, amount, description)
SELECT u.id, 'welcome', 3, 'Créditos de boas-vindas (retroativo)'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.credit_transactions t
  WHERE t.user_id = u.id AND t.type = 'welcome'
);