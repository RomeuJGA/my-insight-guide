CREATE OR REPLACE FUNCTION public.grant_welcome_credit_if_eligible(_user_id uuid)
 RETURNS TABLE(granted boolean, credits integer, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email_confirmed timestamptz;
  v_balance integer;
BEGIN
  SELECT email_confirmed_at INTO v_email_confirmed
  FROM auth.users
  WHERE id = _user_id;

  IF v_email_confirmed IS NULL THEN
    SELECT uc.credits INTO v_balance FROM public.user_credits uc WHERE uc.user_id = _user_id;
    RETURN QUERY SELECT false, COALESCE(v_balance, 0), 'email_not_verified'::text;
    RETURN;
  END IF;

  BEGIN
    INSERT INTO public.welcome_credit_grants (user_id) VALUES (_user_id);
  EXCEPTION WHEN unique_violation THEN
    SELECT uc.credits INTO v_balance FROM public.user_credits uc WHERE uc.user_id = _user_id;
    RETURN QUERY SELECT false, COALESCE(v_balance, 0), 'already_granted'::text;
    RETURN;
  END;

  INSERT INTO public.user_credits AS uc (user_id, credits)
  VALUES (_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET credits = uc.credits + 1,
        updated_at = now()
  RETURNING uc.credits INTO v_balance;

  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (_user_id, 'welcome', 1, 'Crédito gratuito de boas-vindas');

  RETURN QUERY SELECT true, v_balance, 'granted'::text;
END;
$function$;