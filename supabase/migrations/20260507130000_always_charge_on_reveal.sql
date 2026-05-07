-- Modify reveal_message so re-revealing the same message always costs 1 credit.
-- When _force=false and the message was already revealed, returns status='already_revealed'
-- so the client can show a confirmation dialog before charging.
-- When _force=true, charges regardless of prior reveal history.

CREATE OR REPLACE FUNCTION public.reveal_message(
  _user_id uuid,
  _message_id integer,
  _force boolean DEFAULT false
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

  -- Signal client to confirm before charging (first-time check only)
  IF v_was_revealed AND NOT _force THEN
    SELECT uc.credits INTO v_balance FROM public.user_credits uc WHERE uc.user_id = _user_id;
    RETURN QUERY SELECT NULL::text, COALESCE(v_balance, 0), true, 'already_revealed'::text;
    RETURN;
  END IF;

  -- Charge 1 credit (new or forced re-reveal)
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

  RETURN QUERY SELECT v_message.content, v_balance, v_was_revealed, 'ok'::text;
END;
$$;
