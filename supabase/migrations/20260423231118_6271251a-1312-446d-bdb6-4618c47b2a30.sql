CREATE OR REPLACE FUNCTION public.reveal_message(_user_id uuid, _message_id integer)
 RETURNS TABLE(content text, credits integer, already_revealed boolean, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_existing public.message_reveals%ROWTYPE;
  v_message public.messages%ROWTYPE;
  v_balance integer;
BEGIN
  SELECT * INTO v_message FROM public.messages m WHERE m.id = _message_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::text, NULL::integer, false, 'not_found'::text;
    RETURN;
  END IF;

  SELECT * INTO v_existing
  FROM public.message_reveals mr
  WHERE mr.user_id = _user_id AND mr.message_id = _message_id;

  IF FOUND THEN
    SELECT uc.credits INTO v_balance FROM public.user_credits uc WHERE uc.user_id = _user_id;
    RETURN QUERY SELECT v_message.content, COALESCE(v_balance, 0), true, 'ok'::text;
    RETURN;
  END IF;

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
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_daily_message(_user_id uuid)
 RETURNS TABLE(content text, shown_date date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_today date := (now() AT TIME ZONE 'Europe/Lisbon')::date;
  v_message_id integer;
  v_content text;
BEGIN
  SELECT dm.message_id INTO v_message_id
  FROM public.daily_messages dm
  WHERE dm.user_id = _user_id AND dm.shown_date = v_today;

  IF v_message_id IS NULL THEN
    SELECT m.id INTO v_message_id
    FROM public.messages m
    ORDER BY random()
    LIMIT 1;

    IF v_message_id IS NULL THEN
      RAISE EXCEPTION 'Nenhuma mensagem disponível.';
    END IF;

    INSERT INTO public.daily_messages AS dm (user_id, message_id, shown_date)
    VALUES (_user_id, v_message_id, v_today)
    ON CONFLICT (user_id, shown_date) DO NOTHING;

    SELECT dm.message_id INTO v_message_id
    FROM public.daily_messages dm
    WHERE dm.user_id = _user_id AND dm.shown_date = v_today;
  END IF;

  SELECT m.content INTO v_content
  FROM public.messages m
  WHERE m.id = v_message_id;

  RETURN QUERY SELECT v_content, v_today;
END;
$function$;