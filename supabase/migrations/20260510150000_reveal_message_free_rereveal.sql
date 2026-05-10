-- Mensagens já reveladas são devolvidas gratuitamente.
-- Remove o fluxo de confirmação (force=true) — _force mantido apenas para compatibilidade.
CREATE OR REPLACE FUNCTION public.reveal_message(
  _user_id    uuid,
  _message_id integer,
  _force      boolean DEFAULT false
)
RETURNS TABLE(content text, credits integer, already_revealed boolean, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_was_revealed boolean := false;
  v_message      public.messages%ROWTYPE;
  v_balance      integer;
BEGIN
  SELECT * INTO v_message FROM public.messages m WHERE m.id = _message_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::text, NULL::integer, false, 'not_found'::text;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.message_reveals mr
    WHERE mr.user_id = _user_id AND mr.message_id = _message_id
  ) THEN
    v_was_revealed := true;
  END IF;

  -- Already revealed: return content for free, no credit charge
  IF v_was_revealed THEN
    SELECT uc.credits INTO v_balance FROM public.user_credits uc WHERE uc.user_id = _user_id;
    RETURN QUERY SELECT v_message.content, COALESCE(v_balance, 0), true, 'ok'::text;
    RETURN;
  END IF;

  -- First reveal: charge 1 credit
  UPDATE public.user_credits AS uc
  SET credits = uc.credits - 1, updated_at = now()
  WHERE uc.user_id = _user_id AND uc.credits > 0
  RETURNING uc.credits INTO v_balance;

  IF v_balance IS NULL THEN
    RETURN QUERY SELECT NULL::text, 0, false, 'no_credits'::text;
    RETURN;
  END IF;

  INSERT INTO public.message_reveals (user_id, message_id)
  VALUES (_user_id, _message_id)
  ON CONFLICT (user_id, message_id) DO NOTHING;

  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (_user_id, 'usage', -1, 'Mensagem #' || _message_id);

  RETURN QUERY SELECT v_message.content, v_balance, false, 'ok'::text;
END;
$$;
