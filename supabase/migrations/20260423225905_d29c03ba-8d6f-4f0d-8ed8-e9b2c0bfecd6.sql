-- 1. Tabela de mensagens reveladas
CREATE TABLE public.message_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message_id integer NOT NULL,
  revealed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);

CREATE INDEX idx_message_reveals_user ON public.message_reveals(user_id, revealed_at DESC);

ALTER TABLE public.message_reveals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reveals"
  ON public.message_reveals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reveals"
  ON public.message_reveals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No direct insert on message_reveals"
  ON public.message_reveals FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update on message_reveals"
  ON public.message_reveals FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No direct delete on message_reveals"
  ON public.message_reveals FOR DELETE
  TO authenticated
  USING (false);

-- 2. Tabela de atribuição de créditos de boas-vindas
CREATE TABLE public.welcome_credit_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  granted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.welcome_credit_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own welcome grant"
  ON public.welcome_credit_grants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all welcome grants"
  ON public.welcome_credit_grants FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No direct insert on welcome_credit_grants"
  ON public.welcome_credit_grants FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update on welcome_credit_grants"
  ON public.welcome_credit_grants FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No direct delete on welcome_credit_grants"
  ON public.welcome_credit_grants FOR DELETE
  TO authenticated
  USING (false);

-- 3. RPC: revelar mensagem (idempotente, sem consumir crédito se já revelada)
-- Retorna: (content text, credits int, already_revealed bool, status text)
--   status: 'ok' | 'no_credits' | 'not_found'
CREATE OR REPLACE FUNCTION public.reveal_message(_user_id uuid, _message_id integer)
RETURNS TABLE (content text, credits integer, already_revealed boolean, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.message_reveals%ROWTYPE;
  v_message public.messages%ROWTYPE;
  v_balance integer;
BEGIN
  SELECT * INTO v_message FROM public.messages WHERE id = _message_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::text, NULL::integer, false, 'not_found'::text;
    RETURN;
  END IF;

  -- Já revelada antes? devolve sem cobrar
  SELECT * INTO v_existing
  FROM public.message_reveals
  WHERE user_id = _user_id AND message_id = _message_id;

  IF FOUND THEN
    SELECT uc.credits INTO v_balance FROM public.user_credits uc WHERE uc.user_id = _user_id;
    RETURN QUERY SELECT v_message.content, COALESCE(v_balance, 0), true, 'ok'::text;
    RETURN;
  END IF;

  -- Consumir 1 crédito atomicamente
  UPDATE public.user_credits
  SET credits = credits - 1, updated_at = now()
  WHERE user_id = _user_id AND credits > 0
  RETURNING credits INTO v_balance;

  IF v_balance IS NULL THEN
    RETURN QUERY SELECT NULL::text, 0, false, 'no_credits'::text;
    RETURN;
  END IF;

  -- Registar reveal (UNIQUE protege double-click)
  INSERT INTO public.message_reveals (user_id, message_id)
  VALUES (_user_id, _message_id)
  ON CONFLICT (user_id, message_id) DO NOTHING;

  -- Log da transação
  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (_user_id, 'usage', -1, 'Mensagem #' || _message_id);

  RETURN QUERY SELECT v_message.content, v_balance, false, 'ok'::text;
END;
$$;

-- 4. RPC: atribuir crédito de boas-vindas (só se email verificado e ainda não recebido)
-- Retorna: (granted bool, credits int, reason text)
--   reason: 'granted' | 'already_granted' | 'email_not_verified'
CREATE OR REPLACE FUNCTION public.grant_welcome_credit_if_eligible(_user_id uuid)
RETURNS TABLE (granted boolean, credits integer, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_confirmed timestamptz;
  v_balance integer;
BEGIN
  -- Verificar email confirmado em auth.users
  SELECT email_confirmed_at INTO v_email_confirmed
  FROM auth.users
  WHERE id = _user_id;

  IF v_email_confirmed IS NULL THEN
    SELECT uc.credits INTO v_balance FROM public.user_credits uc WHERE uc.user_id = _user_id;
    RETURN QUERY SELECT false, COALESCE(v_balance, 0), 'email_not_verified'::text;
    RETURN;
  END IF;

  -- Tentar registar a atribuição (UNIQUE garante uma só vez)
  BEGIN
    INSERT INTO public.welcome_credit_grants (user_id) VALUES (_user_id);
  EXCEPTION WHEN unique_violation THEN
    SELECT uc.credits INTO v_balance FROM public.user_credits uc WHERE uc.user_id = _user_id;
    RETURN QUERY SELECT false, COALESCE(v_balance, 0), 'already_granted'::text;
    RETURN;
  END;

  -- Atribuir 1 crédito
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET credits = public.user_credits.credits + 1,
        updated_at = now()
  RETURNING credits INTO v_balance;

  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (_user_id, 'welcome', 1, 'Crédito gratuito de boas-vindas');

  RETURN QUERY SELECT true, v_balance, 'granted'::text;
END;
$$;

-- 5. Atualizar trigger handle_new_user_credits — deixar de dar 3 créditos automáticos
-- Apenas inicializa a linha em user_credits a 0; o crédito de boas-vindas vem após verificação.
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;