DROP FUNCTION IF EXISTS public.get_or_create_daily_message(uuid);

CREATE OR REPLACE FUNCTION public.get_or_create_daily_message(_user_id uuid)
 RETURNS TABLE(content text, message_date date)
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

    INSERT INTO public.daily_messages (user_id, message_id, shown_date)
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